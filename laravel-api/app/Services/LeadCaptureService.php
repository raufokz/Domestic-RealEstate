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

        $phone = isset($data['phone']) ? preg_replace('/[^\d]/', '', (string) $data['phone']) : '';

        $lead = null;
        if ($email !== '') {
            $lead = Lead::where('normalized_email', $email)->first();
        } elseif ($phone !== '') {
            $lead = Lead::where('normalized_phone', $phone)->first();
        }

        if (!$lead) {
            $lead = Lead::create([
                'email' => $email !== '' ? ($data['email'] ?? $email) : null,
                'normalized_email' => $email !== '' ? $email : null,
                'first_name' => $first ?: 'Guest',
                'last_name' => $last ?? '',
                'phone' => $data['phone'] ?? null,
                'normalized_phone' => $phone !== '' ? $phone : null,
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
                'pre_approved' => $data['pre_approved'] ?? false,
                'credit_score' => $data['credit_score'] ?? null,
                'realtor_status' => $data['realtor_status'] ?? null,
                'contact_time' => $data['contact_time'] ?? null,
                'consent_given' => $data['consent_given'] ?? false,
                'chat_metadata' => $data['chat_metadata'] ?? null,
                'lead_number' => 'LEAD-'.strtoupper(Str::random(8)),
                'ip_address' => $data['ip_address'] ?? null,
                'user_agent' => $data['user_agent'] ?? null,
                'page_url' => $data['page_url'] ?? null,
            ]);
            $lead->wasRecentlyCreated = true;
        } else {
            $lead->wasRecentlyCreated = false;
        }

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

        try {
            if (!empty($email)) {
                \App\Models\Contact::updateOrCreate(
                    ['email' => $email],
                    [
                        'first_name' => $first ?: 'Guest',
                        'last_name'  => $last ?? '',
                        'phone'      => $data['phone'] ?? null,
                        'type'       => [$data['type'] ?? 'buyer'],
                        'status'     => 'lead',
                        'source'     => $data['source'] ?? 'website',
                    ]
                );
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Contact sync skipped: ' . $e->getMessage());
        }

        return $lead->fresh();
    }

    /**
     * Progressive-capture funnels only (buy/sell/invest). NOT used by
     * upsert()'s callers (chat, marketing, service requests) — kept
     * entirely separate so nothing about their behavior changes.
     *
     * Dedup is scoped by `source_intent`, an IMMUTABLE column set once at
     * insert, deliberately NOT the admin-mutable `type` column — an admin
     * relabeling type for CRM housekeeping must never cause a stranger's
     * later funnel submission to silently merge into an old lead. See the
     * plan's design note for the concrete failure mode this avoids.
     *
     * Refuses to reuse a lead already in the marketplace pipeline
     * (marketplace_status != 'none') — that row is no longer safe to
     * mutate from an unauthenticated form; a fresh lead is created instead
     * and flagged for admin manual merge.
     */
    public static function checkpoint(string $sourceIntent, array $data): array
    {
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $phone = isset($data['phone']) ? preg_replace('/[^\d]/', '', (string) $data['phone']) : '';
        $name = trim((string) ($data['name'] ?? ''));
        $first = $data['first_name'] ?? null;
        $last = $data['last_name'] ?? null;

        if ((!$first || !$last) && $name !== '') {
            $parts = preg_split('/\s+/', $name, 2) ?: [];
            $first = $first ?: ($parts[0] ?? 'Guest');
            $last = $last ?: ($parts[1] ?? '');
        }

        $lead = null;
        $query = Lead::where('source_intent', $sourceIntent);
        if ($email !== '') {
            $lead = (clone $query)->where('normalized_email', $email)->first();
        } elseif ($phone !== '') {
            $lead = (clone $query)->where('normalized_phone', $phone)->first();
        }

        $flaggedForMerge = false;
        if ($lead && $lead->marketplace_status !== 'none') {
            $flaggedForMerge = true;
            $lead = null;
        }

        if (!$lead) {
            $lead = Lead::create([
                'email' => $email !== '' ? ($data['email'] ?? $email) : null,
                'normalized_email' => $email !== '' ? $email : null,
                'first_name' => $first ?: 'Guest',
                'last_name' => $last ?? '',
                'phone' => $data['phone'] ?? null,
                'normalized_phone' => $phone !== '' ? $phone : null,
                'type' => $data['type'] ?? $sourceIntent,
                'source_intent' => $sourceIntent,
                'source' => $data['source'] ?? ($sourceIntent . '_funnel'),
                'status' => 'new',
                'location' => $data['location'] ?? null,
                'timeline' => $data['timeline'] ?? null,
                'notes' => $flaggedForMerge
                    ? 'Possible duplicate — a same-intent lead for this contact is already in the marketplace pipeline; needs admin review/merge.'
                    : null,
                'consent_given' => !empty($data['consent_text']),
                'consent_text' => $data['consent_text'] ?? null,
                'consent_version' => $data['consent_version'] ?? null,
                'consent_given_at' => !empty($data['consent_text']) ? now() : null,
                'ip_address' => $data['ip_address'] ?? null,
                'user_agent' => $data['user_agent'] ?? null,
                'page_url' => $data['page_url'] ?? null,
                'lead_number' => 'LEAD-' . Str::random(8),
            ]);

            LeadActivity::create([
                'lead_id' => $lead->id,
                'type' => 'created',
                'description' => 'Checkpoint capture from ' . $sourceIntent . ' funnel (screen 3 — name/phone only)',
            ]);
        } else {
            // Re-checkpointing an already-partial lead (e.g. they left and
            // came back) — fill in blanks, never overwrite identity fields.
            $patch = array_filter([
                'phone' => $lead->phone ? null : ($data['phone'] ?? null),
                'location' => $lead->location ? null : ($data['location'] ?? null),
                'timeline' => $data['timeline'] ?? null,
            ], fn ($v) => $v !== null && $v !== '');
            if ($patch) {
                $lead->update($patch);
            }
        }

        $token = self::makeCheckpointToken($lead->id, $sourceIntent);

        return ['lead' => $lead->fresh(), 'token' => $token];
    }

    /**
     * Final-submit step of a progressive funnel. Resolves the lead by the
     * signed checkpoint token — NEVER by re-matching email/phone, which
     * would let anyone who knows a stranger's phone number inject
     * fabricated data (including a fake TCPA consent record) into that
     * stranger's lead. A missing/expired/mismatched token means treat this
     * as a fresh, disconnected submission rather than silently merging.
     */
    public static function complete(string $sourceIntent, string $token, array $data): Lead
    {
        $lead = self::resolveCheckpointToken($token, $sourceIntent);

        if (!$lead) {
            // No valid checkpoint — create a brand-new, disconnected lead.
            // Deliberately NOT calling checkpoint() here: it dedupes by
            // email/phone, which would let a missing/forged/expired token
            // silently fall through to the exact hijack this token exists
            // to prevent (merging attacker-supplied data, including a
            // forged consent timestamp, into a stranger's real lead).
            $email = strtolower(trim((string) ($data['email'] ?? '')));
            $phone = isset($data['phone']) ? preg_replace('/[^\d]/', '', (string) $data['phone']) : '';
            $name = trim((string) ($data['name'] ?? ''));
            $parts = $name !== '' ? (preg_split('/\s+/', $name, 2) ?: []) : [];

            $lead = Lead::create([
                'email' => $email !== '' ? ($data['email'] ?? $email) : null,
                'normalized_email' => $email !== '' ? $email : null,
                'first_name' => $parts[0] ?? 'Guest',
                'last_name' => $parts[1] ?? '',
                'phone' => $data['phone'] ?? null,
                'normalized_phone' => $phone !== '' ? $phone : null,
                'type' => $sourceIntent,
                'source_intent' => $sourceIntent,
                'source' => $sourceIntent . '_funnel_untokenized',
                'status' => 'new',
                'notes' => 'Submitted without a valid checkpoint token — created as a standalone lead rather than matched against any existing record.',
                'lead_number' => 'LEAD-' . Str::random(8),
            ]);
        }

        $patch = array_filter([
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
        ], fn ($v) => $v !== null && $v !== '');

        if (!empty($data['notes'])) {
            $patch['notes'] = trim(($lead->notes ? $lead->notes . "\n" : '') . $data['notes']);
        }

        $patch['funnel_completed_at'] = now();

        $lead->update($patch);
        $lead = $lead->fresh();

        $lead->update(['quality_tier' => LeadQualityService::classify($lead)]);

        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'updated',
            'description' => $sourceIntent . ' funnel completed',
        ]);

        try {
            if (!empty($lead->normalized_email)) {
                \App\Models\Contact::updateOrCreate(
                    ['email' => $lead->normalized_email],
                    [
                        'first_name' => $lead->first_name,
                        'last_name' => $lead->last_name,
                        'phone' => $lead->phone,
                        'type' => [$lead->type],
                        'status' => 'lead',
                        'source' => $lead->source,
                    ]
                );
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Contact sync skipped: ' . $e->getMessage());
        }

        return $lead->fresh();
    }

    private static function makeCheckpointToken(int $leadId, string $sourceIntent, int $ttlMinutes = 120): string
    {
        $expires = now()->addMinutes($ttlMinutes)->timestamp;
        $payload = "{$leadId}|{$sourceIntent}|{$expires}";
        $signature = hash_hmac('sha256', $payload, config('app.key'));

        return base64_encode($payload) . '.' . $signature;
    }

    private static function resolveCheckpointToken(string $token, string $expectedIntent): ?Lead
    {
        $parts = explode('.', $token, 2);
        if (count($parts) !== 2) {
            return null;
        }

        [$encodedPayload, $signature] = $parts;
        $payload = base64_decode($encodedPayload, true);
        if ($payload === false) {
            return null;
        }

        if (!hash_equals(hash_hmac('sha256', $payload, config('app.key')), $signature)) {
            return null;
        }

        $bits = explode('|', $payload, 3);
        if (count($bits) !== 3) {
            return null;
        }
        [$leadId, $sourceIntent, $expires] = $bits;

        if ($sourceIntent !== $expectedIntent || (int) $expires < now()->timestamp) {
            return null;
        }

        return Lead::find((int) $leadId);
    }
}
