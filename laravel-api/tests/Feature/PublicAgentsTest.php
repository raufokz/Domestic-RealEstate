<?php

namespace Tests\Feature;

use App\Models\AgentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicAgentsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_directory_lists_published_approved_agents(): void
    {
        AgentProfile::factory()->create(['status' => 'approved', 'is_published' => true]);
        AgentProfile::factory()->create(['status' => 'verified', 'is_published' => true]);
        AgentProfile::factory()->create(['status' => 'pending', 'is_published' => true]);
        AgentProfile::factory()->create(['status' => 'approved', 'is_published' => false]);
        AgentProfile::factory()->create(['status' => 'rejected', 'is_published' => true]);

        $this->getJson('/api/agents')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.user.name', fn ($name) => is_string($name));
    }

    public function test_public_directory_respects_city_and_specialty_filters(): void
    {
        AgentProfile::factory()->create(['status' => 'approved', 'is_published' => true, 'office_city' => 'Austin', 'specialties' => ['Luxury']]);
        AgentProfile::factory()->create(['status' => 'approved', 'is_published' => true, 'office_city' => 'Dallas', 'specialties' => ['First-time Buyers']]);

        $this->getJson('/api/agents?city=Austin')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.office_city', 'Austin');

        $this->getJson('/api/agents?specialty=Luxury')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_featured_endpoint_lists_published_approved_agents(): void
    {
        AgentProfile::factory()->create(['status' => 'approved', 'is_published' => true, 'is_featured' => true]);
        AgentProfile::factory()->create(['status' => 'verified', 'is_published' => true, 'is_featured' => true]);
        AgentProfile::factory()->create(['status' => 'pending', 'is_published' => true, 'is_featured' => true]);

        $this->getJson('/api/agents/featured')
            ->assertOk()
            ->assertJsonCount(2);
    }

    public function test_admin_can_verify_an_agent_profile(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $profile = AgentProfile::factory()->create(['status' => 'approved', 'is_published' => true]);

        $this->actingAs($admin)->postJson("/api/admin/realtors/{$profile->id}/status", ['status' => 'verified'])
            ->assertOk()
            ->assertJsonPath('data.status', 'verified');

        $this->assertSame('verified', $profile->fresh()->status);
        $this->assertTrue($profile->fresh()->is_published);
    }
}
