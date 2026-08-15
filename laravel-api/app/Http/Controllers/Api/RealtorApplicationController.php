<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\RealtorApplicationApproved;
use App\Mail\RealtorApplicationStatusUpdated;
use App\Models\AgentProfile;
use App\Models\RealtorApplication;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

/**
 * Admin review queue for RealtorApplication (submitted by
 * FormSubmissionController::submitRealtorApplication). This is the real
 * replacement for the admin/realtors page's previous MOCK_REALTORS —
 * approve/reject/request-more-info here are the only way a realtor
 * application ever turns into a real, logged-in agent account.
 */
class RealtorApplicationController extends Controller
{
    private function checkAdmin(): void
    {
        $user = Auth::user();
        if (!$user || !in_array($user->role, ['staff', 'admin', 'super_admin'])) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $this->checkAdmin();

        $query = RealtorApplication::query();

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('license_number', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%");
            });
        }

        $applications = $query->orderByDesc('submitted_at')
            ->paginate(min((int) $request->get('per_page', 20), 100));

        return response()->json($applications);
    }

    public function show(int $id): JsonResponse
    {
        $this->checkAdmin();

        return ApiResponse::ok(RealtorApplication::with('reviewer:id,name')->findOrFail($id));
    }

    public function downloadDocument(int $id, string $type)
    {
        $this->checkAdmin();
        $application = RealtorApplication::findOrFail($id);

        $path = match ($type) {
            'id' => $application->id_document_path,
            'license' => $application->license_document_path,
            default => null,
        };

        if (!$path || !\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
            abort(404, 'Document not found.');
        }

        return response()->download(storage_path('app/public/' . $path));
    }

    /** Public — applicants check their own status without logging in. */
    public function status(string $reference): JsonResponse
    {
        $application = RealtorApplication::where('reference', $reference)->first();

        if (!$application) {
            return ApiResponse::fail('No application found for that reference.', 'not_found', 404);
        }

        return ApiResponse::ok([
            'reference' => $application->reference,
            'status' => $application->status,
            'review_notes' => in_array($application->status, ['rejected', 'more_info_requested'], true) ? $application->review_notes : null,
            'submitted_at' => $application->submitted_at,
            'reviewed_at' => $application->reviewed_at,
        ]);
    }

    /**
     * Public — applicant resubmits documents after a more_info_requested
     * status. Gated by reference + matching email (no login exists yet at
     * this stage), not open to arbitrary edits.
     */
    public function resubmit(Request $request, string $reference): JsonResponse
    {
        $application = RealtorApplication::where('reference', $reference)->first();

        if (!$application) {
            return ApiResponse::fail('No application found for that reference.', 'not_found', 404);
        }

        if ($application->status !== 'more_info_requested') {
            return ApiResponse::fail('This application is not awaiting additional information.', 'invalid_state', 422);
        }

        $validated = $request->validate([
            'email' => 'required|email',
            'id_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'license_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'note' => 'nullable|string|max:2000',
        ]);

        if (strcasecmp($validated['email'], $application->email) !== 0) {
            return ApiResponse::fail('Email does not match this application.', 'email_mismatch', 422);
        }

        if ($request->hasFile('id_document')) {
            $application->id_document_path = $request->file('id_document')->store('realtor-applications', 'public');
        }
        if ($request->hasFile('license_document')) {
            $application->license_document_path = $request->file('license_document')->store('realtor-applications', 'public');
        }

        $application->status = 'pending';
        $application->review_notes = $validated['note'] ?? $application->review_notes;
        $application->save();

        return ApiResponse::ok($application->fresh(), 'Additional information submitted — your application is back in the review queue.');
    }

    public function approve(int $id): JsonResponse
    {
        $this->checkAdmin();
        $application = RealtorApplication::findOrFail($id);

        if ($application->status === 'approved') {
            return ApiResponse::fail('Already approved.', 'already_approved', 422);
        }

        if (User::where('email', $application->email)->exists()) {
            return ApiResponse::fail('A user with this email already exists — cannot auto-create an account.', 'email_taken', 422);
        }

        $user = DB::transaction(function () use ($application) {
            $user = User::create([
                'name' => $application->full_name,
                'email' => $application->email,
                'password' => Hash::make(Str::random(32)), // unusable until reset via the emailed link
                'role' => 'agent',
                'status' => 'active',
                'phone' => $application->phone,
                'email_verified_at' => now(),
                'avatar' => $application->profile_photo_path,
            ]);

            AgentProfile::create([
                'user_id' => $user->id,
                'slug' => Str::slug($user->name) . '-' . Str::random(4),
                'headline' => 'Licensed Real Estate Agent',
                'brokerage_name' => $application->brokerage_name,
                'license_number' => $application->license_number,
                'license_state' => $application->license_state,
                'license_status' => 'active',
                'profile_photo' => $application->profile_photo_path,
                'service_areas' => $application->zip_codes ?? [],
                'lead_type_preferences' => $application->lead_type_preferences ?? [],
                'languages' => $application->languages_spoken ?? [],
                'office_zip' => $application->zip_codes[0] ?? null,
                'status' => 'approved',
                'is_published' => true,
                'approved_at' => now(),
                'verified_by' => Auth::id(),
                'verified_at' => now(),
            ]);

            $application->update([
                'status' => 'approved',
                'reviewer_id' => Auth::id(),
                'reviewed_at' => now(),
                'created_user_id' => $user->id,
            ]);

            return $user;
        });

        $token = Password::broker()->createToken($user);
        $setPasswordUrl = rtrim(config('app.frontend_url'), '/') . '/reset-password?token=' . $token;

        Mail::to($user->email)->queue(new RealtorApplicationApproved($user, $setPasswordUrl));

        return ApiResponse::ok(['user_id' => $user->id, 'application' => $application->fresh()], 'Application approved — account created.');
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $this->checkAdmin();
        $application = RealtorApplication::findOrFail($id);

        $validated = $request->validate(['notes' => 'required|string|min:5']);

        $application->update([
            'status' => 'rejected',
            'reviewer_id' => Auth::id(),
            'reviewed_at' => now(),
            'review_notes' => $validated['notes'],
        ]);

        Mail::to($application->email)->queue(new RealtorApplicationStatusUpdated($application));

        return ApiResponse::ok($application->fresh(), 'Application rejected.');
    }

    public function requestMoreInfo(Request $request, int $id): JsonResponse
    {
        $this->checkAdmin();
        $application = RealtorApplication::findOrFail($id);

        $validated = $request->validate(['notes' => 'required|string|min:5']);

        $application->update([
            'status' => 'more_info_requested',
            'reviewer_id' => Auth::id(),
            'reviewed_at' => now(),
            'review_notes' => $validated['notes'],
        ]);

        Mail::to($application->email)->queue(new RealtorApplicationStatusUpdated($application));

        return ApiResponse::ok($application->fresh(), 'Requested more information from applicant.');
    }
}
