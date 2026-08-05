<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Property $property): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['agent', 'broker', 'staff', 'admin']);
    }

    public function update(User $user, Property $property): bool
    {
        if ($user->hasAnyRole(['staff', 'admin'])) {
            return true;
        }

        return $user->hasAnyRole(['agent', 'broker']) && $property->realtor_id === $user->id;
    }

    public function delete(User $user, Property $property): bool
    {
        return $this->update($user, $property);
    }

    public function approve(User $user, Property $property): bool
    {
        return $user->hasAnyRole(['staff', 'admin']);
    }
}
