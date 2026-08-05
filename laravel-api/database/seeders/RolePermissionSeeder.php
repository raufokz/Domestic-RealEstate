<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Wires up spatie/laravel-permission for real. Roles mirror User::ROLES,
 * the values the app has always stored in users.role (kept in sync going
 * forward by UserObserver) so nothing that reads users.role today breaks — this adds
 * a real, checkable permission layer on top of that string, it doesn't
 * replace it. super_admin bypasses all permission checks via Gate::before
 * (AppServiceProvider::boot), so it does not need every permission listed.
 */
class RolePermissionSeeder extends Seeder
{
    public const PERMISSIONS = [
        'properties.manage' => ['agent', 'broker', 'staff', 'admin'],
        'properties.approve' => ['staff', 'admin'],
        'leads.manage' => ['agent', 'broker', 'staff', 'admin'],
        'contracts.manage' => ['agent', 'broker', 'staff', 'admin'],
        'contracts.sign' => ['buyer', 'seller', 'agent', 'broker', 'investor'],
        'invoices.manage' => ['staff', 'admin'],
        'invoices.view-own' => ['agent', 'broker', 'buyer', 'seller', 'investor'],
        'payouts.manage' => ['admin'],
        'payouts.view-own' => ['agent', 'broker'],
        'commissions.manage' => ['staff', 'admin'],
        'commissions.view-own' => ['agent', 'broker'],
        'realtors.verify' => ['staff', 'admin'],
        'geo-access.manage' => ['admin'],
        'roles.manage' => ['admin'],
        'blog.manage' => ['staff', 'admin'],
        'users.manage' => ['admin'],
        'marketplace.purchase' => ['agent', 'broker'],
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (User::ROLES as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        foreach (self::PERMISSIONS as $permissionName => $roles) {
            $permission = Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
            foreach ($roles as $roleName) {
                $role = Role::where('name', $roleName)->where('guard_name', 'web')->first();
                if ($role && !$role->hasPermissionTo($permission)) {
                    $role->givePermissionTo($permission);
                }
            }
        }

        // Backfill: every existing user gets a real Spatie role assignment
        // matching their current users.role string (previously nothing did
        // this — the Spatie tables were installed but empty).
        User::query()->select(['id', 'role'])->chunkById(200, function ($users) {
            foreach ($users as $user) {
                if ($user->role && in_array($user->role, User::ROLES, true)) {
                    $user->syncRoles([$user->role]);
                }
            }
        });
    }
}
