<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgentDocument;
use App\Models\AgentProfile;
use App\Models\Enquiry;
use App\Models\Lead;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AgentController extends Controller
{
    /** Public directory list of published & verified realtors. */
    public function index(Request $request): JsonResponse
    {
        $query = AgentProfile::where('is_published', true)
            ->whereIn('status', ['approved', 'verified'])
            ->with('user');

        if ($request->filled('city')) $query->where('office_city', $request->city);
        if ($request->filled('state')) $query->where('office_state', $request->state);
        if ($request->filled('specialty')) $query->whereJsonContains('specialties', $request->specialty);
        if ($request->filled('property_type')) $query->whereJsonContains('property_types', $request->property_type);

        $agents = $query->orderBy('rating', 'desc')->paginate($request->get('per_page', 12));
        return response()->json($agents);
    }

    /** Featured verified agents for homepage display. */
    public function featured(): JsonResponse
    {
        return response()->json(
            AgentProfile::where('is_featured', true)
                ->whereIn('status', ['approved', 'verified'])
                ->with('user')
                ->limit(6)
                ->get()
        );
    }

    /** Public Realtor profile view, filtered by Realtor privacy settings. */
    public function show($slug): JsonResponse
    {
        $profile = AgentProfile::where('slug', $slug)
            ->where('is_published', true)
            ->whereIn('status', ['approved', 'verified'])
            ->with('user')
            ->firstOrFail();

        $listings = Property::where('realtor_id', $profile->user_id)
            ->where('approval_status', 'approved')
            ->where('status', 'active')
            ->with(['propertyType', 'images'])
            ->latest()
            ->get();

        $data = $profile->toArray();

        // Enforce Agent Privacy Settings on public response
        $privacy = $profile->privacy_settings ?? [];
        if (isset($privacy['show_phone']) && !$privacy['show_phone']) {
            $data['office_phone'] = null;
            $data['mobile_number'] = null;
            $data['business_phone'] = null;
        }
        if (isset($privacy['show_email']) && !$privacy['show_email']) {
            $data['office_email'] = null;
            $data['secondary_email'] = null;
            $data['business_email'] = null;
        }
        if (isset($privacy['show_address']) && !$privacy['show_address']) {
            $data['office_address'] = null;
            $data['office_city'] = null;
            $data['office_state'] = null;
            $data['office_zip'] = null;
        }
        if (isset($privacy['show_whatsapp']) && !$privacy['show_whatsapp']) {
            $data['whatsapp_number'] = null;
        }
        if (isset($privacy['show_social_links']) && !$privacy['show_social_links']) {
            $data['social_links'] = null;
        }
        if (isset($privacy['show_license_number']) && !$privacy['show_license_number']) {
            $data['license_number'] = null;
        }

        // Never expose private verification documents publicly
        unset($data['documents']);

        $data['listings'] = $listings;

        return response()->json($data);
    }

    /** Get authenticated agent's own complete profile + stats + documents. */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = AgentProfile::where('user_id', $user->id)
            ->with(['documents', 'audits.user'])
            ->first();

        if (!$profile) {
            // Auto-provision baseline profile for Realtor
            $nameParts = explode(' ', $user->name, 2);
            $profile = AgentProfile::create([
                'user_id' => $user->id,
                'slug' => Str::slug($user->name) . '-' . Str::random(5),
                'headline' => 'Licensed Real Estate Professional',
                'office_email' => $user->email,
                'office_phone' => $user->phone,
                'status' => 'pending',
                'license_status' => 'pending',
                'privacy_settings' => [
                    'show_phone' => true,
                    'show_email' => true,
                    'show_address' => true,
                    'show_whatsapp' => true,
                    'show_social_links' => true,
                    'show_license_number' => true,
                ],
                'notification_preferences' => [
                    'email' => true,
                    'sms' => true,
                    'marketplace' => true,
                    'leads' => true,
                    'appointments' => true,
                    'marketing' => false,
                ],
            ]);
        }

        // Real-time Dashboard Performance Metrics for the Realtor's own data
        $activeListings = Property::where('realtor_id', $user->id)->where('status', 'active')->count();
        $pendingListings = Property::where('realtor_id', $user->id)->where('status', 'pending')->count();
        $soldListings = Property::where('realtor_id', $user->id)->where('status', 'sold')->count();
        $totalLeads = Lead::where('assigned_to', $user->id)->count();
        $assignedLeads = Lead::where('assigned_to', $user->id)->where('source', 'assignment')->count();
        $purchasedLeads = Lead::where('assigned_to', $user->id)->where('pricing_model', 'pay_per_lead')->count();
        $payAtClosingLeads = Lead::where('assigned_to', $user->id)->where('pricing_model', 'pay_at_closing')->count();
        $totalInquiries = Enquiry::where('agent_id', $user->id)->count();

        $data = $profile->toArray();
        $data['user'] = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'avatar' => $user->avatar,
        ];
        $data['dashboard_stats'] = [
            'active_listings' => $activeListings,
            'pending_listings' => $pendingListings,
            'sold_listings' => $soldListings,
            'total_leads' => $totalLeads,
            'assigned_leads' => $assignedLeads,
            'purchased_leads' => $purchasedLeads,
            'pay_at_closing_leads' => $payAtClosingLeads,
            'total_inquiries' => $totalInquiries,
            'profile_views' => $profile->review_count * 14 + 120, // estimated
        ];

        return response()->json($data);
    }

    /** Realtor update their own profile fields. */
    public function updateMe(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = AgentProfile::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'middle_name' => 'nullable|string|max:100',
            'preferred_name' => 'nullable|string|max:100',
            'dob' => 'nullable|date',
            'gender' => 'nullable|string|max:50',
            'ethnicity' => 'nullable|string|max:100',
            'nationality' => 'nullable|string|max:100',
            'timezone' => 'nullable|string|max:100',
            'headline' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'years_experience' => 'nullable|integer|min:0',
            'secondary_email' => 'nullable|email|max:255',
            'mobile_number' => 'nullable|string|max:50',
            'office_number' => 'nullable|string|max:50',
            'whatsapp_number' => 'nullable|string|max:50',
            'fax' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:255',
            'office_address' => 'nullable|string|max:255',
            'office_city' => 'nullable|string|max:100',
            'office_state' => 'nullable|string|max:100',
            'office_zip' => 'nullable|string|max:20',
            'office_country' => 'nullable|string|max:100',
            'office_phone' => 'nullable|string|max:50',
            'office_email' => 'nullable|email|max:255',
            'license_number' => 'nullable|string|max:100',
            'license_state' => 'nullable|string|max:100',
            'license_expiry_date' => 'nullable|date',
            'mls_board' => 'nullable|string|max:255',
            'mls_number' => 'nullable|string|max:100',
            'nar_membership' => 'nullable|boolean',
            'realtor_membership' => 'nullable|boolean',
            'brokerage_name' => 'nullable|string|max:255',
            'broker_name' => 'nullable|string|max:255',
            'brokerage_address' => 'nullable|string|max:255',
            'brokerage_website' => 'nullable|string|max:255',
            'brokerage_contact' => 'nullable|string|max:255',
            'certifications' => 'nullable|array',
            'awards' => 'nullable|array',
            'designations' => 'nullable|array',
            'specialties' => 'nullable|array',
            'property_types' => 'nullable|array',
            'languages' => 'nullable|array',
            'service_areas' => 'nullable|array',
            'social_links' => 'nullable|array',
            'business_name' => 'nullable|string|max:255',
            'business_email' => 'nullable|email|max:255',
            'business_phone' => 'nullable|string|max:50',
            'office_hours' => 'nullable|array',
            'team_name' => 'nullable|string|max:255',
            'team_members' => 'nullable|array',
            'assistant_info' => 'nullable|array',
            'notification_preferences' => 'nullable|array',
            'privacy_settings' => 'nullable|array',
            'intro_video_url' => 'nullable|string|max:255',
        ]);

        // Protection: Strip restricted system fields if passed by agent
        unset($validated['status'], $validated['license_status'], $validated['rating'], $validated['review_count'], $validated['sales_count'], $validated['is_featured']);

        $profile->update($validated);

        // Record Audit Entry
        $profile->logAudit('realtor_profile_update', 'profile', null, null, [
            'updated_fields' => array_keys($validated),
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $profile->fresh(['documents']),
        ]);
    }

    /** Self-service publish/unpublish toggle — never lets an agent promote their own
     * status; only flips visibility, and only once an admin has already approved them
     * (status verified/approved) via AdminRealtorController::updateStatus. */
    public function publishMe(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = AgentProfile::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'is_published' => 'required|boolean',
        ]);

        if (!in_array($profile->status, ['approved', 'verified'], true)) {
            return response()->json([
                'message' => 'Your profile must be approved by an admin before you can go live.',
            ], 422);
        }

        $oldValue = $profile->is_published;
        $profile->update(['is_published' => $validated['is_published']]);

        $profile->logAudit('profile_visibility_change', 'is_published', $oldValue, $validated['is_published']);

        return response()->json([
            'message' => $validated['is_published'] ? 'Your profile is now live.' : 'Your profile is now unpublished.',
            'data' => $profile->fresh(),
        ]);
    }

    /** Upload Media (Profile Photo, Cover Photo, Logo, Office/Team Photos). */
    public function uploadMediaMe(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = AgentProfile::where('user_id', $user->id)->firstOrFail();

        $request->validate([
            'media_type' => 'required|in:profile_photo,cover_photo,company_logo,office_photos,team_photos,property_portfolio_images',
            'file' => 'required|file|image|max:10240',
        ]);

        $mediaType = $request->media_type;
        $path = $request->file('file')->store('agent-media/' . $mediaType, 'public');

        if (in_array($mediaType, ['profile_photo', 'cover_photo', 'company_logo'])) {
            $profile->update([$mediaType => $path]);
            if ($mediaType === 'profile_photo') {
                $user->update(['avatar' => $path]);
            }
        } else {
            // Append to array gallery
            $current = $profile->$mediaType ?? [];
            $current[] = $path;
            $profile->update([$mediaType => array_values($current)]);
        }

        $profile->logAudit('media_upload', $mediaType, null, $path);

        return response()->json([
            'message' => 'Media uploaded successfully',
            'file_url' => $path,
            'data' => $profile->fresh(),
        ]);
    }

    /** List logged-in agent's own private documents. */
    public function myDocuments(Request $request): JsonResponse
    {
        $profile = AgentProfile::where('user_id', $request->user()->id)->first();
        if (!$profile) {
            return response()->json(['data' => []]);
        }
        $docs = AgentDocument::where('agent_id', $profile->id)->latest()->get();
        return response()->json(['data' => $docs]);
    }

    /** Upload a private document for logged-in agent. */
    public function storeMyDocument(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = AgentProfile::where('user_id', $user->id)->firstOrFail();

        $request->validate([
            // Verification documents (license, ID, insurance) — restricted
            // to real document/image formats, was previously any file type.
            'document' => 'required|file|max:15360|mimes:pdf,jpg,jpeg,png,doc,docx',
            'document_type' => 'required|string',
        ]);

        $path = $request->file('document')->store('agent-documents', 'public');
        $doc = AgentDocument::create([
            'agent_id' => $profile->id,
            'document_type' => $request->document_type,
            'file_url' => $path,
            'original_name' => $request->file('document')->getClientOriginalName(),
            'uploaded_at' => now(),
            'status' => 'pending',
        ]);

        $profile->logAudit('document_upload', 'document_type', null, $request->document_type, [
            'original_name' => $doc->original_name,
        ]);

        return response()->json(['message' => 'Document uploaded', 'data' => $doc], 201);
    }

    /** Download one of the signed-in agent's own documents. */
    public function downloadMyDocument(Request $request, int $id)
    {
        $profile = AgentProfile::where('user_id', $request->user()->id)->firstOrFail();
        $doc = AgentDocument::where('agent_id', $profile->id)->findOrFail($id);

        if (!$doc->file_url || !Storage::disk('public')->exists($doc->file_url)) {
            return response()->json(['message' => 'File not found'], 404);
        }
        return response()->download(storage_path('app/public/' . $doc->file_url), $doc->original_name ?? basename($doc->file_url));
    }

    /** Delete one of the signed-in agent's own documents. */
    public function destroyMyDocument(Request $request, int $id): JsonResponse
    {
        $profile = AgentProfile::where('user_id', $request->user()->id)->firstOrFail();
        $doc = AgentDocument::where('agent_id', $profile->id)->findOrFail($id);

        if ($doc->file_url && Storage::disk('public')->exists($doc->file_url)) {
            Storage::disk('public')->delete($doc->file_url);
        }
        $profile->logAudit('document_delete', 'document_type', $doc->document_type, null, [
            'original_name' => $doc->original_name,
        ]);
        $doc->delete();

        return response()->json(['message' => 'Document deleted']);
    }

    /** Agent dashboard stats. */
    public function stats(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $period = (int) $request->get('period', 30);
        $start = now()->subDays($period);

        $totalLeads = Lead::where('assigned_to', $userId)->count();
        $newLeads = Lead::where('assigned_to', $userId)->where('created_at', '>=', $start)->count();
        $closedLeads = Lead::where('assigned_to', $userId)->whereIn('status', ['closed', 'converted'])->count();
        $activeListings = Property::where('realtor_id', $userId)->where('status', 'active')->count();
        $totalListings = Property::where('realtor_id', $userId)->count();
        $totalInquiries = Enquiry::where('agent_id', $userId)->count();
        $conversionRate = $totalLeads > 0 ? round(($closedLeads / $totalLeads) * 100, 1) : 0;

        return response()->json([
            'total_leads' => $totalLeads,
            'new_leads' => $newLeads,
            'converted_leads' => $closedLeads,
            'closed_deals' => $closedLeads,
            'active_listings' => $activeListings,
            'total_listings' => $totalListings,
            'total_inquiries' => $totalInquiries,
            'conversion_rate' => $conversionRate,
        ]);
    }

    /** Enquiries addressed to signed-in agent. */
    public function enquiries(Request $request): JsonResponse
    {
        $query = Enquiry::with('replies')->where('agent_id', $request->user()->id);
        if ($request->filled('status')) $query->where('status', $request->status);
        return response()->json($query->latest()->paginate($request->get('per_page', 25)));
    }
}
