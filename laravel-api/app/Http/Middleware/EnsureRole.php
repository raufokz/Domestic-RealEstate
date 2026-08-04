<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureRole
{
    /**
     * Require an authenticated user whose role is in the allowed list.
     *
     * Usage: ->middleware('role:agent,admin,super_admin')
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'Your account is not active.'], 403);
        }

        if (!empty($roles) && !in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'Forbidden. Insufficient permissions.'], 403);
        }

        return $next($request);
    }
}
