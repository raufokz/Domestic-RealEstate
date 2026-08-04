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

    public function test_user_can_reserve_and_process_instant_payment(): void
    {
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

        // 2. Process Payment
        $payRes = $this->actingAs($user)->postJson("/api/marketplace/leads/{$lead->id}/process-payment", [
            'token' => $token,
            'payment_method' => 'card',
        ]);

        $payRes->assertStatus(200)->assertJson(['status' => 'paid']);

        // 3. Verify lead status in DB is sold
        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'marketplace_status' => 'sold',
            'sold_to' => $user->id,
        ]);

        // 4. Verify contact details unlocked on details endpoint
        $detailsRes = $this->actingAs($user)->getJson("/api/marketplace/leads/{$lead->id}/details");
        $detailsRes->assertStatus(200)
            ->assertJson(['email' => 'jane@example.com', 'phone' => '555-9999']);
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
