<?php
namespace App\Http\Middleware;

use App\Support\ApiResponse;
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
            return ApiResponse::fail(
                'Please sign in again to continue.',
                'unauthenticated',
                401,
                reason: 'your session expired or you are not logged in',
                fix: 'Log in at /admin/login or your portal login page.',
            );
        }

        if ($user->status !== 'active') {
            return ApiResponse::fail(
                'Your account is not active.',
                'account_inactive',
                403,
                reason: 'this account has been suspended or deactivated',
                fix: 'Contact info@domesticrealestate.us to reactivate your account.',
            );
        }

        if (!empty($roles) && !in_array($user->role, $roles, true)) {
            return ApiResponse::fail(
                'You do not have permission to do this.',
                'insufficient_role',
                403,
                reason: 'your account role does not have access to this resource',
            );
        }

        return $next($request);
    }
}
