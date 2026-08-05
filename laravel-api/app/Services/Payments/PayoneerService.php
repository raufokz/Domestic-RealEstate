<?php

namespace App\Services\Payments;

use App\Exceptions\FeatureUnavailableException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Real Payoneer API client — OAuth2 client-credentials auth, checkout
 * sessions (accepting payment), payouts (paying agents/affiliates/brokers),
 * and webhook signature verification. No method here ever fakes success:
 * every call either returns real gateway data or throws.
 *
 * Payoneer's partner API requires an approved partnership before OAuth2
 * credentials are issued (unlike Stripe's self-serve keys) — see
 * config/payments.php and GEO_ACCESS_CONTROL-style doc note in
 * PAYMENTS.md. Until PAYONEER_CLIENT_ID/SECRET are set, every method
 * throws FeatureUnavailableException instead of a silent no-op.
 */
class PayoneerService
{
    private function config(): array
    {
        return config('payments.payoneer');
    }

    public function isConfigured(): bool
    {
        $c = $this->config();

        return !empty($c['client_id']) && !empty($c['client_secret']);
    }

    private function assertConfigured(): void
    {
        if (!$this->isConfigured()) {
            throw new FeatureUnavailableException(
                feature: 'Payoneer payments',
                reason: 'no Payoneer partner API credentials are configured yet',
                fix: 'An admin needs to complete Payoneer\'s partner approval process and set PAYONEER_CLIENT_ID/PAYONEER_CLIENT_SECRET.',
                codeKey: 'payoneer_not_configured',
            );
        }
    }

    /**
     * OAuth2 client-credentials token, cached until just before expiry.
     * // VERIFY: exact token endpoint + grant parameters against Payoneer's
     * live partner API reference once credentials are issued.
     */
    private function getAccessToken(): string
    {
        $this->assertConfigured();
        $c = $this->config();

        return Cache::remember('payoneer:access_token', now()->addMinutes(50), function () use ($c) {
            $tokenUrl = $c['token_url'] ?: rtrim($c['api_base'], '/') . '/oauth2/token';

            $response = Http::asForm()->post($tokenUrl, [
                'grant_type' => 'client_credentials',
                'client_id' => $c['client_id'],
                'client_secret' => $c['client_secret'],
                'scope' => 'read write',
            ]);

            if (!$response->successful()) {
                Log::error('Payoneer OAuth token request failed', ['status' => $response->status(), 'body' => $response->body()]);
                throw new FeatureUnavailableException(
                    feature: 'Payoneer payments',
                    reason: 'Payoneer rejected the API credentials (' . $response->status() . ')',
                    fix: 'Verify PAYONEER_CLIENT_ID/SECRET are correct and the partner account is active.',
                    codeKey: 'payoneer_auth_failed',
                );
            }

            return $response->json('access_token');
        });
    }

    private function client()
    {
        $c = $this->config();

        return Http::withToken($this->getAccessToken())
            ->baseUrl(rtrim($c['api_base'], '/'))
            ->timeout(20);
    }

    /**
     * Real checkout session for a buyer-facing charge (invoices, pay-per-lead).
     * // VERIFY: exact endpoint path/payload against Payoneer Checkout API
     * partner docs — this follows their documented "create order" shape.
     *
     * @return array{checkout_id:string, checkout_url:string, status:string}
     */
    public function createCheckoutSession(array $params): array
    {
        $this->assertConfigured();
        $c = $this->config();

        $response = $this->client()->post('/checkout/orders', [
            'program_id' => $c['program_id'],
            'amount' => $params['amount'],
            'currency' => $params['currency'] ?? 'USD',
            'description' => $params['description'] ?? null,
            'reference_id' => $params['reference_id'], // our purchase/invoice id, echoed back on webhook
            'customer_email' => $params['customer_email'] ?? null,
            'success_url' => $params['success_url'] ?? null,
            'cancel_url' => $params['cancel_url'] ?? null,
        ]);

        if (!$response->successful()) {
            Log::error('Payoneer checkout session creation failed', ['status' => $response->status(), 'body' => $response->body()]);
            throw new FeatureUnavailableException(
                feature: 'Checkout',
                reason: 'Payoneer declined to create a checkout session (' . $response->status() . ')',
                fix: 'Check the Payoneer integration status in Admin > Integrations.',
                codeKey: 'payoneer_checkout_failed',
            );
        }

        $data = $response->json();

        return [
            'checkout_id' => $data['id'] ?? $data['order_id'] ?? null,
            'checkout_url' => $data['checkout_url'] ?? $data['redirect_url'] ?? null,
            'status' => $data['status'] ?? 'pending',
        ];
    }

    public function getCheckoutStatus(string $checkoutId): array
    {
        $this->assertConfigured();

        $response = $this->client()->get("/checkout/orders/{$checkoutId}");

        if (!$response->successful()) {
            throw new FeatureUnavailableException(
                feature: 'Checkout status lookup',
                reason: 'Payoneer returned an error (' . $response->status() . ') looking up this order',
                codeKey: 'payoneer_status_lookup_failed',
            );
        }

        return $response->json();
    }

    /**
     * Real payout to a recipient (agent commission, affiliate payout).
     * // VERIFY: exact endpoint/payload against Payoneer Mass Payout API
     * partner docs — recipient must already be an onboarded/approved
     * Payoneer payee (see Payoneer's payee-registration flow) before this
     * will succeed; that onboarding step is outside this service's scope.
     *
     * @return array{payout_id:string, status:string}
     */
    public function createPayout(array $params): array
    {
        $this->assertConfigured();
        $c = $this->config();

        $response = $this->client()->post('/payouts', [
            'program_id' => $c['program_id'],
            'payee_id' => $params['payee_id'],
            'amount' => $params['amount'],
            'currency' => $params['currency'] ?? 'USD',
            'description' => $params['description'] ?? null,
            'client_reference_id' => $params['reference_id'],
        ]);

        if (!$response->successful()) {
            Log::error('Payoneer payout creation failed', ['status' => $response->status(), 'body' => $response->body()]);
            throw new FeatureUnavailableException(
                feature: 'Payouts',
                reason: 'Payoneer declined to create this payout (' . $response->status() . ')',
                fix: 'Confirm the recipient is an onboarded Payoneer payee and the program has sufficient balance.',
                codeKey: 'payoneer_payout_failed',
            );
        }

        $data = $response->json();

        return [
            'payout_id' => $data['id'] ?? $data['payout_id'] ?? null,
            'status' => $data['status'] ?? 'processing',
        ];
    }

    public function getPayoutStatus(string $payoutId): array
    {
        $this->assertConfigured();

        $response = $this->client()->get("/payouts/{$payoutId}");

        if (!$response->successful()) {
            throw new FeatureUnavailableException(
                feature: 'Payout status lookup',
                reason: 'Payoneer returned an error (' . $response->status() . ') looking up this payout',
                codeKey: 'payoneer_status_lookup_failed',
            );
        }

        return $response->json();
    }

    /**
     * HMAC-SHA256 signature check for inbound webhooks. // VERIFY: header
     * name and exact signing scheme (raw body vs. canonicalized payload)
     * against Payoneer's live webhook documentation before go-live — this
     * implements the standard HMAC-over-raw-body pattern used by most
     * payment webhooks (Stripe, PayPal) as the safest default until
     * confirmed. A request that fails this check must NEVER be processed.
     */
    public function verifyWebhookSignature(string $rawBody, ?string $signatureHeader): bool
    {
        $secret = $this->config()['webhook_secret'];

        if (!$secret || !$signatureHeader) {
            return false;
        }

        $expected = hash_hmac('sha256', $rawBody, $secret);

        return hash_equals($expected, $signatureHeader);
    }
}
