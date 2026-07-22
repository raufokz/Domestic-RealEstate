<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\LeadActivity;
use Illuminate\Support\Str;

/**
 * Central CRM lead upsert used by chat, forms, marketing, and service requests.
 */
class LeadCaptureService
{
    public static function upsert(array $data): Lead
    {
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $name = trim((string) ($data['name'] ?? ''));
        $first = $data['first_name'] ?? null;
        $last = $data['last_name'] ?? null;

        if ((! $first || ! $last) && $name !== '') {
            $parts = preg_split('/\s+/', $name, 2) ?: [];
            $first = $first ?: ($parts[0] ?? 'Guest');
            $last = $last ?: ($parts[1] ?? '');
        }

        $lead = Lead::firstOrCreate(
            ['normalized_email' => $email],
            [
                'email' => $data['email'] ?? $email,
                'first_name' => $first ?: 'Guest',
                'last_name' => $last ?? '',
                'phone' => $data['phone'] ?? null,
                'normalized_phone' => ! empty($data['phone'])
                    ? preg_replace('/[^\d]/', '', (string) $data['phone'])
                    : null,
                'type' => $data['type'] ?? 'buyer',
                'source' => $data['source'] ?? 'website',
                'status' => 'new',
                'notes' => $data['notes'] ?? null,
                'budget_min' => $data['budget_min'] ?? null,
                'budget_max' => $data['budget_max'] ?? null,
                'timeline' => $data['timeline'] ?? null,
                'motivation' => $data['motivation'] ?? null,
                'property_type' => $data['property_type'] ?? null,
                'bedrooms' => $data['bedrooms'] ?? null,
                'bathrooms' => $data['bathrooms'] ?? null,
                'location' => $data['location'] ?? null,
                'financing' => $data['financing'] ?? null,
                'pre_approved' => $data['pre_approved'] ?? null,
                'credit_score' => $data['credit_score'] ?? null,
                'realtor_status' => $data['realtor_status'] ?? null,
                'contact_time' => $data['contact_time'] ?? null,
                'consent_given' => $data['consent_given'] ?? null,
                'chat_metadata' => $data['chat_metadata'] ?? null,
                'lead_number' => 'LEAD-'.strtoupper(Str::random(8)),
                'ip_address' => $data['ip_address'] ?? null,
                'user_agent' => $data['user_agent'] ?? null,
                'page_url' => $data['page_url'] ?? null,
            ]
        );

        if ($lead->wasRecentlyCreated) {
            LeadActivity::create([
                'lead_id' => $lead->id,
                'type' => 'created',
                'description' => 'Lead created from '.($data['source'] ?? 'website'),
                'performed_by' => $data['performed_by'] ?? null,
            ]);
        } else {
            $patch = array_filter([
                'phone' => $data['phone'] ?? null,
                'budget_min' => $data['budget_min'] ?? null,
                'budget_max' => $data['budget_max'] ?? null,
                'timeline' => $data['timeline'] ?? null,
                'motivation' => $data['motivation'] ?? null,
                'property_type' => $data['property_type'] ?? null,
                'bedrooms' => $data['bedrooms'] ?? null,
                'bathrooms' => $data['bathrooms'] ?? null,
                'location' => $data['location'] ?? null,
                'financing' => $data['financing'] ?? null,
                'pre_approved' => $data['pre_approved'] ?? null,
                'credit_score' => $data['credit_score'] ?? null,
                'realtor_status' => $data['realtor_status'] ?? null,
                'contact_time' => $data['contact_time'] ?? null,
                'consent_given' => $data['consent_given'] ?? null,
            ], fn ($v) => $v !== null && $v !== '');

            if (! empty($data['notes'])) {
                $patch['notes'] = trim(($lead->notes ? $lead->notes."\n" : '').$data['notes']);
            }
            if ($patch) {
                $lead->update($patch);
            }
            LeadActivity::create([
                'lead_id' => $lead->id,
                'type' => 'updated',
                'description' => 'Lead updated from '.($data['source'] ?? 'website'),
                'performed_by' => $data['performed_by'] ?? null,
            ]);
        }

        return $lead->fresh();
    }
}
