<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Enquiry;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadTask;
use App\Models\Notification;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\PurchasedLead;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Agent Portal — every query is strictly scoped to the signed-in user.
 * Access is enforced at the route level via `role:agent,admin,super_admin`.
 * Admins may enter for support, but non-privileged callers can never touch
 * another agent's (or another user's) data.
 */
class AgentPortalController extends Controller
{
    private function isPrivileged($user): bool
    {
        return in_array($user->role, ['admin', 'super_admin'], true);
    }

    private function myLeads($user)
    {
        return Lead::where('assigned_to', $user->id);
    }

    private function myProperties($user)
    {
        return Property::where('realtor_id', $user->id);
    }

    private function myTasks($user)
    {
        return LeadTask::where(function ($q) use ($user) {
            $q->where('assigned_to', $user->id)
                ->orWhereHas('lead', fn ($l) => $l->where('assigned_to', $user->id));
        });
    }

    private function findMyProperty($id, $user): Property
    {
        $property = $this->myProperties($user)->findOrFail($id);
        return $property;
    }

    private function findMyLead($id, $user): Lead
    {
        return $this->myLeads($user)->findOrFail($id);
    }

    /** Full dashboard aggregate for the signed-in agent. */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $userId = $user->id;
        $period = (int) $request->get('period', 30);
        $start = now()->subDays($period);

        $properties = $this->myProperties($user);
        $leads = $this->myLeads($user);

        // --- Listings ---
        $activeListings = (clone $properties)->where('approval_status', 'approved')->where('status', 'active')->count();
        $pendingListings = (clone $properties)->where('approval_status', 'pending')->count();
        $soldProperties = (clone $properties)->where('status', 'sold')->count();
        $draftListings = (clone $properties)->where(function ($q) {
            $q->where('status', 'draft')->orWhere('approval_status', 'draft');
        })->count();
        $totalListings = (clone $properties)->count();

        // --- Assigned leads ---
        $totalLeads = (clone $leads)->count();
        $newLeads = (clone $leads)->where('created_at', '>=', $start)->count();
        $convertedLeads = (clone $leads)->whereIn('status', ['converted', 'closed'])->count();
        $pipeline = [];
        foreach (['new', 'contacted', 'qualified', 'scheduled', 'negotiation', 'converted', 'lost'] as $status) {
            $pipeline[$status] = (clone $leads)->where('status', $status)->count();
        }

        // --- Marketplace ---
        $purchasedCount = PurchasedLead::where('user_id', $userId)->whereNull('payout_method')->count();
        $payAtClosingCount = PurchasedLead::where('user_id', $userId)->whereNotNull('payout_method')->count();

        // --- Inbox / tasks / calendar ---
        $newMessages = Notification::where('user_id', $userId)->unread()->count();
        $openTasks = $this->myTasks($user)->whereIn('status', ['pending', 'in_progress'])->count();
        $upcomingAppointments = Appointment::where('user_id', $userId)
            ->where('status', 'scheduled')
            ->where('starts_at', '>=', now())
            ->count();

        // --- Recent activity (own leads only) ---
        $recentActivity = LeadActivity::with('lead')
            ->whereIn('lead_id', $this->myLeads($user)->pluck('id'))
            ->latest()
            ->limit(12)
            ->get()
            ->map(fn (LeadActivity $a) => [
                'id' => $a->id,
                'type' => $a->type,
                'description' => $a->description,
                'created_at' => $a->created_at?->toISOString(),
                'lead' => $a->lead ? [
                    'id' => $a->lead->id,
                    'full_name' => $a->lead->full_name,
                    'lead_number' => $a->lead->lead_number,
                    'status' => $a->lead->status,
                ] : null,
            ]);

        // --- Earnings (toggleable via settings) ---
        $earningsEnabled = (bool) SiteSetting::get('agent_earnings_enabled', true);
        $earnings = $this->earningsPayload($userId);

