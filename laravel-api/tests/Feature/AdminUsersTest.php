<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUsersTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_users_with_expected_contract(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'created_at' => now()->subDays(3)]);
        User::factory()->create(['name' => 'Jane Doe', 'email' => 'jane@example.com', 'role' => 'agent', 'status' => 'active', 'created_at' => now()->subDays(2)]);
        User::factory()->create(['name' => 'John Smith', 'email' => 'john@example.com', 'role' => 'buyer', 'status' => 'pending', 'created_at' => now()->subDay()]);

        $this->actingAs($admin)->getJson('/api/admin/users')
            ->assertOk()
            ->assertJsonStructure([
                'current_page',
                'last_page',
                'total',
                'data' => [
                    '*' => ['id', 'name', 'email', 'role', 'status', 'created_at'],
                ],
            ])
            ->assertJsonPath('data.0.name', 'John Smith')
            ->assertJsonPath('data.1.name', 'Jane Doe');
    }

    public function test_users_endpoint_respects_search_and_role_filters(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['name' => 'Alice Agent', 'email' => 'alice@example.com', 'role' => 'agent', 'status' => 'active']);
        User::factory()->create(['name' => 'Bob Buyer', 'email' => 'bob@example.com', 'role' => 'buyer', 'status' => 'active']);

        $this->actingAs($admin)->getJson('/api/admin/users?role=agent')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Alice Agent');

        $this->actingAs($admin)->getJson('/api/admin/users?search=Bob')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'bob@example.com');
    }

    public function test_admin_can_create_and_update_a_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $create = $this->actingAs($admin)->postJson('/api/admin/users', [
            'name' => 'New Agent',
            'email' => 'new@example.com',
            'role' => 'agent',
            'password' => 'Password123!',
        ]);
        $create->assertStatus(201)->assertJsonPath('data.name', 'New Agent');

        $user = User::where('email', 'new@example.com')->firstOrFail();

        $this->actingAs($admin)->putJson("/api/admin/users/{$user->id}", [
            'name' => 'Renamed Agent',
            'status' => 'suspended',
        ])->assertOk()->assertJsonPath('data.name', 'Renamed Agent');

        $this->assertSame('suspended', $user->fresh()->status);
    }

    public function test_duplicate_email_rejected_on_create(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['email' => 'taken@example.com']);

        $this->actingAs($admin)->postJson('/api/admin/users', [
            'name' => 'Dup',
            'email' => 'taken@example.com',
            'role' => 'buyer',
            'password' => 'Password123!',
        ])->assertStatus(422);
    }
}
