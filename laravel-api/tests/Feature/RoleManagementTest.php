<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_list_roles(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);

        $response = $this->actingAs($superAdmin)->getJson('/api/admin/roles');

        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'agent']);
    }

    public function test_non_admin_cannot_manage_roles(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);

        $this->actingAs($agent)->getJson('/api/admin/roles')->assertStatus(403);
    }

    public function test_admin_can_update_role_permissions(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $agentRole = \Spatie\Permission\Models\Role::where('name', 'agent')->first();

        $response = $this->actingAs($admin)->putJson("/api/admin/roles/{$agentRole->id}", [
            'permissions' => ['properties.manage'],
        ]);

        $response->assertStatus(200);
        $this->assertTrue($agentRole->fresh()->hasPermissionTo('properties.manage'));
        $this->assertFalse($agentRole->fresh()->hasPermissionTo('leads.manage'));
    }

    public function test_super_admin_role_cannot_be_edited(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $superAdminRole = \Spatie\Permission\Models\Role::where('name', 'super_admin')->first();

        $response = $this->actingAs($admin)->putJson("/api/admin/roles/{$superAdminRole->id}", [
            'permissions' => ['properties.manage'],
        ]);

        $response->assertStatus(422);
    }
}
