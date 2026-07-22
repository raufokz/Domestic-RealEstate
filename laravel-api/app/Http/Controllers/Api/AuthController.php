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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:buyer,seller,agent,broker,investor',
            'phone' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => 'pending',
            'phone' => $validated['phone'] ?? null,
            'normalized_phone' => $validated['phone'] ? preg_replace('/[^\d]/', '', $validated['phone']) : null,
        ]);

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
