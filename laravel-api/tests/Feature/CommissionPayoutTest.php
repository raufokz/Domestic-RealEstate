<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\MarketplaceLeadPurchase;
use App\Models\Payout;
use App\Models\PurchasedLead;
use App\Models\User;
use App\Services\Payments\PayoneerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommissionPayoutTest extends TestCase
{
    use RefreshDatabase;

    private function claimedPurchase(User $agent, array $overrides = []): PurchasedLead
    {
        $lead = Lead::create([
            'first_name' => 'Closing', 'last_name' => 'Lead', 'email' => 'closing@example.com',
            'marketplace_status' => 'sold', 'marketplace_price' => 0, 'listed_at' => now(),
        ]);

        return PurchasedLead::create(array_merge([
            'lead_id' => $lead->id,
            'user_id' => $agent->id,
            'amount' => 0,
            'purchased_at' => now(),
            'commission_amount' => 500,
            'payout_method' => 'payoneer',
            'payout_email' => 'agent-payoneer@example.com',
            'payout_status' => 'pending',
            'claimed_at' => now(),
        ], $overrides));
    }

    public function test_agent_can_set_their_own_payout_email(): void
    {
        $agent = User::factory()->create(['role' => 'agent', 'status' => 'active']);
        $purchase = $this->claimedPurchase($agent, ['payout_email' => null]);

        $response = $this->actingAs($agent)->putJson("/api/agent/leads/{$purchase->id}/payout-email", [
            'payout_email' => 'me@payoneer.example.com',
        ]);

        $response->assertStatus(200);
        $this->assertSame('me@payoneer.example.com', $purchase->fresh()->payout_email);
    }

    public function test_admin_approve_creates_real_payout_via_payoneer(): void
    {
        $this->partialMock(PayoneerService::class, function ($mock) {
            $mock->shouldReceive('createPayout')->once()->andReturn(['payout_id' => 'po_123', 'status' => 'processing']);
        });

        $admin = User::factory()->create(['role' => 'admin']);
        $agent = User::factory()->create(['role' => 'agent']);
        $purchase = $this->claimedPurchase($agent);

        $response = $this->actingAs($admin)->postJson("/api/admin/marketplace/payouts/{$purchase->id}/status", [
            'payout_status' => 'paid',
        ]);

        $response->assertStatus(200);
        $this->assertSame('processing', $purchase->fresh()->payout_status);
        $this->assertDatabaseHas('payouts', [
            'purchased_lead_id' => $purchase->id,
            'recipient_id' => $agent->id,
            'gateway_payout_id' => 'po_123',
            'status' => Payout::STATUS_PROCESSING,
        ]);
    }

    public function test_admin_cannot_approve_payout_without_payout_email(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $agent = User::factory()->create(['role' => 'agent']);
        $purchase = $this->claimedPurchase($agent, ['payout_email' => null]);

        $response = $this->actingAs($admin)->postJson("/api/admin/marketplace/payouts/{$purchase->id}/status", [
            'payout_status' => 'paid',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('payouts', ['purchased_lead_id' => $purchase->id]);
    }

    public function test_payout_webhook_requires_valid_signature_and_confirms_payment(): void
    {
        config(['payments.payoneer.webhook_secret' => 'payout-secret']);
        $agent = User::factory()->create(['role' => 'agent']);
        $purchase = $this->claimedPurchase($agent, ['payout_status' => 'processing']);
        $payout = Payout::create([
            'recipient_id' => $agent->id,
            'purchased_lead_id' => $purchase->id,
            'amount' => 500,
            'gateway' => 'payoneer',
            'gateway_payout_id' => 'po_123',
            'status' => Payout::STATUS_PROCESSING,
        ]);

        $body = json_encode(['event' => 'payout.paid', 'reference_id' => (string) $payout->id, 'payout_id' => 'po_123']);

        $this->call('POST', '/api/marketplace/payouts/webhook', [], [], [], [
            'HTTP_X-Payoneer-Signature' => 'wrong',
            'CONTENT_TYPE' => 'application/json',
        ], $body)->assertStatus(401);
        $this->assertSame(Payout::STATUS_PROCESSING, $payout->fresh()->status);

        $signature = hash_hmac('sha256', $body, 'payout-secret');
        $this->call('POST', '/api/marketplace/payouts/webhook', [], [], [], [
            'HTTP_X-Payoneer-Signature' => $signature,
            'CONTENT_TYPE' => 'application/json',
        ], $body)->assertStatus(200);

        $this->assertSame(Payout::STATUS_PAID, $payout->fresh()->status);
        $this->assertSame('paid', $purchase->fresh()->payout_status);
    }

    public function test_manual_bank_transfer_confirmation_requires_reference_and_is_audited(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $lead = Lead::create([
            'first_name' => 'Bank', 'last_name' => 'Transfer', 'email' => 'bank@example.com',
            'marketplace_status' => 'reserved', 'marketplace_price' => 200, 'listed_at' => now(),
        ]);
        $purchase = MarketplaceLeadPurchase::create([
            'lead_id' => $lead->id, 'user_id' => $user->id, 'amount' => 200,
            'status' => MarketplaceLeadPurchase::STATUS_PENDING, 'payment_gateway' => 'bank_transfer',
        ]);

        $this->actingAs($admin)->postJson("/api/admin/marketplace/purchases/{$purchase->id}/confirm", [])
            ->assertStatus(422);

        $response = $this->actingAs($admin)->postJson("/api/admin/marketplace/purchases/{$purchase->id}/confirm", [
            'reference' => 'WIRE-9988',
        ]);

        $response->assertStatus(200);
        $this->assertSame(MarketplaceLeadPurchase::STATUS_PAID, $purchase->fresh()->status);
        $this->assertDatabaseHas('audit_logs', ['action' => 'marketplace.manual_payment_confirmed', 'entity_id' => $purchase->id]);
    }

    public function test_manual_confirmation_rejected_for_payoneer_gateway_purchase(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $lead = Lead::create([
            'first_name' => 'Card', 'last_name' => 'Buyer', 'email' => 'card@example.com',
            'marketplace_status' => 'reserved', 'marketplace_price' => 200, 'listed_at' => now(),
        ]);
        $purchase = MarketplaceLeadPurchase::create([
            'lead_id' => $lead->id, 'user_id' => $user->id, 'amount' => 200,
            'status' => MarketplaceLeadPurchase::STATUS_PENDING, 'payment_gateway' => 'payoneer',
            'gateway_checkout_id' => 'chk_1',
        ]);

        $response = $this->actingAs($admin)->postJson("/api/admin/marketplace/purchases/{$purchase->id}/confirm", [
            'reference' => 'trying-to-cheat',
        ]);

        $response->assertStatus(422);
        $this->assertSame(MarketplaceLeadPurchase::STATUS_PENDING, $purchase->fresh()->status);
    }
}
