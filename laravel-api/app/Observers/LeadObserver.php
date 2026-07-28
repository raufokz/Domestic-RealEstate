<?php

namespace App\Observers;

use App\Models\Lead;
use App\Services\AutomationEngine;

class LeadObserver
{
    public function created(Lead $lead): void
    {
        // Auto-create a Deal in the default pipeline if no deal exists for this lead
        if (!\App\Models\Deal::where('lead_id', $lead->id)->exists()) {
            $pipeline = \App\Models\Pipeline::where('slug', $lead->type)->first()
                ?: \App\Models\Pipeline::where('is_default', true)->first()
                ?: \App\Models\Pipeline::first();
            if ($pipeline) {
                $stage = $pipeline->stages()->orderBy('sort_order')->first();
                if ($stage) {
                    \App\Models\Deal::create([
                        'lead_id' => $lead->id,
                        'pipeline_id' => $pipeline->id,
                        'stage_id' => $stage->id,
                        'title' => trim(($lead->first_name ?? '') . ' ' . ($lead->last_name ?? '')) . ' - ' . ucfirst($lead->type ?: 'Sales') . ' Deal',
                        'value' => $lead->budget_max ?? 0,
                        'status' => 'active',
                    ]);
                }
            }
        }

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
