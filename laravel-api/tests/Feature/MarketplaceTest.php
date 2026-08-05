<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\MarketplaceController;
use App\Models\Lead;
use App\Models\MarketplaceLeadPurchase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarketplaceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_user_can_list_marketplace_leads_with_sanitized_data(): void
    {
        $user = User::factory()->create(['ppl_eligible' => true, 'ppl_access_enabled' => true]);
        
        Lead::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'secret@example.com',
            'phone' => '555-0199',
            'marketplace_status' => 'available',
            'marketplace_title' => 'Tampa Bay Deal',
            'marketplace_category' => 'Residential',
            'marketplace_price' => 150.00,
            'listed_at' => now(),
            'state' => 'FL',
            'city' => 'Tampa',
        ]);

        $response = $this->actingAs($user)->getJson('/api/marketplace');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'lead_number', 'title', 'price', 'status', 'state', 'city']
                ]
            ]);

        // Verify sensitive details are not leaked in public list payload
        $content = $response->getContent();
        $this->assertStringNotContainsString('secret@example.com', $content);
        $this->assertStringNotContainsString('555-0199', $content);
    }

    public function test_filtering_and_sorting_marketplace_leads(): void
    {
        $user = User::factory()->create(['ppl_eligible' => true, 'ppl_access_enabled' => true]);

        Lead::create([
            'first_name' => 'Alice',
            'email' => 'alice@example.com',
            'marketplace_status' => 'available',
            'marketplace_title' => 'Miami Luxury Condo',
            'marketplace_category' => 'Luxury',
            'marketplace_price' => 500.00,
            'listed_at' => now()->subDay(),
            'state' => 'FL',
            'city' => 'Miami',
        ]);

        Lead::create([
            'first_name' => 'Bob',
            'email' => 'bob@example.com',
            'marketplace_status' => 'available',
            'marketplace_title' => 'Austin Starter Home',
            'marketplace_category' => 'Residential',
            'marketplace_price' => 75.00,
            'listed_at' => now(),
            'state' => 'TX',
            'city' => 'Austin',
        ]);

        // Search by state FL
        $res1 = $this->actingAs($user)->getJson('/api/marketplace?state=FL');
        $res1->assertStatus(200)->assertJsonCount(1, 'data');
        $this->assertEquals('Miami Luxury Condo', $res1->json('data.0.title'));

        // Sort by price low to high
        $res2 = $this->actingAs($user)->getJson('/api/marketplace?sort=price_asc');
        $res2->assertStatus(200);
        $this->assertEquals('Austin Starter Home', $res2->json('data.0.title'));
    }

    public function test_user_can_reserve_and_checkout_creates_real_payoneer_session(): void
    {
        // Partial mock: only stub the outbound checkout-session call; leave
        // verifyWebhookSignature() as the real implementation so step 4
        // below genuinely exercises signature verification.
        $this->partialMock(\App\Services\Payments\PayoneerService::class, function ($mock) {
            $mock->shouldReceive('createCheckoutSession')->once()->andReturn([
                'checkout_id' => 'chk_test_123',
                'checkout_url' => 'https://sandbox.payoneer.com/checkout/chk_test_123',
                'status' => 'pending',
            ]);
        });

        $user = User::factory()->create(['ppl_eligible' => true, 'ppl_access_enabled' => true]);

        $lead = Lead::create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@example.com',
            'phone' => '555-9999',
            'marketplace_status' => 'available',
            'marketplace_title' => 'High Intent Seller',
            'marketplace_price' => 200.00,
            'listed_at' => now(),
        ]);

        // 1. Reserve
        $res = $this->actingAs($user)->postJson("/api/marketplace/leads/{$lead->id}/reserve");
        $res->assertStatus(200)->assertJsonStructure(['token', 'expires_at']);
        $token = $res->json('token');

        // 2. Start checkout — this must NEVER mark the lead sold directly.
        $payRes = $this->actingAs($user)->postJson("/api/marketplace/leads/{$lead->id}/process-payment", [
            'token' => $token,
            'payment_method' => 'payoneer',
        ]);

        $payRes->assertStatus(200)
            ->assertJson(['status' => 'checkout_created', 'checkout_url' => 'https://sandbox.payoneer.com/checkout/chk_test_123']);

        $this->assertDatabaseHas('leads', ['id' => $lead->id, 'marketplace_status' => 'reserved']);
        $this->assertDatabaseHas('marketplace_lead_purchases', [
            'lead_id' => $lead->id,
            'status' => 'pending',
            'gateway_checkout_id' => 'chk_test_123',
        ]);

        // 3. Contact details are still locked before payment is confirmed.
        $detailsRes = $this->actingAs($user)->getJson("/api/marketplace/leads/{$lead->id}/details");
        $detailsRes->assertStatus(403);

        // 4. Simulate Payoneer's signature-verified webhook confirming payment.
        config(['payments.payoneer.webhook_secret' => 'test-webhook-secret']);
        $purchase = \App\Models\MarketplaceLeadPurchase::where('lead_id', $lead->id)->first();
        $body = json_encode(['event' => 'payment.succeeded', 'reference_id' => (string) $purchase->id, 'transaction_id' => 'txn_live_456']);
        $signature = hash_hmac('sha256', $body, 'test-webhook-secret');

        $webhookRes = $this->call('POST', '/api/marketplace/webhook', [], [], [], [
            'HTTP_X-Payoneer-Signature' => $signature,
            'CONTENT_TYPE' => 'application/json',
        ], $body);

        $webhookRes->assertStatus(200);

        // 5. NOW the lead is sold and details unlock.
        $this->assertDatabaseHas('leads', ['id' => $lead->id, 'marketplace_status' => 'sold', 'sold_to' => $user->id]);
        $this->actingAs($user)->getJson("/api/marketplace/leads/{$lead->id}/details")
            ->assertStatus(200)
            ->assertJson(['email' => 'jane@example.com', 'phone' => '555-9999']);
    }

    public function test_webhook_with_invalid_signature_is_rejected_and_does_not_unlock_lead(): void
    {
        config(['payments.payoneer.webhook_secret' => 'test-webhook-secret']);

        $user = User::factory()->create(['ppl_eligible' => true, 'ppl_access_enabled' => true]);
        $lead = Lead::create([
            'first_name' => 'Jane', 'last_name' => 'Smith', 'email' => 'jane2@example.com',
            'marketplace_status' => 'sold', 'marketplace_price' => 200.00, 'listed_at' => now(),
        ]);
        $purchase = \App\Models\MarketplaceLeadPurchase::create([
            'lead_id' => $lead->id, 'user_id' => $user->id, 'amount' => 200,
            'status' => \App\Models\MarketplaceLeadPurchase::STATUS_PENDING,
        ]);

        $body = json_encode(['event' => 'payment.succeeded', 'reference_id' => (string) $purchase->id]);

        $response = $this->call('POST', '/api/marketplace/webhook', [], [], [], [
            'HTTP_X-Payoneer-Signature' => 'not-the-real-signature',
            'CONTENT_TYPE' => 'application/json',
        ], $body);

        $response->assertStatus(401);
        $this->assertSame(\App\Models\MarketplaceLeadPurchase::STATUS_PENDING, $purchase->fresh()->status);
    }

    public function test_user_cannot_reserve_already_reserved_lead(): void
    {
        $user1 = User::factory()->create(['ppl_eligible' => true, 'ppl_access_enabled' => true]);
        $user2 = User::factory()->create(['ppl_eligible' => true, 'ppl_access_enabled' => true]);

        $lead = Lead::create([
            'first_name' => 'Test',
            'email' => 'test@example.com',
            'marketplace_status' => 'available',
            'marketplace_price' => 100.00,
            'listed_at' => now(),
        ]);

        // User 1 reserves
        $this->actingAs($user1)->postJson("/api/marketplace/leads/{$lead->id}/reserve")->assertStatus(200);

        // User 2 attempts to reserve same lead -> expect 409
        $this->actingAs($user2)->postJson("/api/marketplace/leads/{$lead->id}/reserve")->assertStatus(409);
    }

    public function test_expired_reservation_is_released(): void
    {
        $user = User::factory()->create(['ppl_eligible' => true, 'ppl_access_enabled' => true]);

        $lead = Lead::create([
            'first_name' => 'Expired',
            'email' => 'expired@example.com',
            'marketplace_status' => 'reserved',
            'reserved_by' => $user->id,
            'reservation_expires_at' => now()->subMinute(),
            'marketplace_price' => 100.00,
            'listed_at' => now(),
        ]);

        MarketplaceController::releaseExpiredReservations();

        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'marketplace_status' => 'available',
            'reserved_by' => null,
        ]);
    }

    public function test_admin_analytics_endpoint(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $res = $this->actingAs($admin)->getJson('/api/admin/marketplace/analytics');
        $res->assertStatus(200)->assertJsonStructure([
            'kpis' => ['total_leads', 'available_leads', 'reserved_leads', 'sold_leads', 'total_revenue', 'conversion_rate'],
            'top_categories',
            'top_buyers',
            'monthly_reports',
        ]);
    }
}
