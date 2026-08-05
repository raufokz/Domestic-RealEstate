<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use App\Models\Lead;
use App\Models\User;
use App\Observers\LeadObserver;
use App\Observers\UserObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // SMTP/sender settings saved under Admin → Email Settings drive the real
        // mail transport. No-ops (falling back to .env) when the DB is not ready.
        \App\Services\EmailMailConfigurator::apply();

        Lead::observe(LeadObserver::class);
        User::observe(UserObserver::class);

        // super_admin bypasses every permission/policy check — it is the
        // one role intentionally never listed in RolePermissionSeeder's
        // per-permission grants.
        Gate::before(function (User $user, string $ability) {
            return $user->role === 'super_admin' ? true : null;
        });
    }
}
