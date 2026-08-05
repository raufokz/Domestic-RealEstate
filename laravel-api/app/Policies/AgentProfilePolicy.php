<?php

namespace App\Policies;

use App\Models\AgentProfile;
use App\Models\User;

class AgentProfilePolicy
{
    public function view(User $user, AgentProfile $profile): bool
    {
        return true;
    }

    public function update(User $user, AgentProfile $profile): bool
    {
        if ($user->hasAnyRole(['staff', 'admin'])) {
            return true;
        }

        return $profile->user_id === $user->id;
    }

    /**
     * Verification-status fields (status/approved_at/verified_by/verified_at/
     * license_status/payment_status) are staff/admin only — never the
     * profile owner, even though they can update the rest of their profile.
     */
    public function verify(User $user, AgentProfile $profile): bool
    {
        return $user->hasAnyRole(['staff', 'admin']);
    }
}
