<?php

namespace Tests\Feature;

use App\Models\Contact;
use App\Models\Deal;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use App\Models\Property;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_cannot_access_admin_surface(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);

        $this->actingAs($buyer)->getJson('/api/admin/users')->assertStatus(403);
        $this->actingAs($buyer)->getJson('/api/email-campaigns')->assertStatus(403);
        $this->actingAs($buyer)->getJson('/api/pipelines')->assertStatus(403);
        $this->actingAs($buyer)->postJson('/api/admin/contacts', ['first_name' => 'X', 'last_name' => 'Y', 'email' => 'x@y.com'])->assertStatus(403);
    }

    public function test_agent_can_use_carved_out_admin_routes(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);

        $this->actingAs($agent)->getJson('/api/admin/agent-profile/me')->assertStatus(200);
        $this->actingAs($agent)->getJson('/api/admin/contacts/search?q=test')->assertStatus(200);
        $this->actingAs($agent)->getJson('/api/admin/property-types')->assertStatus(200);
    }

    public function test_agent_cannot_access_admin_management(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);

        $this->actingAs($agent)->getJson('/api/admin/users')->assertStatus(403);
        $this->actingAs($agent)->postJson('/api/admin/backups/create', [])->assertStatus(403);
    }

    public function test_agent_cannot_self_approve_or_feature_property(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);
        $property = Property::factory()->create([
            'realtor_id' => $agent->id,
            'approval_status' => 'pending',
            'featured' => false,
            'premium' => false,
        ]);

        $response = $this->actingAs($agent)->putJson("/api/properties/{$property->id}", [
            'title' => 'Updated Title',
            'approval_status' => 'approved',
            'featured' => true,
            'premium' => true,
        ]);

        $response->assertStatus(200);
        $fresh = $property->fresh();
        $this->assertSame('Updated Title', $fresh->title);
        $this->assertSame('pending', $fresh->approval_status);
        $this->assertFalse((bool) $fresh->featured);
        $this->assertFalse((bool) $fresh->premium);
    }

    public function test_pipeline_bulk_move_works_and_rejects_foreign_stage(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $pipeline = Pipeline::create(['name' => 'Sales', 'slug' => 'sales', 'is_active' => true]);
        $stageA = PipelineStage::create(['pipeline_id' => $pipeline->id, 'name' => 'Open', 'slug' => 'open', 'sort_order' => 1]);
        $stageB = PipelineStage::create(['pipeline_id' => $pipeline->id, 'name' => 'Won', 'slug' => 'won', 'sort_order' => 2, 'is_won' => true]);
        $deal = Deal::create([
            'pipeline_id' => $pipeline->id,
            'stage_id' => $stageA->id,
            'assigned_to' => $admin->id,
            'title' => 'Lead deal',
            'value' => 1000,
            'status' => 'open',
        ]);

        $moved = $this->actingAs($admin)->postJson("/api/pipelines/{$pipeline->id}/deals/bulk-move", [
            'deal_ids' => [$deal->id],
            'stage_id' => $stageB->id,
        ]);
        $moved->assertStatus(200)->assertJson(['data' => ['moved_count' => 1]]);
        $this->assertSame('won', $deal->fresh()->status);

        $otherPipeline = Pipeline::create(['name' => 'Other', 'slug' => 'other', 'is_active' => true]);
        $foreignStage = PipelineStage::create(['pipeline_id' => $otherPipeline->id, 'name' => 'X', 'slug' => 'x', 'sort_order' => 1]);

        $this->actingAs($admin)->putJson("/api/pipelines/{$pipeline->id}/deals/{$deal->id}/move", [
            'stage_id' => $foreignStage->id,
        ])->assertStatus(422);
    }

    public function test_guest_service_request_requires_admin(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $admin = User::factory()->create(['role' => 'admin']);
        $sr = ServiceRequest::create([
            'request_number' => 'SR-TEST-1',
            'user_id' => null,
            'full_name' => 'Guest',
            'email' => 'guest@example.com',
            'service_type' => 'buyer',
            'status' => 'new',
        ]);

        $this->actingAs($buyer)->getJson("/api/service-requests/{$sr->request_number}")->assertStatus(403);
        $this->actingAs($admin)->getJson("/api/service-requests/{$sr->request_number}")->assertStatus(200);
    }
}
