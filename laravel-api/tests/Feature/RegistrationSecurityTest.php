<?php

namespace Tests\Feature;

use App\Models\AgentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationSecurityTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Test User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'buyer',
        ], $overrides);
    }

    public function test_self_registration_as_super_admin_is_rejected(): void
    {
        $response = $this->postJson('/api/auth/register', $this->payload(['role' => 'super_admin']));

        $response->assertStatus(422);
        $this->assertDatabaseMissing('users', ['email' => 'newuser@example.com']);
    }

    public function test_self_registration_as_admin_is_rejected(): void
    {
        $response = $this->postJson('/api/auth/register', $this->payload(['role' => 'admin']));

        $response->assertStatus(422);
        $this->assertDatabaseMissing('users', ['email' => 'newuser@example.com']);
    }

    public function test_self_registration_as_buyer_still_works(): void
    {
        $response = $this->postJson('/api/auth/register', $this->payload());

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com', 'role' => 'buyer']);
    }

    public function test_self_registered_agent_profile_is_not_auto_approved_or_published(): void
    {
        $response = $this->postJson('/api/auth/register', $this->payload([
            'email' => 'newagent@example.com',
            'role' => 'agent',
        ]));

        $response->assertStatus(201);
        $user = User::where('email', 'newagent@example.com')->first();
        $profile = AgentProfile::where('user_id', $user->id)->first();

        $this->assertNotNull($profile);
        $this->assertSame('pending', $profile->status);
        $this->assertFalse((bool) $profile->is_published);
        $this->assertNull($profile->license_number);
        $this->assertSame('pending', $profile->license_status);
    }

    public function test_register_endpoint_is_rate_limited(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/auth/register', $this->payload(['email' => "user{$i}@example.com"]));
        }

        $response = $this->postJson('/api/auth/register', $this->payload(['email' => 'oneOverLimit@example.com']));

        $response->assertStatus(429);
    }
}
