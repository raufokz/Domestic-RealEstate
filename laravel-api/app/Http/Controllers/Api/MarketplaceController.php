<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\MarketplaceLeadPurchase;
use App\Models\MarketplacePaymentLog;
use App\Models\Notification;
use App\Models\Payout;
use App\Models\PurchasedLead;
use App\Models\User;
use App\Services\Payments\PayoneerService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MarketplaceController extends Controller
{
    /** How long a lead is held before payment is initiated. */
    public const RESERVATION_MINUTES = 3;

    /** Once manual payment is initiated, how long the lead is held for admin confirmation. */
    public const HOLD_HOURS = 48;

    private const STATUS_NONE = 'none';
    private const STATUS_AVAILABLE = 'available';
    private const STATUS_RESERVED = 'reserved';
    private const STATUS_SOLD = 'sold';

    public function __construct(private PayoneerService $payments)
    {
    }

    /** Check if admin user. */
    private function checkAdmin(): void
    {
        $user = Auth::user();
        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    /** Check if user is permitted to use PPL Marketplace. */
    private function checkPplPermission(User $user): void
    {
        if (in_array($user->role, ['admin', 'super_admin'])) {
            return;
        }

        if (isset($user->ppl_eligible) && !$user->ppl_eligible) {
            abort(403, 'Your account is not eligible for the Pay-Per-Lead Marketplace program.');
        }

        if (isset($user->ppl_access_enabled) && !$user->ppl_access_enabled) {
            abort(403, 'Pay-Per-Lead Marketplace access is disabled for your account by an administrator.');
        }
    }

    /** Release any reservation that expired without a pending/paid purchase. */
    public static function releaseExpiredReservations(): void
    {
        $expired = Lead::where('marketplace_status', self::STATUS_RESERVED)
            ->whereNotNull('reservation_expires_at')
            ->where('reservation_expires_at', '<', now())
            ->get();

        foreach ($expired as $lead) {
            $active = MarketplaceLeadPurchase::where('lead_id', $lead->id)
                ->whereIn('status', ['pending', 'paid'])
                ->exists();

            if ($active) continue;

            $lead->forceFill([
                'marketplace_status' => self::STATUS_AVAILABLE,
                'reserved_by' => null,
                'reservation_expires_at' => null,
            ])->save();
        }
    }

    private function notifyUser(User $user, string $title, string $message, ?string $actionUrl = null, ?string $actionLabel = null, array $data = []): void
    {
        Notification::create([
            'user_id' => $user->id,
            'type' => 'marketplace',
            'severity' => Notification::SEVERITY_INFO,
            'module' => 'marketplace',
            'title' => $title,
            'message' => $message,
            'action_url' => $actionUrl,
            'action_label' => $actionLabel,
            'data' => $data,
        ]);
    }

    private function notifyAllUsers(string $title, string $message, ?string $actionUrl = null, ?string $actionLabel = null, array $data = []): void
    {
        $userId = Auth::id();
        $rows = User::where('status', 'active')
            ->pluck('id')
            ->filter(fn ($id) => $id !== $userId)
            ->map(fn ($id) => [
                'user_id' => $id,
                'type' => 'marketplace',
                'severity' => Notification::SEVERITY_INFO,
                'module' => 'marketplace',
                'title' => $title,
                'message' => $message,
                'action_url' => $actionUrl,
                'action_label' => $actionLabel,
                'data' => json_encode($data),
                'created_at' => now(),
                'updated_at' => now(),
            ])->all();

        if (!empty($rows)) {
            Notification::insert($rows);
        }
    }

    /** Public-facing (sanitized) marketplace payload — contact info hidden until purchased. */
    private function sanitize(Lead $lead, User $user): array
    {
        $status = $lead->marketplace_status;
        $reservedByMe = $status === self::STATUS_RESERVED && $lead->reserved_by === $user->id;
        $soldToMe = $status === self::STATUS_SOLD && $lead->sold_to === $user->id;

        $attachmentsCount = is_array($lead->attachments) ? count($lead->attachments) : 0;

        return [
            'id' => $lead->id,
            'lead_number' => $lead->lead_number,
            'title' => $lead->marketplace_title ?: ($lead->marketplace_category ?: 'Real Estate Lead'),
            'category' => $lead->marketplace_category,
            'description' => $lead->marketplace_description,
            'price' => (float) $lead->marketplace_price,
            'pricing_model' => $lead->pricing_model ?? 'pay_per_lead',
            'commission_rate' => $lead->commission_rate !== null ? (float) $lead->commission_rate : null,
            'payout_method' => $lead->payout_method ?? null,
            'status' => $status,
            'location' => $lead->location,
            'state' => $lead->state,
            'city' => $lead->city,
            'budget_min' => (float) ($lead->budget_min ?? 0),
            'budget_max' => (float) ($lead->budget_max ?? 0),
            'type' => $lead->type,
            'listed_at' => $lead->listed_at?->toISOString(),
            'views_count' => (int) ($lead->views_count ?? 0),
            'attachments_count' => $attachmentsCount,
            'reserved_by_me' => $reservedByMe,
            'sold_to_me' => $soldToMe,
            'reservation_expires_at' => $status === self::STATUS_RESERVED
                ? $lead->reservation_expires_at?->toISOString()
                : null,
            'purchase' => $soldToMe ? [
                'paid_at' => $lead->sold_at?->toISOString(),
                'amount' => (float) $lead->marketplace_price,
            ] : null,
        ];
    }

    private function adminLeadPayload(Lead $lead): array
    {
        $purchase = $lead->marketplacePurchase;
        return array_merge($lead->toArray(), [
            'active_purchase' => $purchase ? [
                'id' => $purchase->id,
                'user_id' => $purchase->user_id,
                'user_name' => $purchase->user?->name,
                'user_email' => $purchase->user?->email,
                'status' => $purchase->status,
                'amount' => (float) $purchase->amount,
                'purchased_at' => $purchase->purchased_at?->toISOString(),
            ] : null,
        ]);
    }

    /**
     * List marketplace leads (sanitized, with searching, filtering, sorting, pagination).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $this->checkPplPermission($user);
        self::releaseExpiredReservations();

        $query = Lead::listed()
            ->with(['reservedBy', 'soldToUser'])
            ->where(function ($q) {
                $q->whereNull('publish_at')
                  ->orWhere('publish_at', '<=', now());
            });

        // Search query across title, description, location, city, state, category, type, names, motivation, property type
        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('marketplace_title', 'like', $search)
                  ->orWhere('marketplace_description', 'like', $search)
                  ->orWhere('marketplace_category', 'like', $search)
                  ->orWhere('location', 'like', $search)
                  ->orWhere('city', 'like', $search)
                  ->orWhere('state', 'like', $search)
                  ->orWhere('lead_number', 'like', $search)
                  ->orWhere('first_name', 'like', $search)
                  ->orWhere('last_name', 'like', $search)
                  ->orWhere('type', 'like', $search)
                  ->orWhere('motivation', 'like', $search)
                  ->orWhere('property_type', 'like', $search);
            });
        }

        // State filter
        if ($request->filled('state')) {
            $query->where('state', $request->state);
        }

        // City filter
        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        // Category filter
        if ($request->filled('category')) {
            $query->where('marketplace_category', $request->category);
        }

        // Lead Type filter
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Pricing model filter (pay_per_lead / pay_at_closing)
        if ($request->filled('pricing_model')) {
            $query->where('pricing_model', $request->pricing_model);
        } else {
            // Default marketplace view is Pay-Per-Lead only.
            $query->where('pricing_model', 'pay_per_lead');
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('marketplace_price', '>=', (float) $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('marketplace_price', '<=', (float) $request->max_price);
        }

        // Date posted filter
        if ($request->filled('date_posted')) {
            switch ($request->date_posted) {
                case 'today':
                    $query->where('listed_at', '>=', now()->startOfDay());
                    break;
                case 'this_week':
                    $query->where('listed_at', '>=', now()->startOfWeek());
                    break;
                case 'this_month':
                    $query->where('listed_at', '>=', now()->startOfMonth());
                    break;
            }
        }

        // Sorting
        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('marketplace_price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('marketplace_price', 'desc');
                break;
            case 'oldest':
                $query->orderBy('listed_at', 'asc');
                break;
            case 'newest':
            default:
                $query->orderByDesc('listed_at');
                break;
        }

        $perPage = min((int) $request->get('per_page', 24), 100);
        $leads = $query->paginate($perPage);

        return response()->json([
            'data' => collect($leads->items())->map(fn (Lead $lead) => $this->sanitize($lead, $user)),
            'meta' => [
                'current_page' => $leads->currentPage(),
                'last_page' => $leads->lastPage(),
                'per_page' => $leads->perPage(),
                'total' => $leads->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $this->checkPplPermission($user);
        self::releaseExpiredReservations();

        $lead = Lead::listed()->findOrFail($id);
        $lead->increment('views_count');

        return response()->json($this->sanitize($lead, $user));
    }

    /**
     * Reserve lead for purchase (atomic lock).
     */
    public function reserve(Request $request, $id)
    {
        $user = $request->user();
        $this->checkPplPermission($user);

        $result = DB::transaction(function () use ($id, $user) {
            $lead = Lead::whereKey($id)->lockForUpdate()->first();

            if (!$lead || $lead->marketplace_status === self::STATUS_NONE) {
                abort(404, 'This lead is not available in the marketplace.');
            }

            if ($lead->marketplace_status === self::STATUS_SOLD) {
                abort(409, 'This lead has already been sold.');
            }

            if ($lead->marketplace_status === self::STATUS_RESERVED) {
                if ($lead->reserved_by === $user->id) {
                    $purchase = MarketplaceLeadPurchase::where('lead_id', $lead->id)
                        ->where('user_id', $user->id)
                        ->where('status', MarketplaceLeadPurchase::STATUS_PENDING)
                        ->first();

                    if ($purchase) {
                        return [
                            'token' => $purchase->reservation_token,
                            'expires_at' => $purchase->expires_at->toISOString(),
                            'reserved' => true,
                        ];
                    }
                }

                abort(409, 'This lead is currently reserved by another buyer.');
            }

            $expiresAt = now()->addMinutes(self::RESERVATION_MINUTES);
            $token = Str::random(64);

            MarketplaceLeadPurchase::create([
                'lead_id' => $lead->id,
                'user_id' => $user->id,
                'amount' => $lead->marketplace_price,
                'status' => MarketplaceLeadPurchase::STATUS_PENDING,
                'reservation_token' => $token,
                'reserved_at' => now(),
                'expires_at' => $expiresAt,
            ]);

            $lead->forceFill([
                'marketplace_status' => self::STATUS_RESERVED,
                'reserved_by' => $user->id,
                'reservation_expires_at' => $expiresAt,
            ])->save();

            return [
                'token' => $token,
                'expires_at' => $expiresAt->toISOString(),
                'reserved' => true,
            ];
        });

        return response()->json($result);
    }

    /**
     * Initiate or process payment for reserved lead (supports instant card payment & manual transfer).
     */
    public function purchase(Request $request, $id)
    {
        $user = $request->user();
        $this->checkPplPermission($user);
        $request->validate([
            'token' => 'required|string',
            'payment_method' => 'nullable|string|in:payoneer,bank_transfer',
        ]);

        $paymentMethod = $request->get('payment_method', 'payoneer');

        // Validate + lock the reservation inside its own short transaction —
        // the actual Payoneer API call happens OUTSIDE any DB transaction
        // (never hold a row lock across a network call to a third party).
        $context = DB::transaction(function () use ($id, $user, $request, $paymentMethod) {
            $lead = Lead::whereKey($id)->lockForUpdate()->first();
            abort_if(!$lead, 404, 'Lead not found.');

            $purchase = MarketplaceLeadPurchase::where('lead_id', $lead->id)
                ->where('user_id', $user->id)
                ->where('status', MarketplaceLeadPurchase::STATUS_PENDING)
                ->first();

            abort_if(!$purchase, 422, 'Your reservation is no longer valid. Please reserve the lead again.');

            if (!hash_equals((string) $purchase->reservation_token, (string) $request->token)) {
                abort(403, 'Invalid reservation token.');
            }

            if ($lead->marketplace_status !== self::STATUS_RESERVED || $lead->reserved_by !== $user->id) {
                abort(409, 'This lead is no longer reserved for you.');
            }

            if ($purchase->expires_at && $purchase->expires_at->isPast()) {
                $purchase->update(['status' => MarketplaceLeadPurchase::STATUS_CANCELLED]);
                $lead->forceFill([
                    'marketplace_status' => self::STATUS_AVAILABLE,
                    'reserved_by' => null,
                    'reservation_expires_at' => null,
                ])->save();

                MarketplacePaymentLog::create([
                    'purchase_id' => $purchase->id,
                    'lead_id' => $lead->id,
                    'user_id' => $user->id,
                    'payment_gateway' => $paymentMethod,
                    'amount' => $lead->marketplace_price,
                    'status' => 'failed',
                    'error_message' => 'Reservation expired before payment submission',
                ]);

                abort(409, 'Your reservation expired. The lead is available again — try reserving it now.');
            }

            return ['lead' => $lead, 'purchase' => $purchase];
        });

        $lead = $context['lead'];
        $purchase = $context['purchase'];

        if ($paymentMethod === 'payoneer') {
            // Real checkout session — nothing is marked paid here. The lead
            // unlocks only when handleWebhook() receives a SIGNATURE-VERIFIED
            // payment.succeeded event from Payoneer. Never trust this HTTP
            // response as proof of payment.
            $session = $this->payments->createCheckoutSession([
                'amount' => $lead->marketplace_price,
                'currency' => 'USD',
                'description' => 'Lead: ' . ($lead->marketplace_title ?: $lead->lead_number),
                'reference_id' => (string) $purchase->id,
                'customer_email' => $user->email,
                'success_url' => rtrim(config('app.frontend_url'), '/') . '/marketplace/purchased?purchase=' . $purchase->id,
                'cancel_url' => rtrim(config('app.frontend_url'), '/') . '/marketplace?cancelled=' . $purchase->id,
            ]);

            $purchase->update([
                'payment_gateway' => 'payoneer',
                'gateway_checkout_id' => $session['checkout_id'],
                'gateway_checkout_url' => $session['checkout_url'],
            ]);

            MarketplacePaymentLog::create([
                'purchase_id' => $purchase->id,
                'lead_id' => $lead->id,
                'user_id' => $user->id,
                'payment_gateway' => 'payoneer',
                'gateway_transaction_id' => $session['checkout_id'],
                'amount' => $lead->marketplace_price,
                'status' => 'pending',
                'payload' => ['checkout_url' => $session['checkout_url']],
            ]);

            return response()->json([
                'status' => 'checkout_created',
                'message' => 'Redirecting to secure Payoneer checkout to complete payment.',
                'checkout_url' => $session['checkout_url'],
                'lead_id' => $lead->id,
            ]);
        }

        // Manual bank transfer / awaiting confirmation flow
        $holdUntil = now()->addHours(self::HOLD_HOURS);
        $purchase->update(['expires_at' => $holdUntil, 'payment_gateway' => 'bank_transfer']);
        $lead->update(['reservation_expires_at' => $holdUntil]);

        MarketplacePaymentLog::create([
            'purchase_id' => $purchase->id,
            'lead_id' => $lead->id,
            'user_id' => $user->id,
            'payment_gateway' => 'bank_transfer',
            'amount' => $lead->marketplace_price,
            'status' => 'pending',
            'payload' => ['hold_until' => $holdUntil->toDateTimeString()],
        ]);

        return response()->json([
            'status' => 'awaiting_confirmation',
            'message' => 'Payment submitted for processing. Lead is held for you while payment is confirmed.',
            'expires_at' => $holdUntil->toISOString(),
        ]);
    }

    /**
     * Claim a Pay-at-Closing lead. No upfront payment: the agent takes the lead
     * now and pays the recorded commission at closing (via Payoneer by default).
     */
    public function claim(Request $request, $id)
    {
        $user = $request->user();
        $this->checkPplPermission($user);

        $result = DB::transaction(function () use ($id, $user) {
            $lead = Lead::whereKey($id)->lockForUpdate()->first();

            abort_if(!$lead || $lead->marketplace_status === self::STATUS_NONE, 404, 'This lead is not available in the marketplace.');
            abort_if(($lead->pricing_model ?? 'pay_per_lead') !== 'pay_at_closing', 422, 'This lead is not available on a Pay-at-Closing basis.');
            abort_if($lead->marketplace_status === self::STATUS_SOLD, 409, 'This lead has already been claimed by another agent.');
            abort_if($lead->marketplace_status === self::STATUS_RESERVED, 409, 'This lead is currently reserved by another buyer.');

            $commission = $lead->commission_rate ?? 0;
            $payoutMethod = $lead->payout_method ?? 'payoneer';

            MarketplaceLeadPurchase::create([
                'lead_id' => $lead->id,
                'user_id' => $user->id,
                'amount' => 0,
                'status' => MarketplaceLeadPurchase::STATUS_PENDING,
                'reserved_at' => now(),
                'purchased_at' => null,
                'notes' => 'Claimed — Pay-at-Closing via ' . ucfirst($payoutMethod),
            ]);

            $lead->forceFill([
                'marketplace_status' => self::STATUS_SOLD,
                'sold_to' => $user->id,
                'sold_at' => now(),
                'reserved_by' => null,
                'reservation_expires_at' => null,
            ])->save();

            PurchasedLead::firstOrCreate(
                ['lead_id' => $lead->id, 'user_id' => $user->id],
                [
                    'amount' => 0,
                    'purchased_at' => now(),
                    'commission_amount' => $commission,
                    'payout_method' => $payoutMethod,
                    'payout_email' => $lead->payout_email,
                    'payout_status' => 'pending',
                    'claimed_at' => now(),
                ]
            );

            MarketplacePaymentLog::create([
                'purchase_id' => MarketplaceLeadPurchase::where('lead_id', $lead->id)->latest('id')->value('id'),
                'lead_id' => $lead->id,
                'user_id' => $user->id,
                'payment_gateway' => $payoutMethod,
                'amount' => $commission,
                'status' => 'pending',
                'payload' => ['pay_at_closing' => true, 'claimed_at' => now()->toDateTimeString()],
            ]);

            $this->notifyUser(
                $user,
                'Lead claimed',
                'You claimed "' . ($lead->marketplace_title ?: $lead->lead_number) . '" on a Pay-at-Closing basis. Commission of $' . number_format((float) $commission, 2) . ' is due at closing.',
                '/agent/dashboard/marketplace/pay-at-closing',
                'View my claims',
                ['lead_id' => $lead->id]
            );

            return [
                'status' => 'claimed',
                'message' => 'Lead claimed on a Pay-at-Closing basis. Commission is due at closing.',
                'lead_id' => $lead->id,
            ];
        });

        return response()->json($result);
    }

    /**
     * Webhook receiver for external payment gateways.
     */
    /**
     * Payoneer webhook — the ONLY path that can ever mark a marketplace
     * purchase paid. Requires a valid signature; anything else is rejected
     * with 401 and never touches the database. Idempotent: replays of an
     * already-processed event are safely ignored.
     */
    public function handleWebhook(Request $request)
    {
        $signature = $request->header('X-Payoneer-Signature'); // VERIFY exact header name against live Payoneer docs
        if (!$this->payments->verifyWebhookSignature($request->getContent(), $signature)) {
            Log::warning('Rejected marketplace webhook with invalid/missing signature', ['ip' => $request->ip()]);
            return ApiResponse::fail(
                'Invalid signature.',
                'invalid_signature',
                401,
                reason: 'the webhook signature did not match',
            );
        }

        $payload = $request->all();
        $event = $request->input('event', 'payment.succeeded');
        $txnId = $request->input('transaction_id') ?: $request->input('data.id');
        // reference_id is OUR value, set by createCheckoutSession() — safe
        // to trust as a purchase lookup key only because the signature
        // above already proved this payload really came from Payoneer.
        $purchaseId = $request->input('reference_id') ?: $request->input('data.reference_id');

        Log::info('Marketplace payment webhook received', ['event' => $event, 'txn' => $txnId]);

        if (!$purchaseId) {
            return response()->json(['message' => 'Webhook received (no reference_id matched).'], 200);
        }

        $purchase = MarketplaceLeadPurchase::with('lead')->find($purchaseId);
        if (!$purchase) {
            return ApiResponse::fail(
                'Purchase record not found.',
                'not_found',
                404,
                reason: 'no marketplace purchase matches the reference id in this webhook payload',
            );
        }

        if ($event === 'payment.succeeded' && $purchase->status !== MarketplaceLeadPurchase::STATUS_PAID) {
            DB::transaction(function () use ($purchase, $txnId, $payload) {
                $purchase->update([
                    'status' => MarketplaceLeadPurchase::STATUS_PAID,
                    'purchased_at' => now(),
                    'notes' => 'Confirmed via Payoneer webhook (' . $txnId . ')',
                ]);

                $lead = Lead::whereKey($purchase->lead_id)->lockForUpdate()->first();
                if ($lead) {
                    $lead->forceFill([
                        'marketplace_status' => self::STATUS_SOLD,
                        'sold_to' => $purchase->user_id,
                        'sold_at' => now(),
                        'reserved_by' => null,
                        'reservation_expires_at' => null,
                    ])->save();

                    PurchasedLead::firstOrCreate(
                        ['lead_id' => $lead->id, 'user_id' => $purchase->user_id],
                        ['amount' => $purchase->amount, 'purchased_at' => now()]
                    );

                    if ($user = $purchase->user) {
                        $this->notifyUser(
                            $user,
                            'Lead unlocked!',
                            'Payment confirmed. Full contact details for "' . ($lead->marketplace_title ?: $lead->lead_number) . '" are now unlocked.',
                            '/marketplace/purchased',
                            'View my leads',
                            ['lead_id' => $lead->id]
                        );
                    }
                }

                MarketplacePaymentLog::create([
                    'purchase_id' => $purchase->id,
                    'lead_id' => $purchase->lead_id,
                    'user_id' => $purchase->user_id,
                    'payment_gateway' => 'payoneer',
                    'gateway_transaction_id' => $txnId,
                    'amount' => $purchase->amount,
                    'status' => 'successful',
                    'payload' => $payload,
                ]);
            });
        } elseif ($event === 'payment.failed') {
            MarketplacePaymentLog::create([
                'purchase_id' => $purchase->id,
                'lead_id' => $purchase->lead_id,
                'user_id' => $purchase->user_id,
                'payment_gateway' => 'payoneer',
                'gateway_transaction_id' => $txnId,
                'amount' => $purchase->amount,
                'status' => 'failed',
                'payload' => $payload,
                'error_message' => $request->input('failure_reason'),
            ]);
        }

        return response()->json(['message' => 'Webhook processed successfully.']);
    }

    /**
     * Buyer cancels before paying — releases lead back to marketplace.
     */
    public function release(Request $request, $id)
    {
        $user = $request->user();

        DB::transaction(function () use ($id, $user) {
            $lead = Lead::whereKey($id)->lockForUpdate()->firstOrFail();

            $purchase = MarketplaceLeadPurchase::where('lead_id', $lead->id)
                ->where('user_id', $user->id)
                ->where('status', MarketplaceLeadPurchase::STATUS_PENDING)
                ->first();

            if (!$purchase || $lead->marketplace_status !== self::STATUS_RESERVED) {
                abort(409, 'There is nothing to release.');
            }

            $purchase->update(['status' => MarketplaceLeadPurchase::STATUS_CANCELLED]);
            $lead->forceFill([
                'marketplace_status' => self::STATUS_AVAILABLE,
                'reserved_by' => null,
                'reservation_expires_at' => null,
            ])->save();
        });

        return response()->json(['message' => 'Lead released back to the marketplace.']);
    }

    /**
     * Full lead details — purchasers (and admins) only.
     */
    public function details(Request $request, $id)
    {
        $user = $request->user();
        $lead = Lead::with(['soldToUser'])->findOrFail($id);

        $isAdmin = in_array($user->role, ['admin', 'super_admin']);
        $isBuyer = $lead->marketplace_status === self::STATUS_SOLD && $lead->sold_to === $user->id;

        if (!$isAdmin && !$isBuyer) {
            abort(403, 'Full lead details are shared only after verified purchase.');
        }

        return response()->json($lead->load([
            'soldToUser',
            'marketplacePurchases' => fn ($q) => $q->where('status', MarketplaceLeadPurchase::STATUS_PAID),
        ]));
    }

    /**
     * User's purchased leads with searching and filtering.
     */
    public function myPurchases(Request $request)
    {
        $user = $request->user();
        $query = PurchasedLead::with('lead')->where('user_id', $user->id);

        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->whereHas('lead', function ($q) use ($search) {
                $q->where('marketplace_title', 'like', $search)
                  ->orWhere('first_name', 'like', $search)
                  ->orWhere('last_name', 'like', $search)
                  ->orWhere('email', 'like', $search)
                  ->orWhere('phone', 'like', $search)
                  ->orWhere('location', 'like', $search);
            });
        }

        $purchases = $query->latest('purchased_at')->get();
        return response()->json(['data' => $purchases]);
    }

    /**
     * Return printable receipt/invoice details for a purchase.
     */
    public function getInvoice(Request $request, $purchaseId)
    {
        $user = $request->user();
        $purchase = MarketplaceLeadPurchase::with(['lead', 'user'])->findOrFail($purchaseId);

        $isAdmin = in_array($user->role, ['admin', 'super_admin']);
        if (!$isAdmin && $purchase->user_id !== $user->id) {
            abort(403, 'Unauthorized access to invoice.');
        }

        $paymentLog = MarketplacePaymentLog::where('purchase_id', $purchase->id)
            ->where('status', 'successful')
            ->first();

        return response()->json([
            'invoice_number' => 'INV-PPL-' . str_pad($purchase->id, 6, '0', STR_PAD_LEFT),
            'purchase_id' => $purchase->id,
            'lead_number' => $purchase->lead?->lead_number,
            'lead_title' => $purchase->lead?->marketplace_title ?: 'Real Estate Lead',
            'customer_name' => $purchase->user?->name,
            'customer_email' => $purchase->user?->email,
            'amount' => (float) $purchase->amount,
            'status' => $purchase->status,
            'payment_gateway' => $paymentLog?->payment_gateway ?? 'Credit Card',
            'transaction_id' => $paymentLog?->gateway_transaction_id ?? ('TXN-' . $purchase->id),
            'purchased_at' => $purchase->purchased_at?->toISOString() ?: $purchase->created_at->toISOString(),
            'company' => [
                'name' => 'Domestic Real Estate',
                'address' => 'USA Nationwide Network',
                'support_email' => 'info@domesticrealestate.us',
            ],
        ]);
    }

    /**
     * Export lead details (CSV / JSON format).
     */
    public function exportLead(Request $request, $id)
    {
        $user = $request->user();
        $lead = Lead::findOrFail($id);

        $isAdmin = in_array($user->role, ['admin', 'super_admin']);
        $isBuyer = $lead->marketplace_status === self::STATUS_SOLD && $lead->sold_to === $user->id;

        if (!$isAdmin && !$isBuyer) {
            abort(403, 'Unauthorized export request.');
        }

        $format = strtolower($request->get('format', 'json'));

        if ($format === 'csv') {
            $csvData = [
                ['Lead Number', 'Name', 'Email', 'Phone', 'Type', 'Location', 'State', 'City', 'Budget Min', 'Budget Max', 'Price Paid'],
                [
                    $lead->lead_number,
                    $lead->full_name,
                    $lead->email,
                    $lead->phone,
                    $lead->type,
                    $lead->location,
                    $lead->state,
                    $lead->city,
                    $lead->budget_min,
                    $lead->budget_max,
                    $lead->marketplace_price,
                ]
            ];

            $output = fopen('php://temp', 'r+');
            foreach ($csvData as $row) {
                fputcsv($output, $row);
            }
            rewind($output);
            $csvContent = stream_get_contents($output);
            fclose($output);

            return response($csvContent, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="lead-' . $lead->lead_number . '.csv"',
            ]);
        }

        return response()->json([
            'lead_number' => $lead->lead_number,
            'name' => $lead->full_name,
            'email' => $lead->email,
            'phone' => $lead->phone,
            'type' => $lead->type,
            'location' => $lead->location,
            'state' => $lead->state,
            'city' => $lead->city,
            'budget_min' => $lead->budget_min,
            'budget_max' => $lead->budget_max,
            'price_paid' => $lead->marketplace_price,
            'notes' => $lead->notes,
            'description' => $lead->marketplace_description,
        ]);
    }

    /** The signed-in user's notifications. */
    public function notifications(Request $request)
    {
        $user = $request->user();
        $notifications = Notification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['id', 'type', 'severity', 'module', 'title', 'message', 'action_url', 'action_label', 'read_at', 'data', 'created_at']);

        return response()->json(['data' => $notifications]);
    }

    public function markNotificationsRead(Request $request)
    {
        $request->validate(['ids' => 'nullable|array']);
        $query = Notification::where('user_id', $request->user()->id)->whereNull('read_at');
        if ($request->filled('ids')) {
            $query->whereIn('id', $request->ids);
        }
        $query->update(['read_at' => now()]);
        return response()->json(['message' => 'Notifications marked as read.']);
    }

    /*
    |--------------------------------------------------------------------------
    | Admin Management & Analytics
    |--------------------------------------------------------------------------
    */

    public function adminIndex(Request $request)
    {
        $this->checkAdmin();
        $query = Lead::listed()
            ->with(['reservedBy', 'soldToUser', 'marketplacePurchase.user']);

        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('marketplace_title', 'like', $search)
                  ->orWhere('location', 'like', $search)
                  ->orWhere('lead_number', 'like', $search);
            });
        }

        if ($request->filled('status')) {
            $query->where('marketplace_status', $request->status);
        }

        $leads = $query->orderByDesc('listed_at')
            ->paginate($request->get('per_page', 25));

        return response()->json($leads);
    }

    public function adminPurchases(Request $request)
    {
        $this->checkAdmin();
        $purchases = MarketplaceLeadPurchase::with(['lead', 'user'])
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 25));

        return response()->json($purchases);
    }

    /** Pay-at-Closing claims (agent claims + commission payouts). */
    public function adminPayouts(Request $request)
    {
        $this->checkAdmin();
        $query = PurchasedLead::with('lead', 'user')
            ->whereNotNull('payout_method');

        if ($request->filled('status')) {
            $query->where('payout_status', $request->status);
        }

        return response()->json($query->latest('claimed_at')->paginate($request->get('per_page', 25)));
    }

    /**
     * Admin approves a Pay-at-Closing commission for payout, or cancels it.
     * "paid" is no longer set directly here — approving creates a real
     * Payout row and calls PayoneerService::createPayout(); the recipient
     * only shows as actually paid once handlePayoutWebhook() below
     * receives a signature-verified confirmation. "cancelled" involves no
     * money movement, so that stays a direct admin decision.
     */
    public function adminMarkPayout(Request $request, $purchasedLeadId)
    {
        $this->checkAdmin();
        $admin = $request->user();
        $validated = $request->validate([
            'payout_status' => 'required|in:paid,cancelled',
            'closing_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $purchased = PurchasedLead::with(['lead', 'user'])->findOrFail($purchasedLeadId);

        abort_if($purchased->payout_method === null, 422, 'This is not a Pay-at-Closing purchase.');

        if ($validated['payout_status'] === 'cancelled') {
            $purchased->update([
                'payout_status' => 'cancelled',
                'closing_date' => $validated['closing_date'] ?? $purchased->closing_date,
            ]);

            $this->notifyUser(
                $purchased->user,
                'Payout cancelled',
                'Your Pay-at-Closing commission for "' . ($purchased->lead?->marketplace_title ?: 'a lead') . '" was cancelled.',
                '/agent/dashboard/marketplace/pay-at-closing',
                'View claims',
                ['purchase_id' => $purchased->id]
            );

            return response()->json(['message' => 'Payout cancelled.', 'data' => $purchased->fresh()]);
        }

        if (!$purchased->payout_email) {
            return response()->json(['message' => 'This agent has no Payoneer payout email on file yet — ask them to add one before approving payout.'], 422);
        }

        $payout = Payout::create([
            'recipient_id' => $purchased->user_id,
            'purchased_lead_id' => $purchased->id,
            'amount' => $purchased->commission_amount,
            'gateway' => $purchased->payout_method ?: 'payoneer',
            'status' => Payout::STATUS_APPROVED,
            'requested_by' => $admin->id,
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);

        $result = $this->payments->createPayout([
            'payee_id' => $purchased->payout_email,
            'amount' => $purchased->commission_amount,
            'description' => 'Pay-at-Closing commission: ' . ($purchased->lead?->marketplace_title ?: $purchased->lead?->lead_number),
            'reference_id' => (string) $payout->id,
        ]);

        $payout->update([
            'status' => Payout::STATUS_PROCESSING,
            'gateway_payout_id' => $result['payout_id'],
        ]);

        $purchased->update([
            'payout_status' => 'processing',
            'closing_date' => $validated['closing_date'] ?? $purchased->closing_date,
        ]);

        $this->notifyUser(
            $purchased->user,
            'Payout processing',
            'Your Pay-at-Closing commission of $' . number_format((float) $purchased->commission_amount, 2)
                . ' for "' . ($purchased->lead?->marketplace_title ?: 'a lead') . '" is now processing via Payoneer.',
            '/agent/dashboard/marketplace/pay-at-closing',
            'View claims',
            ['purchase_id' => $purchased->id]
        );

        return response()->json(['message' => 'Payout submitted to Payoneer — processing.', 'data' => $purchased->fresh()]);
    }

    /**
     * Payoneer payout webhook — signature-verified, the only path that can
     * ever flip a Payout (and the linked PurchasedLead) to paid/failed.
     */
    public function handlePayoutWebhook(Request $request)
    {
        $signature = $request->header('X-Payoneer-Signature'); // VERIFY header name against live docs
        if (!$this->payments->verifyWebhookSignature($request->getContent(), $signature)) {
            Log::warning('Rejected payout webhook with invalid/missing signature', ['ip' => $request->ip()]);
            return ApiResponse::fail(
                'Invalid signature.',
                'invalid_signature',
                401,
                reason: 'the webhook signature did not match',
            );
        }

        $event = $request->input('event', 'payout.paid');
        $payoutId = $request->input('reference_id') ?: $request->input('data.reference_id');
        $gatewayPayoutId = $request->input('payout_id') ?: $request->input('data.id');

        $payout = Payout::with('purchasedLead')->find($payoutId);
        if (!$payout) {
            return ApiResponse::fail(
                'Payout record not found.',
                'not_found',
                404,
                reason: 'no payout matches the reference id in this webhook payload',
            );
        }

        if ($event === 'payout.paid' && $payout->status !== Payout::STATUS_PAID) {
            $payout->update([
                'status' => Payout::STATUS_PAID,
                'gateway_payout_id' => $gatewayPayoutId ?: $payout->gateway_payout_id,
                'gateway_status_raw' => $request->all(),
                'paid_at' => now(),
            ]);
            $payout->purchasedLead?->update(['payout_status' => 'paid']);

            if ($payout->recipient) {
                $this->notifyUser(
                    $payout->recipient,
                    'Payout completed',
                    'Your commission payout of $' . number_format((float) $payout->amount, 2) . ' has been paid via Payoneer.',
                    '/agent/dashboard/marketplace/pay-at-closing',
                    'View claims',
                    ['payout_id' => $payout->id]
                );
            }
        } elseif ($event === 'payout.failed') {
            $payout->update([
                'status' => Payout::STATUS_FAILED,
                'gateway_status_raw' => $request->all(),
                'failure_reason' => $request->input('failure_reason'),
            ]);
            $payout->purchasedLead?->update(['payout_status' => 'failed']);
        }

        return response()->json(['message' => 'Webhook processed successfully.']);
    }

    /** CSV export of payouts for admin reporting/reconciliation. */
    public function exportPayouts(Request $request)
    {
        $this->checkAdmin();

        $query = Payout::with(['recipient', 'purchasedLead.lead']);
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        $payouts = $query->orderByDesc('created_at')->limit(10000)->get();

        return response()->streamDownload(function () use ($payouts) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['id', 'recipient', 'lead', 'amount', 'currency', 'gateway', 'gateway_payout_id', 'status', 'approved_at', 'paid_at']);
            foreach ($payouts as $p) {
                fputcsv($out, [
                    $p->id,
                    $p->recipient?->name,
                    $p->purchasedLead?->lead?->marketplace_title,
                    $p->amount,
                    $p->currency,
                    $p->gateway,
                    $p->gateway_payout_id,
                    $p->status,
                    $p->approved_at,
                    $p->paid_at,
                ]);
            }
            fclose($out);
        }, 'payouts-' . now()->format('Y-m-d') . '.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * Agent sets/updates the Payoneer email their commission gets paid to.
     * Required before an admin can approve payout — createPayout() has no
     * recipient to pay without it.
     */
    public function updatePayoutEmail(Request $request, $purchasedLeadId)
    {
        $user = $request->user();
        $validated = $request->validate(['payout_email' => 'required|email']);

        $purchased = PurchasedLead::where('id', $purchasedLeadId)->where('user_id', $user->id)->firstOrFail();

        if ($purchased->payout_status === 'paid') {
            return response()->json(['message' => 'This commission has already been paid.'], 422);
        }

        $purchased->update(['payout_email' => $validated['payout_email']]);

        return response()->json(['message' => 'Payout email saved.', 'data' => $purchased->fresh()]);
    }

    public function adminPaymentLogs(Request $request)
    {
        $this->checkAdmin();
        $logs = MarketplacePaymentLog::with(['lead', 'user', 'purchase'])
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 25));

        return response()->json($logs);
    }

    public function adminUserPermissions(Request $request)
    {
        $this->checkAdmin();
        $users = User::select('id', 'name', 'email', 'role', 'status', 'ppl_eligible', 'ppl_access_enabled')
            ->orderBy('name')
            ->paginate($request->get('per_page', 30));

        return response()->json($users);
    }

    public function adminToggleUserPpl(Request $request, $userId)
    {
        $this->checkAdmin();
        $user = User::findOrFail($userId);
        $request->validate([
            'ppl_eligible' => 'nullable|boolean',
            'ppl_access_enabled' => 'nullable|boolean',
        ]);

        if ($request->has('ppl_eligible')) {
            $user->ppl_eligible = (bool) $request->ppl_eligible;
        }
        if ($request->has('ppl_access_enabled')) {
            $user->ppl_access_enabled = (bool) $request->ppl_access_enabled;
        }
        $user->save();

        return response()->json([
            'message' => 'User PPL permissions updated successfully.',
            'user' => $user,
        ]);
    }

    public function adminStore(Request $request)
    {
        $this->checkAdmin();
        $validated = $request->validate([
            'lead_id' => 'nullable|exists:leads,id',
            'marketplace_title' => 'required|string|max:255',
            'marketplace_category' => 'nullable|string|max:100',
            'marketplace_description' => 'nullable|string|max:2000',
            'marketplace_price' => 'required|numeric|min:0',
            'pricing_model' => 'sometimes|in:pay_per_lead,pay_at_closing',
            'commission_rate' => 'nullable|numeric|min:0|max:99999',
            'payout_method' => 'nullable|string|max:50',
            'payout_email' => 'nullable|email|max:255',
            'location' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:255',
            'budget_min' => 'nullable|numeric',
            'budget_max' => 'nullable|numeric',
            'type' => 'nullable|in:buyer,seller,investor,realtor,vendor',
            'first_name' => 'required_without:lead_id|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required_without:lead_id|email',
            'phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'attachments' => 'nullable|array',
            'publish' => 'nullable|boolean',
            'publish_at' => 'nullable|date',
        ]);

        $lead = null;
        if (!empty($validated['lead_id'])) {
            $lead = Lead::findOrFail($validated['lead_id']);
        } else {
            $lead = Lead::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'] ?? '',
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'normalized_email' => strtolower($validated['email']),
                'type' => $validated['type'] ?? 'buyer',
                'source' => 'marketplace',
                'status' => 'new',
                'notes' => $validated['notes'] ?? null,
                'location' => $validated['location'] ?? null,
                'state' => $validated['state'] ?? null,
                'city' => $validated['city'] ?? null,
            ]);
        }

        $lead->update([
            'marketplace_title' => $validated['marketplace_title'],
            'marketplace_category' => $validated['marketplace_category'] ?? $lead->marketplace_category,
            'marketplace_description' => $validated['marketplace_description'] ?? $lead->marketplace_description,
            'marketplace_price' => $validated['marketplace_price'],
            'pricing_model' => $validated['pricing_model'] ?? ($lead->pricing_model ?? 'pay_per_lead'),
            'commission_rate' => $validated['commission_rate'] ?? $lead->commission_rate,
            'payout_method' => $validated['payout_method'] ?? $lead->payout_method ?? 'payoneer',
            'payout_email' => $validated['payout_email'] ?? $lead->payout_email,
            'location' => $validated['location'] ?? $lead->location,
            'state' => $validated['state'] ?? $lead->state,
            'city' => $validated['city'] ?? $lead->city,
            'budget_min' => $validated['budget_min'] ?? $lead->budget_min,
            'budget_max' => $validated['budget_max'] ?? $lead->budget_max,
            'attachments' => $validated['attachments'] ?? $lead->attachments,
            'publish_at' => $validated['publish_at'] ?? null,
        ]);

        if (($validated['publish'] ?? false) && $lead->marketplace_status !== self::STATUS_SOLD) {
            $lead->update([
                'marketplace_status' => self::STATUS_AVAILABLE,
                'listed_at' => now(),
            ]);
            $this->notifyAllUsers(
                'New Pay-Per-Lead available',
                ($lead->marketplace_title ?: 'A new lead') . ' is now on the marketplace. First to purchase gets exclusive access.',
                '/marketplace',
                'View marketplace',
                ['lead_id' => $lead->id]
            );
        }

        return response()->json([
            'message' => 'Marketplace lead created.',
            'data' => $this->adminLeadPayload($lead->fresh(['marketplacePurchase.user'])),
        ], 201);
    }

    public function adminUpdate(Request $request, $id)
    {
        $this->checkAdmin();
        $lead = Lead::findOrFail($id);
        $validated = $request->validate([
            'marketplace_title' => 'sometimes|string|max:255',
            'marketplace_category' => 'sometimes|nullable|string|max:100',
            'marketplace_description' => 'sometimes|nullable|string|max:2000',
            'marketplace_price' => 'sometimes|numeric|min:0',
            'pricing_model' => 'sometimes|in:pay_per_lead,pay_at_closing',
            'commission_rate' => 'sometimes|nullable|numeric|min:0|max:99999',
            'payout_method' => 'sometimes|nullable|string|max:50',
            'payout_email' => 'sometimes|nullable|email|max:255',
            'location' => 'sometimes|nullable|string|max:255',
            'state' => 'sometimes|nullable|string|max:100',
            'city' => 'sometimes|nullable|string|max:255',
            'budget_min' => 'sometimes|nullable|numeric',
            'budget_max' => 'sometimes|nullable|numeric',
            'notes' => 'sometimes|nullable|string',
            'attachments' => 'sometimes|nullable|array',
            'publish_at' => 'sometimes|nullable|date',
        ]);
        $lead->update($validated);
        return response()->json(['message' => 'Marketplace lead updated.', 'data' => $this->adminLeadPayload($lead->fresh(['marketplacePurchase.user']))]);
    }

    public function adminPublish(Request $request, $id)
    {
        $this->checkAdmin();
        $lead = Lead::findOrFail($id);

        if ($lead->marketplace_status === self::STATUS_SOLD) {
            abort(409, 'Sold leads cannot be re-published. Re-list it instead.');
        }

        $lead->update([
            'marketplace_status' => self::STATUS_AVAILABLE,
            'reserved_by' => null,
            'reservation_expires_at' => null,
            'listed_at' => now(),
        ]);

        $this->notifyAllUsers(
            'New Pay-Per-Lead available',
            ($lead->marketplace_title ?: 'A new lead') . ' is now on the marketplace. First to purchase gets exclusive access.',
            '/marketplace',
            'View marketplace',
            ['lead_id' => $lead->id]
        );

        return response()->json(['message' => 'Lead published to the marketplace.']);
    }

    public function adminUnpublish(Request $request, $id)
    {
        $this->checkAdmin();
        $lead = Lead::findOrFail($id);

        if ($lead->marketplace_status === self::STATUS_RESERVED) {
            MarketplaceLeadPurchase::where('lead_id', $lead->id)
                ->where('status', MarketplaceLeadPurchase::STATUS_PENDING)
                ->update(['status' => MarketplaceLeadPurchase::STATUS_CANCELLED]);
        }

        $lead->update([
            'marketplace_status' => self::STATUS_NONE,
            'reserved_by' => null,
            'reservation_expires_at' => null,
            'listed_at' => null,
        ]);

        return response()->json(['message' => 'Lead removed from the marketplace.']);
    }

    public function adminRelist(Request $request, $id)
    {
        $this->checkAdmin();
        $lead = Lead::findOrFail($id);

        MarketplaceLeadPurchase::where('lead_id', $lead->id)
            ->where('status', MarketplaceLeadPurchase::STATUS_PENDING)
            ->update(['status' => MarketplaceLeadPurchase::STATUS_CANCELLED]);

        PurchasedLead::where('lead_id', $lead->id)->delete();

        $lead->update([
            'marketplace_status' => self::STATUS_AVAILABLE,
            'reserved_by' => null,
            'reservation_expires_at' => null,
            'sold_to' => null,
            'sold_at' => null,
            'listed_at' => now(),
        ]);

        return response()->json(['message' => 'Lead re-listed as available.']);
    }

    public function adminAssignLead(Request $request, $id)
    {
        $this->checkAdmin();
        $request->validate(['user_id' => 'required|exists:users,id']);

        $user = User::findOrFail($request->user_id);
        $lead = Lead::findOrFail($id);

        DB::transaction(function () use ($lead, $user) {
            $purchase = MarketplaceLeadPurchase::create([
                'lead_id' => $lead->id,
                'user_id' => $user->id,
                'amount' => $lead->marketplace_price ?? 0,
                'status' => MarketplaceLeadPurchase::STATUS_PAID,
                'purchased_at' => now(),
                'notes' => 'Manually assigned by Admin',
            ]);

            $lead->forceFill([
                'marketplace_status' => self::STATUS_SOLD,
                'sold_to' => $user->id,
                'sold_at' => now(),
                'reserved_by' => null,
                'reservation_expires_at' => null,
            ])->save();

            PurchasedLead::firstOrCreate(
                ['lead_id' => $lead->id, 'user_id' => $user->id],
                ['amount' => $lead->marketplace_price ?? 0, 'purchased_at' => now()]
            );

            $this->notifyUser(
                $user,
                'Lead Assigned',
                'An admin assigned "' . ($lead->marketplace_title ?: $lead->lead_number) . '" to your account.',
                '/marketplace/purchased',
                'View my leads',
                ['lead_id' => $lead->id]
            );
        });

        return response()->json(['message' => 'Lead manually assigned to user successfully.']);
    }

    /**
     * Admin reconciliation for BANK TRANSFER purchases only — a Payoneer
     * checkout purchase can never be confirmed here, it must go through
     * handleWebhook()'s signature-verified event. Requires a real
     * reference and is audit-logged, matching InvoiceController's
     * recordManualPayment().
     */
    public function adminConfirmPayment(Request $request, $purchaseId)
    {
        $this->checkAdmin();
        $admin = $request->user();
        $validated = $request->validate(['reference' => 'required|string|max:255']);

        DB::transaction(function () use ($purchaseId, $admin, $validated) {
            $purchase = MarketplaceLeadPurchase::with('lead')->lockForUpdate()->findOrFail($purchaseId);

            if ($purchase->status !== MarketplaceLeadPurchase::STATUS_PENDING) {
                abort(409, 'This purchase is already ' . $purchase->status . '.');
            }

            if ($purchase->payment_gateway && $purchase->payment_gateway !== 'bank_transfer') {
                abort(422, 'This purchase used ' . $purchase->payment_gateway . ' checkout — it can only be confirmed by that gateway\'s webhook, not manually.');
            }

            \App\Models\AuditLog::log('marketplace.manual_payment_confirmed', 'MarketplaceLeadPurchase', $purchase->id, null, [
                'reference' => $validated['reference'],
                'confirmed_by' => $admin->id,
            ]);

            $lead = Lead::whereKey($purchase->lead_id)->lockForUpdate()->first();
            if (!$lead) {
                abort(404, 'Lead not found.');
            }

            $purchase->update([
                'status' => MarketplaceLeadPurchase::STATUS_PAID,
                'purchased_at' => now(),
                'notes' => 'Bank transfer confirmed by ' . $admin->name . ' (ref: ' . $validated['reference'] . ')',
            ]);

            $lead->forceFill([
                'marketplace_status' => self::STATUS_SOLD,
                'sold_to' => $purchase->user_id,
                'sold_at' => now(),
                'reserved_by' => null,
                'reservation_expires_at' => null,
            ])->save();

            PurchasedLead::firstOrCreate(
                ['lead_id' => $lead->id, 'user_id' => $purchase->user_id],
                ['amount' => $purchase->amount, 'purchased_at' => now()]
            );

            MarketplacePaymentLog::create([
                'purchase_id' => $purchase->id,
                'lead_id' => $lead->id,
                'user_id' => $purchase->user_id,
                'payment_gateway' => 'admin_confirm',
                'amount' => $purchase->amount,
                'status' => 'successful',
                'payload' => ['admin_id' => $admin->id],
            ]);

            $this->notifyUser(
                $purchase->user,
                'Lead unlocked',
                'Payment confirmed. Full details for "' . ($lead->marketplace_title ?: $lead->lead_number) . '" are now available.',
                '/marketplace/purchased',
                'View my leads',
                ['lead_id' => $lead->id]
            );
        });

        return response()->json(['message' => 'Payment confirmed. Lead sold and buyer notified.']);
    }

    public function adminCancelPurchase(Request $request, $purchaseId)
    {
        $this->checkAdmin();
        $purchase = MarketplaceLeadPurchase::findOrFail($purchaseId);

        if ($purchase->status !== MarketplaceLeadPurchase::STATUS_PENDING) {
            abort(409, 'Only pending purchases can be cancelled.');
        }

        DB::transaction(function () use ($purchase) {
            $purchase->update(['status' => MarketplaceLeadPurchase::STATUS_CANCELLED]);

            Lead::whereKey($purchase->lead_id)
                ->where('marketplace_status', self::STATUS_RESERVED)
                ->update([
                    'marketplace_status' => self::STATUS_AVAILABLE,
                    'reserved_by' => null,
                    'reservation_expires_at' => null,
                ]);

            MarketplacePaymentLog::create([
                'purchase_id' => $purchase->id,
                'lead_id' => $purchase->lead_id,
                'user_id' => $purchase->user_id,
                'payment_gateway' => 'admin_cancel',
                'amount' => $purchase->amount,
                'status' => 'failed',
                'error_message' => 'Cancelled by admin',
            ]);
        });

        return response()->json(['message' => 'Purchase cancelled. Lead is available again.']);
    }

    public function adminRefund(Request $request, $purchaseId)
    {
        $this->checkAdmin();
        $admin = $request->user();
        $request->validate(['notes' => 'nullable|string|max:2000']);

        $purchase = MarketplaceLeadPurchase::with('lead')->findOrFail($purchaseId);

        if ($purchase->status !== MarketplaceLeadPurchase::STATUS_PAID) {
            abort(409, 'Only paid purchases can be refunded.');
        }

        DB::transaction(function () use ($purchase, $admin, $request) {
            $purchase->update([
                'status' => MarketplaceLeadPurchase::STATUS_REFUNDED,
                'refunded_at' => now(),
                'notes' => trim(($purchase->notes ? $purchase->notes . "\n" : '') . 'Refunded by ' . $admin->name . ': ' . ($request->notes ?? 'no note')),
            ]);

            $lead = Lead::whereKey($purchase->lead_id)->lockForUpdate()->first();
            if ($lead) {
                $lead->forceFill([
                    'marketplace_status' => self::STATUS_AVAILABLE,
                    'sold_to' => null,
                    'sold_at' => null,
                    'reserved_by' => null,
                    'reservation_expires_at' => null,
                    'listed_at' => now(),
                ])->save();

                PurchasedLead::where('lead_id', $lead->id)->where('user_id', $purchase->user_id)->delete();
            }

            MarketplacePaymentLog::create([
                'purchase_id' => $purchase->id,
                'lead_id' => $purchase->lead_id,
                'user_id' => $purchase->user_id,
                'payment_gateway' => 'refund',
                'amount' => $purchase->amount,
                'status' => 'refunded',
                'payload' => ['refunded_by' => $admin->id],
            ]);

            $this->notifyUser(
                $purchase->user,
                'Purchase refunded',
                'Your purchase of "' . ($lead?->marketplace_title ?: 'a lead') . '" was refunded. The lead is back on the marketplace.',
                '/marketplace',
                'View marketplace',
                ['lead_id' => $lead?->id]
            );
        });

        return response()->json(['message' => 'Purchase refunded. Lead returned to the marketplace.']);
    }

    /**
     * Comprehensive Admin Analytics Dashboard metrics.
     */
    public function adminAnalytics(Request $request)
    {
        $this->checkAdmin();

        $totalLeads = Lead::listed()->count();
        $availableLeads = Lead::where('marketplace_status', self::STATUS_AVAILABLE)->count();
        $reservedLeads = Lead::where('marketplace_status', self::STATUS_RESERVED)->count();
        $soldLeads = Lead::where('marketplace_status', self::STATUS_SOLD)->count();

        $totalRevenue = (float) MarketplaceLeadPurchase::where('status', MarketplaceLeadPurchase::STATUS_PAID)->sum('amount');

        $conversionRate = $totalLeads > 0 ? round(($soldLeads / $totalLeads) * 100, 1) : 0;

        // Top categories
        $topCategories = Lead::listed()
            ->select('marketplace_category', DB::raw('count(*) as total_count'), DB::raw('sum(case when marketplace_status = "sold" then 1 else 0 end) as sold_count'))
            ->groupBy('marketplace_category')
            ->orderByDesc('total_count')
            ->limit(5)
            ->get();

        // Top buyers
        $topBuyers = MarketplaceLeadPurchase::where('status', MarketplaceLeadPurchase::STATUS_PAID)
            ->select('user_id', DB::raw('count(*) as purchases_count'), DB::raw('sum(amount) as total_spent'))
            ->groupBy('user_id')
            ->orderByDesc('total_spent')
            ->with('user:id,name,email')
            ->limit(5)
            ->get();

        // Monthly reports (last 6 months)
        $driver = DB::getDriverName();
        $dateFormatSql = $driver === 'sqlite' ? "strftime('%Y-%m', purchased_at)" : "DATE_FORMAT(purchased_at, '%Y-%m')";

        $monthlyRevenue = MarketplaceLeadPurchase::where('status', MarketplaceLeadPurchase::STATUS_PAID)
            ->select(DB::raw("{$dateFormatSql} as month"), DB::raw('sum(amount) as revenue'), DB::raw('count(*) as count'))
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(6)
            ->get();

        return response()->json([
            'kpis' => [
                'total_leads' => $totalLeads,
                'available_leads' => $availableLeads,
                'reserved_leads' => $reservedLeads,
                'sold_leads' => $soldLeads,
                'total_revenue' => $totalRevenue,
                'conversion_rate' => $conversionRate,
            ],
            'top_categories' => $topCategories,
            'top_buyers' => $topBuyers,
            'monthly_reports' => $monthlyRevenue,
        ]);
    }
}
