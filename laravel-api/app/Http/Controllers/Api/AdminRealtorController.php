<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgentDocument;
use App\Models\AgentProfile;
use App\Models\AgentProfileAudit;
use App\Models\Lead;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminRealtorController extends Controller
{
    /** Admin permission guard check. */
    private function checkAdmin(): void
    {
        $user = auth()->user();
        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    /** List all Realtor profiles with searching, filtering, and pagination. */
    public function index(Request $request): JsonResponse
    {
        $this->checkAdmin();

        $query = AgentProfile::with(['user', 'verifiedByAdmin']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by license status
        if ($request->filled('license_status')) {
            $query->where('license_status', $request->license_status);
        }

        // Filter by state
        if ($request->filled('state')) {
            $query->where('office_state', $request->state);
        }

        // Search query across name, email, brokerage, license #, phone
        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('headline', 'like', $search)
                  ->orWhere('brokerage_name', 'like', $search)
                  ->orWhere('license_number', 'like', $search)
                  ->orWhere('office_city', 'like', $search)
                  ->orWhere('office_state', 'like', $search)
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', $search)
                        ->orWhere('email', 'like', $search)
                        ->orWhere('phone', 'like', $search);
                  });
            });
        }

        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'rating_desc':
                $query->orderByDesc('rating');
                break;
            case 'sales_desc':
                $query->orderByDesc('sales_count');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'newest':
            default:
                $query->orderByDesc('created_at');
                break;
        }

        $perPage = min((int) $request->get('per_page', 20), 100);
        $realtors = $query->paginate($perPage);

        return response()->json($realtors);
    }

    /** Get detailed profile of any Realtor (admin only). */
    public function show(int $id): JsonResponse
    {
        $this->checkAdmin();

        $profile = AgentProfile::with(['user', 'documents', 'audits.user', 'verifiedByAdmin'])->findOrFail($id);

        // Fetch counts for dashboard stats
        $activeListings = Property::where('realtor_id', $profile->user_id)->where('status', 'active')->count();
        $soldListings = Property::where('realtor_id', $profile->user_id)->where('status', 'sold')->count();
        $totalLeads = Lead::where('assigned_to', $profile->user_id)->count();

        $data = $profile->toArray();
        $data['stats'] = [
            'active_listings' => $activeListings,
            'sold_listings' => $soldListings,
            'total_leads' => $totalLeads,
        ];

        return response()->json($data);
    }

    /** Admin update any Realtor profile. */
    public function update(Request $request, int $id): JsonResponse
    {
        $this->checkAdmin();

        $profile = AgentProfile::findOrFail($id);
        $oldData = $profile->toArray();

        $validated = $request->validate([
            'headline' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'middle_name' => 'nullable|string|max:100',
            'preferred_name' => 'nullable|string|max:100',
            'dob' => 'nullable|date',
            'gender' => 'nullable|string|max:50',
            'ethnicity' => 'nullable|string|max:100',
            'nationality' => 'nullable|string|max:100',
            'timezone' => 'nullable|string|max:100',
            'brokerage_name' => 'nullable|string|max:255',
            'broker_name' => 'nullable|string|max:255',
            'brokerage_address' => 'nullable|string|max:255',
            'brokerage_website' => 'nullable|string|max:255',
            'brokerage_contact' => 'nullable|string|max:255',
            'license_number' => 'nullable|string|max:100',
            'license_state' => 'nullable|string|max:100',
            'license_expiry_date' => 'nullable|date',
            'license_status' => 'nullable|string|in:active,inactive,pending,suspended,expired',
            'mls_board' => 'nullable|string|max:255',
            'mls_number' => 'nullable|string|max:100',
            'years_experience' => 'nullable|integer|min:0',
            'nar_membership' => 'nullable|boolean',
            'realtor_membership' => 'nullable|boolean',
            'certifications' => 'nullable|array',
            'awards' => 'nullable|array',
            'designations' => 'nullable|array',
            'specialties' => 'nullable|array',
            'property_types' => 'nullable|array',
            'languages' => 'nullable|array',
            'service_areas' => 'nullable|array',
            'office_address' => 'nullable|string|max:255',
            'office_city' => 'nullable|string|max:100',
            'office_state' => 'nullable|string|max:100',
            'office_zip' => 'nullable|string|max:20',
            'office_country' => 'nullable|string|max:100',
            'office_phone' => 'nullable|string|max:50',
            'office_email' => 'nullable|email|max:255',
            'secondary_email' => 'nullable|email|max:255',
            'mobile_number' => 'nullable|string|max:50',
            'office_number' => 'nullable|string|max:50',
            'whatsapp_number' => 'nullable|string|max:50',
            'fax' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:255',
            'social_links' => 'nullable|array',
            'intro_video_url' => 'nullable|string|max:255',
            'office_photos' => 'nullable|array',
            'team_photos' => 'nullable|array',
            'property_portfolio_images' => 'nullable|array',
            'lead_type_preferences' => 'nullable|array',
            'partnership_type' => 'nullable|string|max:100',
            'e_signature' => 'nullable|string',
            'business_name' => 'nullable|string|max:255',
            'business_email' => 'nullable|email|max:255',
            'business_phone' => 'nullable|string|max:50',
            'office_hours' => 'nullable|array',
            'team_name' => 'nullable|string|max:255',
            'team_members' => 'nullable|array',
            'assistant_info' => 'nullable|array',
            'notification_preferences' => 'nullable|array',
            'privacy_settings' => 'nullable|array',
            'rating' => 'nullable|numeric|between:0,5',
            'review_count' => 'nullable|integer|min:0',
            'sales_count' => 'nullable|integer|min:0',
            'is_featured' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
        ]);

        $profile->update($validated);

        // Update linked user name/phone if provided
        if ($request->has('user_name') || $request->has('user_email')) {
            $user = $profile->user;
            if ($user) {
                $userUpdates = [];
                if ($request->filled('user_name')) $userUpdates['name'] = $request->user_name;
                if ($request->filled('user_email')) $userUpdates['email'] = $request->user_email;
                if ($request->filled('user_phone')) $userUpdates['phone'] = $request->user_phone;
                if (!empty($userUpdates)) $user->update($userUpdates);
            }
        }

        // Log audit diff
        $newDiff = array_diff_assoc(array_filter($profile->toArray(), fn($v) => !is_array($v)), array_filter($oldData, fn($v) => !is_array($v)));
        $profile->logAudit('admin_profile_update', 'profile', null, null, [
            'updated_fields' => array_keys($validated),
            'admin_user_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Realtor profile updated successfully by Admin',
            'data' => $profile->fresh(['user', 'documents', 'audits']),
        ]);
    }

    /** Admin-scoped mirror of AgentController::uploadMediaMe — same media
     * pipeline, but any agent's profile (by id) rather than the caller's own. */
    public function uploadMedia(Request $request, int $id): JsonResponse
    {
        $this->checkAdmin();

        $profile = AgentProfile::with('user')->findOrFail($id);

        $request->validate([
            'media_type' => 'required|in:profile_photo,cover_photo,company_logo,office_photos,team_photos,property_portfolio_images',
            'file' => 'required|file|image|max:10240',
        ]);

        $mediaType = $request->media_type;
        $path = $request->file('file')->store('agent-media/'.$mediaType, 'public');

        if (in_array($mediaType, ['profile_photo', 'cover_photo', 'company_logo'])) {
            $profile->update([$mediaType => $path]);
            if ($mediaType === 'profile_photo' && $profile->user) {
                $profile->user->update(['avatar' => $path]);
            }
        } else {
            $current = $profile->$mediaType ?? [];
            $current[] = $path;
            $profile->update([$mediaType => array_values($current)]);
        }

        $profile->logAudit('admin_media_upload', $mediaType, null, $path, [
            'admin_user_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Media uploaded successfully',
            'file_url' => $path,
            'data' => $profile->fresh(),
        ]);
    }

    /** Change verification status (Verify, Reject, Suspend, Reactivate). */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $this->checkAdmin();

        $request->validate([
            'status' => 'required|in:verified,pending,suspended,rejected',
            'rejection_reason' => 'nullable|string',
        ]);

        $profile = AgentProfile::findOrFail($id);
        $oldStatus = $profile->status;
        $newStatus = $request->status;

        $updateData = [
            'status' => $newStatus,
            'rejection_reason' => $newStatus === 'rejected' ? $request->rejection_reason : null,
        ];

        if ($newStatus === 'verified') {
            $updateData['approved_at'] = now();
            $updateData['verified_at'] = now();
            $updateData['verified_by'] = auth()->id();
            $updateData['is_published'] = true;
        } elseif ($newStatus === 'suspended') {
            $updateData['is_published'] = false;
        }

        $profile->update($updateData);

        // Update user status if suspended
        if ($profile->user) {
            $profile->user->update([
                'status' => $newStatus === 'suspended' ? 'suspended' : 'active',
            ]);
        }

        $profile->logAudit('verification_status_change', 'status', $oldStatus, $newStatus, [
            'rejection_reason' => $request->rejection_reason,
            'admin_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => "Realtor status updated to {$newStatus}",
            'data' => $profile->fresh(['user', 'verifiedByAdmin']),
        ]);
    }

    /** Retrieve complete audit history log for a Realtor profile. */
    public function audits(int $id): JsonResponse
    {
        $this->checkAdmin();

        $audits = AgentProfileAudit::where('agent_profile_id', $id)
            ->with('user:id,name,email,role')
            ->latest()
            ->paginate(50);

        return response()->json($audits);
    }

    /** Upload document for any agent (Admin override). */
    public function uploadDocument(Request $request, int $id): JsonResponse
    {
        $this->checkAdmin();

        $profile = AgentProfile::findOrFail($id);
        $request->validate([
            'document' => 'required|file|max:10240',
            'document_type' => 'required|string',
        ]);

        $path = $request->file('document')->store('agent-documents', 'public');
        $doc = AgentDocument::create([
            'agent_id' => $profile->id,
            'document_type' => $request->document_type,
            'file_url' => $path,
            'original_name' => $request->file('document')->getClientOriginalName(),
            'uploaded_at' => now(),
            'status' => 'approved',
        ]);

        $profile->logAudit('admin_document_upload', 'document_type', null, $request->document_type, [
            'original_name' => $doc->original_name,
            'doc_id' => $doc->id,
        ]);

        return response()->json(['message' => 'Document uploaded by Admin', 'data' => $doc], 201);
    }

    /** Delete document for an agent (Admin override). */
    public function destroyDocument(int $id, int $docId): JsonResponse
    {
        $this->checkAdmin();

        $profile = AgentProfile::findOrFail($id);
        $doc = AgentDocument::where('agent_id', $profile->id)->findOrFail($docId);

        if ($doc->file_url && Storage::disk('public')->exists($doc->file_url)) {
            Storage::disk('public')->delete($doc->file_url);
        }

        $profile->logAudit('admin_document_delete', 'document_type', $doc->document_type, null, [
            'original_name' => $doc->original_name,
            'doc_id' => $docId,
        ]);

        $doc->delete();

        return response()->json(['message' => 'Document deleted by Admin']);
    }
}
