<?php

namespace App\Traits;

use App\Observers\AdminActivityObserver;

/**
 * Opt a model into the generic admin audit trail (admin_activity_logs) by
 * adding `use HasAdminActivityLog;` — no per-model registration needed
 * elsewhere, Eloquent auto-calls boot{TraitName}() for every trait used.
 */
trait HasAdminActivityLog
{
    public static function bootHasAdminActivityLog(): void
    {
        static::observe(AdminActivityObserver::class);
    }
}
