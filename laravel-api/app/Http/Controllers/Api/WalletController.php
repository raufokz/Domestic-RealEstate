<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CreditOrder;
use App\Models\CreditTransaction;
use App\Models\LeadPackage;
use App\Services\Payments\PayoneerService;
use App\Services\WalletService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Prepaid credit wallet — top-up + ledger. Mirrors MarketplaceController's
 * proven reserve/purchase/webhook pattern: nothing is ever marked
 * confirmed except by a signature-verified webhook or an explicit admin
 * confirm action on the manual bank-transfer path.
 */
class WalletController extends Controller
{
    /** How long a manual bank-transfer top-up is held pending admin confirmation. */
    public const HOLD_HOURS = 48;

    public function __construct(private PayoneerService $payments)
    {
    }

    private function checkAdmin(): void
    {
        $user = Auth::user();
        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    public function balance(Request $request): JsonResponse
    {
        return ApiResponse::ok(['balance_credits' => WalletService::balance($request->user())]);
    }

    public function ledger(Request $request): JsonResponse
    {
        $transactions = CreditTransaction::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(min((int) $request->get('per_page', 20), 100));

        return ApiResponse::ok($transactions);
    }

    public function pendingTopups(Request $request): JsonResponse
    {
        $orders = CreditOrder::where('user_id', $request->user()->id)
            ->where('status', CreditOrder::STATUS_PENDING)
            ->orderByDesc('created_at')
            ->get();

        return ApiResponse::ok($orders);
    }

    public function topup(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'lead_package_id' => 'required|exists:lead_packages,id',
            'payment_method' => 'nullable|string|in:payoneer,bank_transfer',
        ]);

        $pack = LeadPackage::where('id', $validated['lead_package_id'])->where('is_active', true)->firstOrFail();
        $paymentMethod = $validated['payment_method'] ?? 'payoneer';

        $order = CreditOrder::create([
            'user_id' => $user->id,
            'lead_package_id' => $pack->id,
            'credits' => $pack->lead_count,
            'amount_paid' => $pack->price,
            'status' => CreditOrder::STATUS_PENDING,
        ]);

        if ($paymentMethod === 'payoneer') {
            try {
                $session = $this->payments->createCheckoutSession([
                    'amount' => $pack->price,
                    'currency' => 'USD',
                    'description' => 'Credit top-up: ' . $pack->name . ' (' . $pack->lead_count . ' credits)',
                    'reference_id' => 'credit_order_' . $order->id,
                    'customer_email' => $user->email,
                    'success_url' => rtrim(config('app.frontend_url'), '/') . '/agent/dashboard/wallet?topup=' . $order->id,
                    'cancel_url' => rtrim(config('app.frontend_url'), '/') . '/agent/dashboard/wallet?cancelled=' . $order->id,
                ]);
            } catch (\Throwable $e) {
                Log::error('Credit top-up checkout session creation failed', ['order_id' => $order->id, 'error' => $e->getMessage()]);
                return ApiResponse::fail(
                    'Could not start checkout right now.',
                    'checkout_failed',
                    502,
                    reason: $e->getMessage(),
                );
            }

            $order->update([
                'payment_gateway' => 'payoneer',
                'gateway_checkout_id' => $session['checkout_id'],
                'gateway_checkout_url' => $session['checkout_url'],
            ]);

            return ApiResponse::ok([
                'status' => 'checkout_created',
                'checkout_url' => $session['checkout_url'],
                'order_id' => $order->id,
            ], 'Redirecting to secure Payoneer checkout to complete payment.');
        }

        // Manual bank transfer — held for admin confirmation, same pattern
        // as MarketplaceController::purchase()'s bank_transfer branch.
        $order->update(['payment_gateway' => 'bank_transfer']);

        return ApiResponse::ok([
            'status' => 'awaiting_confirmation',
            'order_id' => $order->id,
            'hold_hours' => self::HOLD_HOURS,
        ], 'Payment submitted for processing. Your credits will be added once payment is confirmed — usually within ' . self::HOLD_HOURS . ' hours.');
    }

    /**
     * Payoneer webhook for credit top-ups. Reference id is prefixed
     * "credit_order_" so this stays distinct from marketplace lead
     * purchases, which use a bare purchase id.
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        $signature = $request->header('X-Payoneer-Signature');
        if (!$this->payments->verifyWebhookSignature($request->getContent(), $signature)) {
            Log::warning('Rejected wallet webhook with invalid/missing signature', ['ip' => $request->ip()]);
            return ApiResponse::fail('Invalid signature.', 'invalid_signature', 401, reason: 'the webhook signature did not match');
        }

        $event = $request->input('event', 'payment.succeeded');
        $refId = (string) ($request->input('reference_id') ?: $request->input('data.reference_id'));

        if (!str_starts_with($refId, 'credit_order_')) {
            return response()->json(['message' => 'Webhook received (not a credit order reference).'], 200);
        }

        $orderId = (int) substr($refId, strlen('credit_order_'));
        $order = CreditOrder::find($orderId);

        if (!$order) {
            return ApiResponse::fail('Credit order not found.', 'not_found', 404);
        }

        if ($event === 'payment.succeeded' && $order->status !== CreditOrder::STATUS_CONFIRMED) {
            DB::transaction(function () use ($order) {
                $order->update(['status' => CreditOrder::STATUS_CONFIRMED, 'confirmed_at' => now()]);
                WalletService::credit($order->user, $order->credits, 'topup_payoneer', $order);
            });
        }

        return response()->json(['message' => 'Webhook processed.'], 200);
    }

    // ── Admin ──

    public function adminPendingTopups(Request $request): JsonResponse
    {
        $this->checkAdmin();

        $orders = CreditOrder::with('user:id,name,email')
            ->where('status', CreditOrder::STATUS_PENDING)
            ->where('payment_gateway', 'bank_transfer')
            ->orderBy('created_at')
            ->paginate(min((int) $request->get('per_page', 20), 100));

        return ApiResponse::ok($orders);
    }

    public function adminConfirmTopup(Request $request, int $id): JsonResponse
    {
        $this->checkAdmin();
        $order = CreditOrder::findOrFail($id);

        if ($order->status !== CreditOrder::STATUS_PENDING) {
            return ApiResponse::fail('This order is not pending.', 'invalid_state', 422);
        }

        DB::transaction(function () use ($order) {
            $order->update([
                'status' => CreditOrder::STATUS_CONFIRMED,
                'confirmed_at' => now(),
                'confirmed_by' => Auth::id(),
            ]);
            WalletService::credit($order->user, $order->credits, 'topup_bank_transfer_admin_confirmed', $order);
        });

        return ApiResponse::ok($order->fresh(), 'Top-up confirmed — credits added.');
    }

    public function adminRejectTopup(Request $request, int $id): JsonResponse
    {
        $this->checkAdmin();
        $order = CreditOrder::findOrFail($id);

        if ($order->status !== CreditOrder::STATUS_PENDING) {
            return ApiResponse::fail('This order is not pending.', 'invalid_state', 422);
        }

        $validated = $request->validate(['notes' => 'nullable|string|max:1000']);

        $order->update([
            'status' => CreditOrder::STATUS_REJECTED,
            'notes' => $validated['notes'] ?? null,
        ]);

        return ApiResponse::ok($order->fresh(), 'Top-up rejected — no credits added.');
    }
}
