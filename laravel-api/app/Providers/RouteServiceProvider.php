<?php
namespace App\Providers;

use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

/**
 * Named rate limiters only ('api'/'auth'/'otp'). Route registration itself
 * is handled by bootstrap/app.php's ->withRouting() (Laravel 12 convention)
 * — this class must NOT also call $this->routes(...)/extend the routing
 * ServiceProvider, or routes/api.php + routes/web.php get registered twice.
 */
class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
        
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
        
        RateLimiter::for('otp', function (Request $request) {
            return Limit::perMinute(5)->by($request->input('phone') ?? $request->ip());
        });
    }
}
