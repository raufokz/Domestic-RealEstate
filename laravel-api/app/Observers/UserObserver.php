<?php

namespace App\Observers;

use App\Models\User;

/**
 * Keeps the real Spatie role assignment in sync with the legacy users.role
 * string column. The app has always read/written users.role directly across
 * ~40 controllers — rewriting every one of those to use Spatie roles instead
 * would be a large, risky rewrite for this phase. Instead both stay in sync:
 * users.role remains the source of truth on write, and every save mirrors
 * it into a real, policy-checkable Spatie role assignment.
 */
class UserObserver
{
    public function saved(User $user): void
    {
        if (!$user->wasRecentlyCreated && !$user->wasChanged('role')) {
            return;
        }

        if ($user->role && in_array($user->role, User::ROLES, true)) {
            $user->syncRoles([$user->role]);
        }
    }
}