        return response()->json([
            'active_listings' => $activeListings,
            'pending_listings' => $pendingListings,
            'sold_properties' => $soldProperties,
            'draft_listings' => $draftListings,
            'total_listings' => $totalListings,
            'total_assigned_leads' => $totalLeads,
            'new_leads' => $newLeads,
            'converted_leads' => $convertedLeads,
            'pipeline' => $pipeline,
            'purchased_marketplace_leads' => $purchasedCount,
            'pay_at_closing_leads' => $payAtClosingCount,
            'new_messages' => $newMessages,
            'open_tasks' => $openTasks,
            'upcoming_appointments' => $upcomingAppointments,
            'recent_activity' => $recentActivity,
            'earnings' => $earningsEnabled ? $earnings : ['enabled' => false],
        ]);
    }

    private function earningsPayload(int $userId): array
    {
        $commissions = (float) PurchasedLead::where('user_id', $userId)
            ->where('payout_status', '!=', 'cancelled')
            ->sum('commission_amount');

        $closedValue = (float) Lead::where('assigned_to', $userId)
            ->whereIn('status', ['converted', 'closed'])
            ->sum('marketplace_price');

        $monthStart = now()->startOfMonth();
        $closedCount = Lead::where('assigned_to', $userId)
            ->whereIn('status', ['converted', 'closed'])
            ->count();

        return [
            'enabled' => true,
            'total' => round($commissions + $closedValue, 2),
            'commissions' => round($commissions, 2),
            'closed_deals_volume' => round($closedValue, 2),
            'closed_deals' => $closedCount,
            'this_month' => round(
                (float) PurchasedLead::where('user_id', $userId)
                    ->where('payout_status', '!=', 'cancelled')
                    ->where('claimed_at', '>=', $monthStart)
                    ->sum('commission_amount')
                + (float) Lead::where('assigned_to', $userId)
                    ->whereIn('status', ['converted', 'closed'])
                    ->where('updated_at', '>=', $monthStart)
                    ->sum('marketplace_price'),
                2
            ),
        ];
    }

    /** Own listings only (all statuses incl. drafts). */
    public function properties(Request $request)
    {
        $query = $this->myProperties($request->user())->with(['propertyType', 'images']);

        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('approval_status')) $query->where('approval_status', $request->approval_status);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn ($q) => $q->where('title', 'like', "%{$s}%")
                ->orWhere('address', 'like', "%{$s}%")
                ->orWhere('city', 'like', "%{$s}%")
                ->orWhere('state', 'like', "%{$s}%"));
        }

        return response()->json($query->latest()->paginate($request->get('per_page', 12)));
    }

    /** Duplicate one of the agent's own listings. */
    public function duplicateProperty(Request $request, $id)
    {
        $source = $this->findMyProperty($id, $request->user());

        $copy = $source->replicate();
        $copy->uuid = (string) Str::uuid();
        $copy->slug = Str::slug($source->title . ' copy') . '-' . Str::random(5);
        $copy->title = $source->title . ' (Copy)';
        $copy->status = 'draft';
        $copy->approval_status = 'draft';
        $copy->view_count = 0;
        $copy->inquiry_count = 0;
        $copy->save();

        // Duplicate the gallery so the new listing starts with the same photos.
        foreach ($source->images as $image) {
            PropertyImage::create([
                'property_id' => $copy->id,
                'path' => $image->path,
                'original_name' => $image->original_name,
                'mime_type' => $image->mime_type,
                'size' => $image->size,
                'is_featured' => $image->is_featured,
                'sort_order' => $image->sort_order,
            ]);
        }

        return response()->json(['message' => 'Listing duplicated as a draft.', 'data' => $copy], 201);
    }

    /** Submit one of the agent's own listings for approval. */
    public function submitProperty(Request $request, $id)
    {
        $property = $this->findMyProperty($id, $request->user());

        abort_if($property->approval_status === 'approved', 422, 'This listing is already approved.');

        $property->update([
            'approval_status' => 'pending',
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Listing submitted for approval.', 'data' => $property]);
    }

    /** My assigned leads grouped as clients (buyer/seller/investor). */
    public function clients(Request $request)
    {
        $user = $request->user();
        $query = $this->myLeads($user)->with('activities');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        } else {
            $query->whereIn('type', ['buyer', 'seller', 'investor']);
        }
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn ($q) => $q->where('first_name', 'like', "%{$s}%")
                ->orWhere('last_name', 'like', "%{$s}%")
                ->orWhere('email', 'like', "%{$s}%")
                ->orWhere('phone', 'like', "%{$s}%"));
        }

        $clients = $query->latest()->paginate($request->get('per_page', 20));

        $counts = [
            'buyer' => (clone $this->myLeads($user))->where('type', 'buyer')->count(),
            'seller' => (clone $this->myLeads($user))->where('type', 'seller')->count(),
            'investor' => (clone $this->myLeads($user))->where('type', 'investor')->count(),
        ];

        return response()->json(['data' => $clients->items(), 'counts' => $counts, 'meta' => [
            'current_page' => $clients->currentPage(),
            'last_page' => $clients->lastPage(),
            'per_page' => $clients->perPage(),
            'total' => $clients->total(),
        ]]);
    }

    /** My tasks (assigned to me or on my leads). */
    public function tasks(Request $request)
    {
        $query = $this->myTasks($request->user())->with('lead');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->whereIn('status', ['pending', 'in_progress']);
        }

        return response()->json(['data' => $query->orderBy('due_date')->get()]);
    }

    /** Create a task on one of my leads. */
    public function storeTask(Request $request)
    {
        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|in:low,normal,high,urgent',
            'due_date' => 'nullable|date',
        ]);

        $lead = $this->myLeads($request->user())->findOrFail($validated['lead_id']);

        $task = LeadTask::create([
            'lead_id' => $lead->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'] ?? 'normal',
            'due_date' => $validated['due_date'] ?? null,
            'created_by' => $request->user()->id,
            'assigned_to' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Task created.', 'data' => $task], 201);
    }

    /** Update/complete one of my tasks. */
    public function updateTask(Request $request, $id)
    {
        $task = $this->myTasks($request->user())->findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,in_progress,completed,cancelled',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|in:low,normal,high,urgent',
            'due_date' => 'nullable|date',
        ]);

        if (($validated['status'] ?? null) === 'completed' && !$task->completed_at) {
            $validated['completed_at'] = now();
        }
        if (($validated['status'] ?? null) !== 'completed') {
            $validated['completed_at'] = null;
        }

        $task->update($validated);

        return response()->json(['message' => 'Task updated.', 'data' => $task]);
    }

    /** My calendar — appointments, showings, open houses, reminders. */
    public function appointments(Request $request)
    {
        $user = $request->user();
        $query = Appointment::with('lead')->where('user_id', $user->id);

        if ($request->filled('from')) $query->where('starts_at', '>=', $request->from);
        if ($request->filled('to')) $query->where('starts_at', '<=', $request->to);
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('type')) $query->where('type', $request->type);

        return response()->json(['data' => $query->orderBy('starts_at')->get()]);
    }

    public function storeAppointment(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'lead_id' => 'nullable|exists:leads,id',
            'type' => 'required|in:appointment,showing,open_house,reminder',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'status' => 'sometimes|in:scheduled,completed,cancelled,no_show',
            'location' => 'nullable|string|max:255',
        ]);

        // A linked lead must be one of the agent's own.
        if (!empty($validated['lead_id'])) {
            $this->myLeads($request->user())->findOrFail($validated['lead_id']);
        }

        $appointment = Appointment::create(array_merge($validated, [
            'user_id' => $request->user()->id,
        ]));

        return response()->json(['message' => 'Appointment scheduled.', 'data' => $appointment], 201);
    }

    public function updateAppointment(Request $request, $id)
    {
        $appointment = Appointment::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'lead_id' => 'nullable|exists:leads,id',
            'type' => 'sometimes|in:appointment,showing,open_house,reminder',
            'starts_at' => 'sometimes|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'status' => 'sometimes|in:scheduled,completed,cancelled,no_show',
            'location' => 'nullable|string|max:255',
        ]);

        if (!empty($validated['lead_id'])) {
            $this->myLeads($request->user())->findOrFail($validated['lead_id']);
        }

        $appointment->update($validated);

        return response()->json(['message' => 'Appointment updated.', 'data' => $appointment]);
    }

    public function destroyAppointment(Request $request, $id)
    {
        $appointment = Appointment::where('user_id', $request->user()->id)->findOrFail($id);
        $appointment->delete();
        return response()->json(['message' => 'Appointment deleted.']);
    }

    /** My inbox — notifications (incl. marketplace) addressed to me only. */
    public function messages(Request $request)
    {
        $query = Notification::where('user_id', $request->user()->id);

        if ($request->get('filter') === 'unread') $query->unread();
        if ($request->filled('module')) $query->where('module', $request->module);

        return response()->json([
            'data' => $query->latest()->paginate($request->get('per_page', 20)),
        ]);
    }

    /** Personal analytics only. */
    public function analytics(Request $request)
    {
        $user = $request->user();
        $userId = $user->id;

        $properties = $this->myProperties($user);
        $leads = $this->myLeads($user);

        $activeListings = (clone $properties)->where('status', 'active')->count();
        $totalListings = (clone $properties)->count();
        $totalViews = (int) (clone $properties)->sum('view_count');
        $totalInquiries = (int) (clone $properties)->sum('inquiry_count');

        $totalLeads = (clone $leads)->count();
        $converted = (clone $leads)->whereIn('status', ['converted', 'closed'])->count();
        $conversionRate = $totalLeads > 0 ? round(($converted / $totalLeads) * 100, 1) : 0;

        // Monthly trend (last 6 months): leads received vs conversions.
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->startOfMonth()->subMonths($i);
            $next = $month->copy()->addMonth();
            $months[] = [
                'label' => $month->format('M'),
                'leads' => (clone $leads)->where('created_at', '>=', $month)->where('created_at', '<', $next)->count(),
                'conversions' => (clone $leads)->whereIn('status', ['converted', 'closed'])
                    ->where('updated_at', '>=', $month)->where('updated_at', '<', $next)->count(),
            ];
        }

        // Marketplace (personal): purchases + spend.
        $purchased = PurchasedLead::where('user_id', $userId);
        $spent = (float) (clone $purchased)->whereNull('payout_method')->sum('amount');

        $earnings = $this->earningsPayload($userId);

        return response()->json([
            'listings' => ['total' => $totalListings, 'active' => $activeListings],
            'views' => $totalViews,
            'inquiries' => $totalInquiries,
            'leads' => ['total' => $totalLeads, 'converted' => $converted, 'conversion_rate' => $conversionRate],
            'marketplace' => ['purchases' => (clone $purchased)->count(), 'spent' => round($spent, 2)],
            'earnings' => $earnings,
            'trend' => $months,
        ]);
    }

    /** Pay-at-Closing leads I have claimed. */
    public function payAtClosingLeads(Request $request)
    {
        $user = $request->user();

        $purchases = PurchasedLead::with('lead')
            ->where('user_id', $user->id)
            ->whereNotNull('payout_method')
            ->latest('claimed_at')
            ->get();

        return response()->json([
            'data' => $purchases->map(fn (PurchasedLead $p) => [
                'id' => $p->id,
                'lead' => $p->lead,
                'commission_amount' => (float) $p->commission_amount,
                'payout_method' => $p->payout_method,
                'payout_email' => $p->payout_email,
                'payout_status' => $p->payout_status,
                'closing_date' => $p->closing_date?->toDateString(),
                'claimed_at' => $p->claimed_at?->toISOString(),
            ]),
        ]);
    }
}
