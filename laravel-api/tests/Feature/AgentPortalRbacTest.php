<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgentPortalRbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    private function agent(array $extra = []): User
    {
        return User::factory()->create(array_merge([
            'role' => 'agent',
            'status' => 'active',
            'ppl_eligible' => true,
            'ppl_access_enabled' => true,
        ], $extra));
    }

    private function leadFor(int $assignedTo, array $extra = []): Lead
    {
        return Lead::create(array_merge([
            'first_name' => 'Lead',
            'last_name' => 'Person',
            'email' => 'lead-' . uniqid() . '@example.com',
            'type' => 'buyer',
            'status' => 'new',
            'assigned_to' => $assignedTo,
        ], $extra));
    }

    public function test_non_agent_role_is_blocked_from_agent_portal(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer', 'status' => 'active']);

        $this->actingAs($buyer)->getJson('/api/agent/dashboard')->assertStatus(403);
        $this->actingAs($buyer)->getJson('/api/agent/properties')->assertStatus(403);
        $this->actingAs($buyer)->getJson('/api/agent/appointments')->assertStatus(403);
        $this->actingAs($buyer)->getJson('/api/agent/pay-at-closing')->assertStatus(403);
    }

    public function test_agent_sees_only_their_own_leads_via_crm_endpoint(): void
    {
        $agentA = $this->agent();
        $agentB = $this->agent();

        $mine = $this->leadFor($agentA->id);
        $theirs = $this->leadFor($agentB->id);

        $response = $this->actingAs($agentA)->getJson('/api/leads?per_page=50');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertContains($mine->id, $ids);
        $this->assertNotContains($theirs->id, $ids);
    }

    public function test_agent_cannot_open_another_agents_lead(): void
    {
        $agentA = $this->agent();
        $agentB = $this->agent();
        $theirs = $this->leadFor($agentB->id);

        $this->actingAs($agentA)->getJson("/api/leads/{$theirs->id}")->assertStatus(403);
        $this->actingAs($agentA)->postJson("/api/leads/{$theirs->id}/notes", ['note' => 'sneak'])
            ->assertStatus(403);
        $this->actingAs($agentA)->putJson("/api/leads/{$theirs->id}/status", ['status' => 'converted'])
            ->assertStatus(403);
    }

    public function test_agent_cannot_reassign_or_import_leads(): void
    {
        $agentA = $this->agent();
        $agentB = $this->agent();
        $mine = $this->leadFor($agentA->id);

        $this->actingAs($agentA)->postJson("/api/leads/{$mine->id}/assign", ['agent_id' => $agentB->id])
            ->assertStatus(403);
        $this->actingAs($agentA)->postJson('/api/leads/reassign', [
            'lead_ids' => [$mine->id],
            'agent_id' => $agentB->id,
        ])->assertStatus(403);
        $this->actingAs($agentA)->postJson('/api/leads/import', [])->assertStatus(403);
    }

    public function test_agent_cannot_access_admin_endpoints(): void
    {
        $agent = $this->agent();

        $this->actingAs($agent)->getJson('/api/admin/dashboard')->assertStatus(403);
        $this->actingAs($agent)->getJson('/api/admin/users')->assertStatus(403);
        $this->actingAs($agent)->getJson('/api/admin/marketplace')->assertStatus(403);
    }

    public function test_agent_dashboard_returns_scoped_stats(): void
    {
        $agent = $this->agent();
        $this->leadFor($agent->id, ['status' => 'converted']);
        $this->leadFor($agent->id);
        Property::create([
            'title' => 'My Listing',
            'description' => 'desc',
            'price' => 250000,
            'address' => '1 Main St',
            'city' => 'Austin',
            'state' => 'TX',
            'zip' => '78701',
            'status' => 'active',
            'approval_status' => 'approved',
            'realtor_id' => $agent->id,
        ]);

        $response = $this->actingAs($agent)->getJson('/api/agent/dashboard');

        $response->assertStatus(200)->assertJsonStructure([
            'active_listings',
            'pending_listings',
            'sold_properties',
            'total_assigned_leads',
            'purchased_marketplace_leads',
            'pay_at_closing_leads',
            'new_messages',
            'open_tasks',
            'upcoming_appointments',
            'recent_activity',
            'earnings',
            'pipeline',
        ]);

        $this->assertEquals(1, $response->json('active_listings'));
        $this->assertEquals(2, $response->json('total_assigned_leads'));
    }

    public function test_agent_property_endpoints_only_touch_own_listings(): void
    {
        $agentA = $this->agent();
        $agentB = $this->agent();

        $mine = Property::create([
            'title' => 'Agent A Home',
            'description' => 'desc',
            'price' => 100000,
            'address' => '1 A St',
            'city' => 'Austin',
            'state' => 'TX',
            'zip' => '78701',
            'status' => 'active',
            'approval_status' => 'approved',
            'realtor_id' => $agentA->id,
        ]);
        $theirs = Property::create([
            'title' => 'Agent B Home',
            'description' => 'desc',
            'price' => 200000,
            'address' => '2 B St',
            'city' => 'Dallas',
            'state' => 'TX',
            'zip' => '75001',
            'status' => 'active',
            'approval_status' => 'approved',
            'realtor_id' => $agentB->id,
        ]);

        $list = $this->actingAs($agentA)->getJson('/api/agent/properties');
        $ids = collect($list->json('data'))->pluck('id')->all();
        $this->assertContains($mine->id, $ids);
        $this->assertNotContains($theirs->id, $ids);

        $this->actingAs($agentA)->postJson("/api/agent/properties/{$theirs->id}/duplicate")->assertStatus(404);
        $this->actingAs($agentA)->postJson("/api/agent/properties/{$theirs->id}/submit")->assertStatus(404);

        // Duplicating own listing works.
        $dup = $this->actingAs($agentA)->postJson("/api/agent/properties/{$mine->id}/duplicate");
        $dup->assertStatus(201);
        $this->assertEquals('draft', $dup->json('data.approval_status'));
    }

    public function test_pay_at_closing_claim_flow(): void
    {
        $agent = $this->agent();

        $lead = Lead::create([
            'first_name' => 'Closer',
            'email' => 'closer@example.com',
            'type' => 'seller',
            'marketplace_status' => 'available',
            'marketplace_title' => 'Pay-at-Closing Deal',
            'pricing_model' => 'pay_at_closing',
            'commission_rate' => 2.50,
            'payout_method' => 'payoneer',
            'payout_email' => 'seller-payout@example.com',
            'marketplace_price' => 0,
            'listed_at' => now(),
        ]);

        $res = $this->actingAs($agent)->postJson("/api/marketplace/leads/{$lead->id}/claim");
        $res->assertStatus(200)->assertJson(['status' => 'claimed']);

        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'marketplace_status' => 'sold',
            'sold_to' => $agent->id,
        ]);
        $this->assertDatabaseHas('purchased_leads', [
            'lead_id' => $lead->id,
            'user_id' => $agent->id,
            'payout_status' => 'pending',
            'payout_method' => 'payoneer',
        ]);

        // Claiming a pay-per-lead must fail.
        $ppl = Lead::create([
            'first_name' => 'PPL',
            'email' => 'ppl@example.com',
            'marketplace_status' => 'available',
            'marketplace_title' => 'PPL Deal',
            'pricing_model' => 'pay_per_lead',
            'marketplace_price' => 50,
            'listed_at' => now(),
        ]);
        $this->actingAs($agent)->postJson("/api/marketplace/leads/{$ppl->id}/claim")->assertStatus(422);

        // My pay-at-closing list is scoped to me.
        $mine = $this->actingAs($agent)->getJson('/api/agent/pay-at-closing');
        $mine->assertStatus(200);
        $this->assertEquals(1, collect($mine->json('data'))->count());
    }

    public function test_appointment_crud_is_scoped_to_owner(): void
    {
        $agentA = $this->agent();
        $agentB = $this->agent();

        $res = $this->actingAs($agentA)->postJson('/api/agent/appointments', [
            'title' => 'Property Showing',
            'type' => 'showing',
            'starts_at' => now()->addDay()->toDateTimeString(),
            'status' => 'scheduled',
        ]);
        $res->assertStatus(201);
        $apptId = $res->json('data.id');

        // Agent B cannot see or modify Agent A's appointment.
        $listB = $this->actingAs($agentB)->getJson('/api/agent/appointments');
        $this->assertEquals(0, collect($listB->json('data'))->count());

        $this->actingAs($agentB)->putJson("/api/agent/appointments/{$apptId}", ['title' => 'hacked'])
            ->assertStatus(404);
        $this->actingAs($agentB)->deleteJson("/api/agent/appointments/{$apptId}")->assertStatus(404);

        // Agent A can update it.
        $this->actingAs($agentA)->putJson("/api/agent/appointments/{$apptId}", ['status' => 'completed'])
            ->assertStatus(200);
    }
}
