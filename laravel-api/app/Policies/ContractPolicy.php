<?php

namespace App\Policies;

use App\Models\Contract;
use App\Models\User;

class ContractPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['agent', 'broker', 'staff', 'admin']);
    }

    public function view(User $user, Contract $contract): bool
    {
        if ($user->hasAnyRole(['staff', 'admin'])) {
            return true;
        }

        return $contract->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['agent', 'broker', 'staff', 'admin']);
    }

    public function update(User $user, Contract $contract): bool
    {
        return $user->hasAnyRole(['staff', 'admin']) || $contract->user_id === $user->id;
    }

    /** Only the contract's own recipient can sign it — never staff on their behalf. */
    public function sign(User $user, Contract $contract): bool
    {
        return $contract->user_id === $user->id;
    }
}
