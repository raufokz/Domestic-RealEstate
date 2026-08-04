<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Property;
use App\Models\Lead;
use App\Models\Enquiry;
use App\Models\SiteSetting;
use App\Models\AgentProfile;
use App\Models\ServiceRequest;
use App\Models\Contract;
use App\Models\Invoice;
use App\Models\NewsletterSubscriber;
use App\Models\Blog;
use App\Models\Testimonial;
use App\Models\Faq;
use App\Models\EmailCampaign;
use App\Models\AdminActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class AdminController extends Controller
{
    private function checkAdmin() {
        $user = Auth::user();
        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    private function logActivity($action, $subject = null, $details = null) {
        AdminActivityLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->id,
            'details' => $details,
            'ip_address' => request()->ip(),
        ]);
    }

    public function dashboard() {
        $this->checkAdmin();
        // Stats are a point-in-time overview, not live data — cached briefly to
        // avoid ~19 count/sum queries running on every dashboard load/poll.
        $data = Cache::remember('admin:dashboard', 90, function () {
            return [
                'stats' => [
                    'total_users' => User::count(),
                    'total_agents' => User::where('role', 'agent')->count(),
                    'total_properties' => Property::count(),
                    'active_properties' => Property::where('status', 'active')->count(),
                    'total_leads' => Lead::count(),
                    'new_leads' => Lead::where('status', 'new')->count(),
                    'hot_leads' => Lead::where('priority', 'hot')->count(),
                    'total_enquiries' => Enquiry::count(),
                    'pending_approvals' => Property::where('approval_status', 'pending')->count(),
                    'pending_agents' => AgentProfile::where('status', 'pending')->count(),
                    'service_requests_new' => ServiceRequest::where('status', 'new')->count(),
                    'contracts_pending' => Contract::where('status', 'sent')->count(),
                    'invoices_unpaid' => Invoice::whereIn('status', ['sent', 'overdue'])->count(),
                    'invoices_total_unpaid' => Invoice::whereIn('status', ['sent', 'overdue'])->sum('amount'),
                    'newsletter_subscribers' => NewsletterSubscriber::where('status', 'active')->count(),
                    'total_blogs' => Blog::count(),
                    'total_testimonials' => Testimonial::count(),
                    'total_faqs' => Faq::count(),
                    'active_campaigns' => EmailCampaign::where('status', 'sending')->count(),
                    'deals_won' => \App\Models\Deal::where('status', 'won')->count(),
                ],
                'recent_leads' => Lead::with('assignee')->latest()->limit(10)->get(),
                'recent_properties' => Property::latest()->limit(5)->get(),
                'recent_service_requests' => ServiceRequest::latest()->limit(5)->get(),
                'top_blogs' => Blog::where('status', 'published')
                    ->orderBy('view_count', 'desc')
                    ->limit(5)
                    ->get(['id', 'title', 'slug', 'view_count']),
            ];
        });
        return response()->json($data);
    }

    public function stats(Request $request) {
        $this->checkAdmin();
        $period = $request->get('period', '30');
        $startDate = now()->subDays($period);
        return response()->json([
            'leads_by_status' => Lead::selectRaw('status, count(*) as count')->where('created_at', '>=', $startDate)->groupBy('status')->get(),
            'leads_by_type' => Lead::selectRaw('type, count(*) as count')->where('created_at', '>=', $startDate)->groupBy('type')->get(),
            'properties_by_status' => Property::selectRaw('status, count(*) as count')->groupBy('status')->get(),
            'new_users' => User::where('created_at', '>=', $startDate)->count(),
            'service_requests_by_status' => ServiceRequest::selectRaw('status, count(*) as count')->groupBy('status')->get(),
            'invoices_by_status' => Invoice::selectRaw('status, count(*) as count')->groupBy('status')->get(),
            'revenue_collected' => Invoice::where('status', 'paid')->where('paid_at', '>=', $startDate)->sum('amount'),
        ]);
    }

    public function users(Request $request) {
        $this->checkAdmin();
        $query = User::query();
        if ($request->filled('role')) $query->where('role', $request->role);
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            });
        }
        return response()->json($query->orderBy('created_at', 'desc')->paginate(25));
    }

    /** Single user for the admin user-detail screen, with real activity counts. */
    public function showUser($id) {
        $this->checkAdmin();
        $user = User::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'last_login_at' => $user->last_login_at ?? null,
                'stats' => [
                    'properties' => Property::where('realtor_id', $user->id)->count(),
                    'leads_assigned' => \App\Models\Lead::where('assigned_to', $user->id)->count(),
                    'login_count' => \App\Models\AuthLog::where('user_id', $user->id)->count(),
                ],
                // Real sign-in history from auth_logs. No geo-IP provider is
                // configured, so location is deliberately omitted rather than invented.
                'login_history' => \App\Models\AuthLog::where('user_id', $user->id)
                    ->orderByDesc('created_at')->limit(25)
                    ->get(['id', 'type', 'ip_address', 'user_agent', 'success', 'failure_reason', 'created_at']),
                'assigned_leads' => \App\Models\Lead::where('assigned_to', $user->id)
                    ->orderByDesc('created_at')->limit(25)
                    ->get(['id', 'first_name', 'last_name', 'email', 'type', 'status', 'score', 'created_at']),
                'activity' => \App\Models\AdminActivityLog::where('user_id', $user->id)
                    ->orderByDesc('created_at')->limit(25)
                    ->get(['id', 'action', 'subject_type', 'subject_id', 'details', 'created_at']),
            ],
        ]);
    }

    public function properties(Request $request) {
        $this->checkAdmin();
        $query = Property::with(['propertyType', 'realtor', 'images']);
        if ($request->filled('status')) $query->where('approval_status', $request->status);
        if ($request->filled('city')) $query->where('city', $request->city);
        return response()->json($query->orderBy('created_at', 'desc')->paginate(25));
    }

    public function agents(Request $request) {
        $this->checkAdmin();
        $query = AgentProfile::with('user');
        if ($request->filled('status')) $query->where('status', $request->status);
        return response()->json($query->orderBy('created_at', 'desc')->paginate(25));
    }

    public function leads(Request $request) {
        $this->checkAdmin();
        $query = Lead::with(['assignee', 'realtor']);
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('type')) $query->where('type', $request->type);
        if ($request->filled('priority')) $query->where('priority', $request->priority);
        return response()->json($query->orderBy('created_at', 'desc')->paginate(min((int) $request->get('per_page', 25), 200)));
    }

    public function enquiries(Request $request) {
        $this->checkAdmin();
        $query = Enquiry::with('replies');
        if ($request->filled('status')) $query->where('status', $request->status);
        return response()->json($query->orderBy('created_at', 'desc')->paginate(25));
    }

    public function settings() {
        $this->checkAdmin();
        return response()->json(SiteSetting::all()->keyBy('key_name'));
    }

    public function updateSettings(Request $request) {
        $this->checkAdmin();
        $settings = $request->all();
        foreach ($settings as $key => $value) {
            SiteSetting::set($key, $value);
        }
        $this->logActivity('settings_updated', null, ['keys' => array_keys($settings)]);
        return response()->json(['message' => 'Settings updated successfully']);
    }

    public function serviceRequests(Request $request) {
        $this->checkAdmin();
        $query = ServiceRequest::with(['user', 'assignedAdmin']);
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('service_type')) $query->where('service_type', $request->service_type);
        return response()->json($query->orderBy('created_at', 'desc')->paginate(25));
    }

    public function updateServiceRequest(Request $request, $id) {
        $this->checkAdmin();
        $sr = ServiceRequest::findOrFail($id);
        $old = $sr->toArray();
        $sr->update($request->only(['status', 'assigned_admin', 'admin_notes']));
        $this->logActivity('service_request_updated', $sr, ['old' => $old, 'new' => $sr->fresh()->toArray()]);
        return response()->json($sr->fresh());
    }

    public function contracts(Request $request) {
        $this->checkAdmin();
        $query = Contract::with(['user', 'serviceRequest', 'creator']);
        if ($request->filled('status')) $query->where('status', $request->status);
        return response()->json($query->orderBy('created_at', 'desc')->paginate(25));
    }

    public function storeContract(Request $request) {
        $this->checkAdmin();
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'template_name' => 'required|string',
            'template_html' => 'required|string',
            'client_details' => 'nullable|array',
        ]);
        $contract = Contract::create([
            'contract_number' => Contract::generateNumber(),
            'service_request_id' => $request->service_request_id,
            'user_id' => $request->user_id,
            'template_name' => $request->template_name,
            'template_html' => $request->template_html,
            'client_details' => $request->client_details,
            'status' => 'draft',
            'created_by' => Auth::id(),
        ]);
        $this->logActivity('contract_created', $contract);
        return response()->json($contract, 201);
    }

    public function sendContract($id) {
        $this->checkAdmin();
        $contract = Contract::findOrFail($id);
        $contract->update(['status' => 'sent', 'sent_at' => now(), 'expires_at' => now()->addDays(7)]);
        $this->logActivity('contract_sent', $contract);
        return response()->json($contract);
    }

    public function invoices(Request $request) {
        $this->checkAdmin();
        $query = Invoice::with(['user', 'serviceRequest', 'creator']);
        if ($request->filled('status')) $query->where('status', $request->status);
        return response()->json($query->orderBy('created_at', 'desc')->paginate(25));
    }

    public function storeInvoice(Request $request) {
        $this->checkAdmin();
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'payoneer_invoice_id' => 'nullable|string',
            'due_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);
        $invoice = Invoice::create([
            'invoice_number' => Invoice::generateNumber(),
            'user_id' => $request->user_id,
            'service_request_id' => $request->service_request_id,
            'payoneer_invoice_id' => $request->payoneer_invoice_id,
            'description' => $request->description,
            'amount' => $request->amount,
            'currency' => $request->currency ?? 'USD',
            'status' => 'draft',
            'notes' => $request->notes,
            'due_at' => $request->due_at,
            'created_by' => Auth::id(),
        ]);
        $this->logActivity('invoice_created', $invoice);
        return response()->json($invoice, 201);
    }

    public function updateInvoice(Request $request, $id) {
        $this->checkAdmin();
        $invoice = Invoice::findOrFail($id);
        $old = $invoice->toArray();
        $invoice->update($request->only(['status', 'payoneer_invoice_id', 'notes', 'due_at']));
        if ($request->status === 'paid' && !$invoice->paid_at) {
            $invoice->update(['paid_at' => now()]);
        }
        if ($request->status === 'sent' && !$invoice->sent_at) {
            $invoice->update(['sent_at' => now()]);
        }
        $this->logActivity('invoice_updated', $invoice, ['old_status' => $old['status'], 'new_status' => $invoice->fresh()->status]);
        return response()->json($invoice->fresh());
    }

    public function analytics(Request $request)
    {
        $this->checkAdmin();
        $days = (int) ($request->get('days', 30));

        // ~18 aggregate queries incl. full page_views scans — this is a
        // point-in-time report, not live data, so cache briefly per period.
        $data = Cache::remember("admin:analytics:{$days}", 180, function () use ($days) {
            return $this->buildAnalytics($days);
        });

        return response()->json($data);
    }

    private function buildAnalytics(int $days): array
    {
        $startDate = now()->subDays($days);

        $totalPageViews = \Illuminate\Support\Facades\DB::table('page_views')->where('created_at', '>=', $startDate)->count();
        $uniqueVisitors = \Illuminate\Support\Facades\DB::table('page_views')->where('created_at', '>=', $startDate)->distinct('ip_address')->count('ip_address');
        $pageViewsByDay = \Illuminate\Support\Facades\DB::table('page_views')
            ->where('created_at', '>=', $startDate)
            ->select(\Illuminate\Support\Facades\DB::raw('DATE(created_at) as date'), \Illuminate\Support\Facades\DB::raw('COUNT(*) as views'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        $topPages = \Illuminate\Support\Facades\DB::table('page_views')
            ->where('created_at', '>=', $startDate)
            ->select('path', \Illuminate\Support\Facades\DB::raw('COUNT(*) as views'))
            ->groupBy('path')
            ->orderByDesc('views')
            ->limit(10)
            ->get();
        $refererSources = \Illuminate\Support\Facades\DB::table('page_views')
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('referer')
            ->select('referer', \Illuminate\Support\Facades\DB::raw('COUNT(*) as count'))
            ->groupBy('referer')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        $totalLeads = Lead::where('created_at', '>=', $startDate)->count();
        $leadsByDay = Lead::where('created_at', '>=', $startDate)
            ->select(\Illuminate\Support\Facades\DB::raw('DATE(created_at) as date'), \Illuminate\Support\Facades\DB::raw('COUNT(*) as count'))
            ->groupBy('date')->orderBy('date')->get();
        $leadsBySource = Lead::where('created_at', '>=', $startDate)
            ->select('source', \Illuminate\Support\Facades\DB::raw('COUNT(*) as count'))
            ->groupBy('source')->orderByDesc('count')->get();
        $leadsByStatus = Lead::select('status', \Illuminate\Support\Facades\DB::raw('COUNT(*) as count'))
            ->groupBy('status')->get();
        $leadsByType = Lead::select('type', \Illuminate\Support\Facades\DB::raw('COUNT(*) as count'))
            ->groupBy('type')->get();
        $conversionRate = Lead::where('status', 'converted')->count();
        $totalLeadsAll = Lead::count();
        $conversionPct = $totalLeadsAll > 0 ? round(($conversionRate / $totalLeadsAll) * 100, 1) : 0;

        $totalProperties = Property::count();
        $activeProperties = Property::where('status', 'active')->count();
        $propertiesByType = Property::select('property_type_id', \Illuminate\Support\Facades\DB::raw('COUNT(*) as count'))
            ->groupBy('property_type_id')->get();

        $totalCampaigns = EmailCampaign::count();
        $campaignStats = EmailCampaign::selectRaw('SUM(recipient_count) as total_sent, SUM(open_count) as total_opens, SUM(click_count) as total_clicks')->first();

        $agentPerformance = User::where('role', 'agent')
            ->withCount(['leads as total_leads'])
            ->withCount(['leads as converted_leads' => function ($q) {
                $q->where('status', 'converted');
            }])
            ->limit(10)
            ->get()
            ->map(function ($agent) {
                $total = $agent->total_leads ?? 0;
                $converted = $agent->converted_leads ?? 0;
                return [
                    'id' => $agent->id,
                    'name' => $agent->first_name . ' ' . $agent->last_name,
                    'total_leads' => $total,
                    'converted_leads' => $converted,
                    'conversion_rate' => $total > 0 ? round(($converted / $total) * 100, 1) . '%' : '0%',
                ];
            });

        $totalInvoices = Invoice::count();
        $revenueData = Invoice::where('status', 'paid')->sum('amount');

        return [
            'period_days' => $days,
            'page_views' => [
                'total' => $totalPageViews,
                'unique_visitors' => $uniqueVisitors,
                'by_day' => $pageViewsByDay,
                'top_pages' => $topPages,
                'referer_sources' => $refererSources,
            ],
            'leads' => [
                'total' => $totalLeads,
                'by_day' => $leadsByDay,
                'by_source' => $leadsBySource,
                'by_status' => $leadsByStatus,
                'by_type' => $leadsByType,
                'conversion_rate' => $conversionPct . '%',
            ],
            'properties' => [
                'total' => $totalProperties,
                'active' => $activeProperties,
                'by_type' => $propertiesByType,
            ],
            'campaigns' => [
                'total' => $totalCampaigns,
                'total_sent' => $campaignStats->total_sent ?? 0,
                'total_opens' => $campaignStats->total_opens ?? 0,
                'total_clicks' => $campaignStats->total_clicks ?? 0,
                'open_rate' => ($campaignStats->total_sent ?? 0) > 0 ? round((($campaignStats->total_opens ?? 0) / $campaignStats->total_sent) * 100, 1) . '%' : '0%',
                'click_rate' => ($campaignStats->total_sent ?? 0) > 0 ? round((($campaignStats->total_clicks ?? 0) / $campaignStats->total_sent) * 100, 1) . '%' : '0%',
            ],
            'agents' => $agentPerformance,
            'revenue' => [
                'total_invoices' => $totalInvoices,
                'total_collected' => $revenueData,
            ],
        ];
    }

    // Newsletter Subscribers
    public function newsletterSubscribers(Request $request) {
        $this->checkAdmin();
        $query = NewsletterSubscriber::query();
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('source', 'like', "%{$search}%");
            });
        }
        return response()->json($query->orderBy('subscribed_at', 'desc')->paginate(25));
    }

    public function removeNewsletterSubscriber($id) {
        $this->checkAdmin();
        $subscriber = NewsletterSubscriber::findOrFail($id);
        $subscriber->update(['status' => 'unsubscribed', 'unsubscribed_at' => now()]);
        $this->logActivity('newsletter_subscriber_removed', $subscriber);
        return response()->json(['message' => 'Subscriber removed']);
    }

    public function activityLogs(Request $request) {
        $this->checkAdmin();
        $query = AdminActivityLog::with('user');
        if ($request->filled('user_id')) $query->where('user_id', $request->user_id);
        if ($request->filled('action')) $query->where('action', $request->action);
        return response()->json($query->orderBy('created_at', 'desc')->paginate(50));
    }

    /* ───────────────────── Users CRUD ───────────────────── */

    public function storeUser(Request $request) {
        $this->checkAdmin();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:8',
            'role' => 'required|string|in:admin,super_admin,agent,broker,buyer,seller,investor,staff,lender,title',
            'status' => 'nullable|string|in:active,inactive,pending,suspended',
            'phone' => 'nullable|string|max:50',
        ]);
        $validated['password'] = $validated['password'] ?? 'ChangeMe123!';
        $validated['status'] = $validated['status'] ?? 'active';
        $user = User::create($validated);
        $this->logActivity('user_created', $user);
        return response()->json(['data' => $user, 'message' => 'User created'], 201);
    }

    public function updateUser(Request $request, $id) {
        $this->checkAdmin();
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$id,
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|string',
            'status' => 'sometimes|string|in:active,inactive,pending,suspended',
            'phone' => 'nullable|string|max:50',
            'budget_min' => 'nullable|numeric',
            'budget_max' => 'nullable|numeric',
            'property_preferences' => 'nullable|string',
        ]);
        if (empty($validated['password'])) {
            unset($validated['password']);
        }
        $user->update(collect($validated)->only(['name', 'email', 'password', 'role', 'status', 'phone'])->all());
        $this->logActivity('user_updated', $user);
        return response()->json(['data' => $user->fresh(), 'message' => 'User updated']);
    }

    public function destroyUser($id) {
        $this->checkAdmin();
        $user = User::findOrFail($id);
        if ($user->id === Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.',
                'reason' => 'self-delete is not allowed',
            ], 422);
        }
        $this->logActivity('user_deleted', $user);
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }

    /* ───────────────────── Properties CRUD ───────────────────── */

    public function storeProperty(Request $request) {
        $this->checkAdmin();
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'zip' => 'required|string',
            'country' => 'nullable|string',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|numeric|min:0',
            'sqft' => 'nullable|integer|min:0',
            'property_type_id' => 'nullable|exists:property_types,id',
            'realtor_id' => 'nullable|exists:users,id',
            'status' => 'nullable|string',
            'approval_status' => 'nullable|string|in:draft,pending,approved,rejected',
            'featured' => 'nullable|boolean',
            'premium' => 'nullable|boolean',
            'year_built' => 'nullable|integer',
            'lot_size' => 'nullable|string',
            'parking_spaces' => 'nullable|integer',
        ]);
        $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']).'-'.\Illuminate\Support\Str::random(5);
        $validated['uuid'] = (string) \Illuminate\Support\Str::uuid();
        $validated['country'] = $validated['country'] ?? 'US';
        $validated['approval_status'] = $validated['approval_status'] ?? 'approved';
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['realtor_id'] = $validated['realtor_id'] ?? Auth::id();
        $property = Property::create($validated);
        $this->logActivity('property_created', $property);
        return response()->json(['data' => $property, 'message' => 'Property created'], 201);
    }

    public function updateProperty(Request $request, $id) {
        $this->checkAdmin();
        $property = Property::findOrFail($id);
        $property->update($request->only([
            'title', 'description', 'price', 'address', 'city', 'state', 'zip', 'country',
            'bedrooms', 'bathrooms', 'sqft', 'property_type_id', 'realtor_id', 'status',
            'approval_status', 'featured', 'premium', 'year_built', 'lot_size', 'parking_spaces',
            'amenities', 'nearby_places', 'video_url', 'virtual_tour_url',
        ]));
        $this->logActivity('property_updated', $property);
        return response()->json(['data' => $property->fresh('images'), 'message' => 'Property updated']);
    }

    public function destroyProperty($id) {
        $this->checkAdmin();
        $property = Property::findOrFail($id);
        $this->logActivity('property_deleted', $property);
        $property->delete();
        return response()->json(['message' => 'Property deleted']);
    }

    public function updatePropertyApproval(Request $request, $id) {
        $this->checkAdmin();
        $request->validate(['approval_status' => 'required|in:draft,pending,approved,rejected']);
        $property = Property::findOrFail($id);
        $property->update([
            'approval_status' => $request->approval_status,
            'status' => $request->approval_status === 'approved' ? 'active' : $property->status,
        ]);
        $this->logActivity('property_approval_'.$request->approval_status, $property);
        return response()->json(['data' => $property->fresh(), 'message' => 'Property '.$request->approval_status]);
    }

    /* ───────────────────── Agents CRUD ───────────────────── */

    public function storeAgent(Request $request) {
        $this->checkAdmin();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string',
            'headline' => 'nullable|string',
            'bio' => 'nullable|string',
            'license_number' => 'nullable|string',
            'brokerage_name' => 'nullable|string',
            'status' => 'nullable|string|in:pending,approved,suspended,rejected',
            'is_featured' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'] ?? 'ChangeMe123!',
            'phone' => $validated['phone'] ?? null,
            'role' => 'agent',
            'status' => 'active',
        ]);

        $profile = AgentProfile::create([
            'user_id' => $user->id,
            'slug' => \Illuminate\Support\Str::slug($validated['name']).'-'.\Illuminate\Support\Str::random(4),
            'headline' => $validated['headline'] ?? 'Real Estate Agent',
            'bio' => $validated['bio'] ?? '',
            'license_number' => $validated['license_number'] ?? null,
            'brokerage_name' => $validated['brokerage_name'] ?? 'Domestic Real Estate',
            'status' => $validated['status'] ?? 'approved',
            'is_featured' => $validated['is_featured'] ?? false,
            'is_published' => $validated['is_published'] ?? true,
            'approved_at' => ($validated['status'] ?? 'approved') === 'approved' ? now() : null,
        ]);

        $this->logActivity('agent_created', $profile);
        return response()->json(['data' => $profile->load('user'), 'message' => 'Agent created'], 201);
    }

    public function updateAgent(Request $request, $id) {
        $this->checkAdmin();
        $profile = AgentProfile::with('user')->findOrFail($id);
        $profile->update($request->only([
            'headline', 'bio', 'license_number', 'brokerage_name', 'broker_name',
            'status', 'is_featured', 'is_published', 'years_experience',
            'office_city', 'office_state', 'specialties', 'languages',
        ]));
        if ($request->filled('name') || $request->filled('email') || $request->filled('phone')) {
            $profile->user?->update($request->only(['name', 'email', 'phone']));
        }
        if ($request->status === 'approved' && ! $profile->approved_at) {
            $profile->update(['approved_at' => now(), 'is_published' => true]);
        }
        $this->logActivity('agent_updated', $profile);
        return response()->json(['data' => $profile->fresh('user'), 'message' => 'Agent updated']);
    }

    public function destroyAgent($id) {
        $this->checkAdmin();
        $profile = AgentProfile::findOrFail($id);
        $this->logActivity('agent_deleted', $profile);
        $profile->delete();
        return response()->json(['message' => 'Agent deleted']);
    }

    public function sendAgentPaymentLink(Request $request, $id) {
        $this->checkAdmin();
        $profile = AgentProfile::with('user')->findOrFail($id);

        $validated = $request->validate([
            'payoneer_checkout_url' => 'required|url|max:2048',
        ]);

        if (!$profile->user?->email) {
            return response()->json(['message' => 'This agent has no email on file.'], 422);
        }

        $profile->update([
            'payoneer_checkout_url' => $validated['payoneer_checkout_url'],
            'payment_link_sent_at' => now(),
        ]);

        \Illuminate\Support\Facades\Mail::to($profile->user->email)
            ->queue(new \App\Mail\SendAgentPaymentLink($profile));

        $this->logActivity('agent_payment_link_sent', $profile);

        return response()->json([
            'message' => 'Payment link emailed to agent.',
            'data' => [
                'payment_link_sent_at' => $profile->payment_link_sent_at,
                'payoneer_checkout_url' => $profile->payoneer_checkout_url,
            ],
        ]);
    }

    public function notifications(Request $request) {
        $this->checkAdmin();
        $query = \App\Models\Notification::query()->where('user_id', Auth::id());

        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }
        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }
        if ($request->boolean('unread_only')) {
            $query->whereNull('read_at');
        }
        if ($request->boolean('open_only')) {
            $query->whereNull('resolved_at');
        }

        $notifications = $query->orderByRaw(
            // Critical unresolved alerts first, then newest.
            "CASE severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 ELSE 2 END"
        )->orderBy('created_at', 'desc')->paginate(50);

        $base = fn () => \App\Models\Notification::where('user_id', Auth::id());

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'total' => $notifications->total(),
            ],
            'counts' => [
                'unread' => (clone $base())->whereNull('read_at')->count(),
                'open_critical' => (clone $base())->where('severity', 'critical')->whereNull('resolved_at')->count(),
                'open_warning' => (clone $base())->where('severity', 'warning')->whereNull('resolved_at')->count(),
            ],
        ]);
    }

    /** Mark an alert as handled so it stops counting as an open issue. */
    public function resolveNotification($id) {
        $this->checkAdmin();
        $notification = \App\Models\Notification::where('user_id', Auth::id())->findOrFail($id);
        $notification->update([
            'resolved_at' => now(),
            'resolved_by' => Auth::id(),
            'read_at' => $notification->read_at ?? now(),
        ]);
        return response()->json(['success' => true, 'message' => 'Alert marked as resolved', 'data' => $notification]);
    }

    public function markNotificationRead($id) {
        $this->checkAdmin();
        $notification = \App\Models\Notification::where('user_id', Auth::id())->findOrFail($id);
        $notification->update(['read_at' => now()]);
        return response()->json(['success' => true, 'message' => 'Notification marked as read']);
    }

    public function markAllNotificationsRead() {
        $this->checkAdmin();
        \App\Models\Notification::where('user_id', Auth::id())->whereNull('read_at')->update(['read_at' => now()]);
        return response()->json(['success' => true, 'message' => 'All notifications marked as read']);
    }

    public function destroyNotification($id) {
        $this->checkAdmin();
        $notification = \App\Models\Notification::where('user_id', Auth::id())->findOrFail($id);
        $notification->delete();
        return response()->json(['success' => true, 'message' => 'Notification deleted']);
    }
}

