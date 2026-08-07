<?php
namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;

class EnsureActive
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user() && $request->user()->status !== 'active') {
            return ApiResponse::fail(
                'Your account is not active.',
                'account_inactive',
                403,
                reason: 'this account has been suspended or deactivated',
                fix: 'Contact info@domesticrealestate.us to reactivate your account.',
            );
        }
        return $next($request);
    }
}
