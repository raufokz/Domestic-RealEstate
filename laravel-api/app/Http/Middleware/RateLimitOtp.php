<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class RateLimitOtp
{
    public function handle(Request $request, Closure $next)
    {
        $key = 'otp:' . ($request->input('phone') ?? $request->ip());
        
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'message' => "Too many OTP requests. Try again in {$seconds} seconds.",
            ], 429);
        }
        
        RateLimiter::hit($key, 300);
        return $next($request);
    }
}
