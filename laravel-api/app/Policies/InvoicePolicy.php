<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['agent', 'broker', 'staff', 'admin']);
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $user->hasAnyRole(['staff', 'admin']) || $invoice->user_id === $user->id;
    }

    /** Only staff/admin create and send invoices. */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['staff', 'admin']);
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $user->hasAnyRole(['staff', 'admin']);
    }

    /**
     * Nobody "marks paid" directly — that's the whole point of the fix.
     * Status only ever changes from PayoneerService's verified webhook
     * handler, which calls the model directly and never goes through this
     * policy. This exists so a stray future controller action can't
     * accidentally reintroduce a client-triggered paid flip.
     */
    public function markPaid(User $user, Invoice $invoice): bool
    {
        return false;
    }
}
