<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Real role/permission management — replaces the previous "roles" surface
 * that only ever read the cosmetic AdminRole catalog table. Backed by
 * spatie/laravel-permission (see RolePermissionSeeder for the seed shape,
 * UserObserver for how users.role stays in sync with the Spatie assignment).
 */
class RoleController extends Controller
{
    private function checkAdmin(): void
    {
        $user = Auth::user();
        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    public function index(): JsonResponse
    {
        $this->checkAdmin();

        // Deliberately not ->withCount('users'): Spatie's Role::users()
        // morphedByMany relation resolves the guard's model class from
        // $this->attributes['guard_name'], but withCount/withAggregate
        // builds the relation against a blank prototype Role instance with
        // no attributes yet — guard_name is null at that point, so the
        // model-class lookup fails. Counting via the users.role column
        // directly sidesteps it entirely.
        $roles = Role::with('permissions:id,name')
            ->get()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
                'users_count' => User::where('role', $role->name)->count(),
            ]);

        return ApiResponse::ok($roles);
    }

    public function permissions(): JsonResponse
    {
        $this->checkAdmin();

        return ApiResponse::ok(Permission::orderBy('name')->pluck('name'));
    }

    public function updateRolePermissions(Request $request, int $id): JsonResponse
    {
        $this->checkAdmin();

        $role = Role::findOrFail($id);

        if ($role->name === 'super_admin') {
            return ApiResponse::fail('super_admin always has every permission via Gate::before — it cannot be edited.', 'immutable_role', 422);
        }

        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->syncPermissions($validated['permissions']);

        return ApiResponse::ok([
            'id' => $role->id,
            'name' => $role->name,
            'permissions' => $role->permissions()->pluck('name'),
        ], 'Role permissions updated');
    }

    public function usersByRole(Request $request, string $roleName): JsonResponse
    {
        $this->checkAdmin();

        if (!in_array($roleName, User::ROLES, true)) {
            return ApiResponse::fail('Unknown role.', 'not_found', 404);
        }

        $users = User::role($roleName)
            ->select(['id', 'name', 'email', 'role', 'status', 'created_at'])
            ->orderBy('name')
            ->paginate(min((int) $request->get('per_page', 25), 100));

        return response()->json($users);
    }
}
