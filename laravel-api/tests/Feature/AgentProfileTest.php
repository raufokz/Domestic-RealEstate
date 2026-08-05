<?php

namespace Tests\Feature;

use App\Models\AgentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AgentProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_agent_can_update_their_own_profile_fields(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);
        AgentProfile::create(['user_id' => $agent->id, 'slug' => 'test-agent']);

        $response = $this->actingAs($agent)->putJson('/api/admin/agent-profile/me', [
            'headline' => 'Top Producing Agent',
            'ethnicity' => 'Prefer not to say',
            'languages' => ['English', 'Spanish'],
            'service_areas' => ['Miami-Dade'],
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('agent_profiles', ['user_id' => $agent->id, 'headline' => 'Top Producing Agent']);
    }

    public function test_agent_cannot_mass_assign_verification_status_via_update(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);
        $profile = AgentProfile::create(['user_id' => $agent->id, 'slug' => 'test-agent-2', 'status' => 'pending']);

        $this->actingAs($agent)->putJson('/api/admin/agent-profile/me', [
            'status' => 'approved',
            'is_featured' => true,
            'headline' => 'Trying to self-approve',
        ])->assertStatus(200);

        $this->assertSame('pending', $profile->fresh()->status);
        $this->assertFalse((bool) $profile->fresh()->is_featured);
    }

    public function test_change_password_requires_correct_current_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('old-password-123')]);

        $this->actingAs($user)->putJson('/api/auth/change-password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])->assertStatus(422);

        $response = $this->actingAs($user)->putJson('/api/auth/change-password', [
            'current_password' => 'old-password-123',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertStatus(200);
        $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));
    }

    public function test_reset_password_accepts_frontend_field_names(): void
    {
        $user = User::factory()->create(['email' => 'reset-target@example.com']);
        $token = \Illuminate\Support\Facades\Password::broker()->createToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => 'reset-target@example.com',
            'token' => $token,
            'newPassword' => 'brand-new-password-1',
            'confirmPassword' => 'brand-new-password-1',
        ]);

        $response->assertStatus(200);
        $this->assertTrue(Hash::check('brand-new-password-1', $user->fresh()->password));
    }
}
