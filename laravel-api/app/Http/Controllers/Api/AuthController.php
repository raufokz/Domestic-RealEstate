<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuthLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request) {
        if (!$request->has('name') || trim((string)$request->input('name')) === '') {
            $firstName = $request->input('firstName') ?? $request->input('first_name') ?? '';
            $lastName = $request->input('lastName') ?? $request->input('last_name') ?? '';
            $composedName = trim($firstName . ' ' . $lastName);
            if ($composedName !== '') {
                $request->merge(['name' => $composedName]);
            }
        }

        if (!$request->has('password_confirmation')) {
            $confirmPass = $request->input('confirmPassword') ?? $request->input('confirm_password');
            if ($confirmPass) {
                $request->merge(['password_confirmation' => $confirmPass]);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            // Staff/admin roles are never self-service — they can only be
            // granted by an authenticated admin action. Accepting them here
            // was a live privilege-escalation hole (anyone could POST
            // role=super_admin and get one).
            'role' => 'required|in:buyer,seller,agent,broker,investor',
            'phone' => 'nullable|string',
            'services_needed' => 'nullable|array',
            'services_needed.*' => 'string|in:' . implode(',', \App\Models\AgentProfile::serviceCatalogFlat()),
            'pricing_plan' => 'nullable|string|in:' . implode(',', array_keys(\App\Models\AgentProfile::PLAN_TIERS)),
            'billing_cycle' => 'nullable|string|in:monthly,annual',
        ]);

        // Enforce each plan's service cap/category rules server-side — the
        // register form already restricts checkboxes to match, but a request
        // built by hand could otherwise pick more/other services than the
        // chosen (and eventually billed) plan actually includes.
        if (in_array($validated['role'], ['agent', 'broker']) && !empty($validated['services_needed'])) {
            $planName = $validated['pricing_plan'] ?? null;
            $tier = \App\Models\AgentProfile::PLAN_TIERS[$planName] ?? null;
            if ($tier) {
                if ($tier['cap'] !== null && count($validated['services_needed']) > $tier['cap']) {
                    throw ValidationException::withMessages([
                        'services_needed' => "The {$planName} plan allows up to {$tier['cap']} services — you selected " . count($validated['services_needed']) . '.',
                    ]);
                }
                $allowed = \App\Models\AgentProfile::planAllowedServices($planName);
                if ($allowed !== null) {
                    $invalid = array_diff($validated['services_needed'], $allowed);
                    if (!empty($invalid)) {
                        throw ValidationException::withMessages([
                            'services_needed' => "The {$planName} plan doesn't include: " . implode(', ', $invalid) . '.',
                        ]);
                    }
                }
            }
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => 'pending',
            'phone' => $validated['phone'] ?? null,
            'normalized_phone' => !empty($validated['phone']) ? preg_replace('/[^\d]/', '', $validated['phone']) : null,
        ]);

        // If registering as an agent or broker, create an AgentProfile —
        // but NOT approved/published, and NEVER with a fabricated license
        // number. A real license number is only ever set once an admin has
        // verified it (see RealtorApplicationController / AgentProfile
        // verification queue) — self-registration alone must never produce
        // a profile that looks verified.
        if (in_array($validated['role'], ['agent', 'broker'])) {
            $zipRaw = $request->input('zipcodes') ?? $request->input('service_areas_zipcodes') ?? '';
            $zipcodes = array_filter(array_map('trim', explode(',', (string)$zipRaw)));
            $licenseNumber = $request->input('licenseNumber');

            \App\Models\AgentProfile::create([
                'user_id' => $user->id,
                'slug' => \Illuminate\Support\Str::slug($user->name) . '-' . \Illuminate\Support\Str::random(4),
                'headline' => 'Local Real Estate Specialist',
                'bio' => 'Dedicated local real estate partner specializing in buyer, seller, and investor client requirements.',
                'brokerage_name' => $request->input('brokerage') ?? 'Domestic Real Estate Brokerage',
                'license_number' => $licenseNumber ? (string) $licenseNumber : null,
                'license_status' => 'pending',
                'specialties' => $validated['services_needed'] ?? [],
                'service_areas' => array_values($zipcodes),
                'lead_type_preferences' => [
                    'budget' => $request->input('monthly_budget') ?? 'Not Specified',
                    'leads' => (array)($request->input('preferred_leads') ?? []),
                    'pricing_plan' => $validated['pricing_plan'] ?? 'Solo',
                    'billing_cycle' => $validated['billing_cycle'] ?? 'monthly',
                ],
                'status' => 'pending',
                'is_published' => false,
            ]);
        }

        AuthLog::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'type' => 'register',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent() ?? '',
            'success' => true,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Registration successful. Please verify your email.',
        ], 201);
    }

    public function login(Request $request) {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();
        $ip = $request->ip();
        $ua = $request->userAgent() ?? '';

        if (!$user || !Hash::check($request->password, $user->password)) {
            AuthLog::create([
                'email' => $request->email,
                'type' => 'login',
                'ip_address' => $ip,
                'user_agent' => $ua,
                'success' => false,
                'failure_reason' => 'invalid_credentials',
            ]);
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status === 'suspended') {
            AuthLog::create([
                'user_id' => $user->id,
                'email' => $user->email,
                'type' => 'login',
                'ip_address' => $ip,
                'user_agent' => $ua,
                'success' => false,
                'failure_reason' => 'account_suspended',
            ]);
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended.'],
            ]);
        }

        $user->update(['last_login_at' => now()]);
        $token = $user->createToken('auth-token')->plainTextToken;

        AuthLog::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'type' => 'login',
            'ip_address' => $ip,
            'user_agent' => $ua,
            'success' => true,
        ]);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function refresh(Request $request) {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;
        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function me(Request $request) {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request) {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string',
            'timezone' => 'sometimes|string',
            'locale' => 'sometimes|string',
        ]);

        $user->update($validated);
        return response()->json(['user' => $user->fresh()]);
    }

    public function changePassword(Request $request) {
        $user = $request->user();
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Your current password is incorrect.'],
            ]);
        }

        $user->forceFill(['password' => Hash::make($validated['password'])])->save();

        AuthLog::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'type' => 'password_change',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent() ?? '',
            'success' => true,
        ]);

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function uploadAvatar(Request $request) {
        $request->validate(['avatar' => 'required|image|max:2048']);
        $path = $request->file('avatar')->store('avatars', 'public');
        $request->user()->update(['avatar' => $path]);
        return response()->json(['avatar' => $path]);
    }

    public function forgotPassword(Request $request) {
        $request->validate(['email' => 'required|email']);
        $status = Password::sendResetLink($request->only('email'));
        return response()->json(['message' => $status]);
    }

    public function resetPassword(Request $request) {
        // The reset-password page sends newPassword/confirmPassword — same
        // alias pattern already used in register() above.
        if (!$request->has('password') && $request->has('newPassword')) {
            $request->merge(['password' => $request->input('newPassword')]);
        }
        if (!$request->has('password_confirmation') && $request->has('confirmPassword')) {
            $request->merge(['password_confirmation' => $request->input('confirmPassword')]);
        }

        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset($request->only('email', 'password', 'token', 'password_confirmation'), function ($user, $password) {
            $user->forceFill(['password' => Hash::make($password)])->save();
        });

        return response()->json(['message' => $status]);
    }

    public function sendOtp(Request $request) {
        $request->validate(['phone' => 'required|string']);
        $otp = rand(100000, 999999);
        cache()->put("otp:{$request->phone}", $otp, now()->addMinutes(10));
        return response()->json(['message' => 'OTP sent successfully', 'otp_dev' => $otp]);
    }

    public function verifyOtp(Request $request) {
        $request->validate(['phone' => 'required|string', 'otp' => 'required|string']);
        $cached = cache()->get("otp:{$request->phone}");
        if ($cached && $cached == $request->otp) {
            cache()->forget("otp:{$request->phone}");
            $user = User::where('normalized_phone', preg_replace('/[^\d]/', '', $request->phone))->first();
            if ($user) {
                $user->update(['phone_verified' => true]);
            }
            return response()->json(['message' => 'OTP verified successfully']);
        }
        throw ValidationException::withMessages(['otp' => ['Invalid OTP']]);
    }
}
