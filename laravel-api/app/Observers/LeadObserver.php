<?php

namespace App\Observers;

use App\Models\Lead;
use App\Services\AutomationEngine;

class LeadObserver
{
    public function created(Lead $lead): void
    {
        AutomationEngine::trigger('new_lead', [
            'lead_id' => $lead->id,
            'email' => $lead->email,
            'name' => trim(($lead->first_name ?? '') . ' ' . ($lead->last_name ?? '')),
            'type' => $lead->type,
            'source' => $lead->source,
            'budget_min' => $lead->budget_min,
            'budget_max' => $lead->budget_max,
        ]);
    }

    public function updated(Lead $lead): void
    {
        if ($lead->wasChanged('status')) {
            AutomationEngine::trigger('status_changed', [
                'lead_id' => $lead->id,
                'email' => $lead->email,
                'name' => trim(($lead->first_name ?? '') . ' ' . ($lead->last_name ?? '')),
                'old_status' => $lead->getOriginal('status'),
                'new_status' => $lead->status,
            ]);
        }
    }
}
