<?php

namespace App\Services;

use App\Models\AgentProfile;
use App\Models\Lead;
use App\Models\LeadAssignment;
use App\Models\LeadMatch;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

/**
 * Matches a newly captured lead against published, approved agents by
 * ZIP/city coverage (AgentProfile::service_areas) and lead-type preference,
 * records every considered candidate as a LeadMatch (for admin visibility),
 * and auto-assigns + notifies the top-scoring candidate when the match is
 * strong enough to route without a human picking.
 */
class LeadRoutingService
{
    /** Minimum score required to auto-assign rather than leave for manual triage. */
    private const MIN_ASSIGN_SCORE = 50;

    private const MAX_MATCHES_STORED = 5;

    /** Lead types this engine routes. Realtor/vendor leads go through other flows. */
    private const ROUTABLE_TYPES = ['buyer', 'seller', 'investor'];

    /**
     * @param  int[]  $excludeAgentUserIds  Agents to skip (e.g. one who just declined).
     * @return int|null The assigned agent's user_id, or null if nothing was routed.
     */
    public static function route(Lead $lead, array $excludeAgentUserIds = []): ?int
    {
        if (!in_array($lead->type, self::ROUTABLE_TYPES, true)) {
            return null;
        }

        try {
            $candidates = AgentProfile::query()
                ->where('is_published', true)
                ->whereIn('status', ['approved', 'verified'])
                ->when(!empty($excludeAgentUserIds), fn ($q) => $q->whereNotIn('user_id', $excludeAgentUserIds))
                ->get();

            $scored = $candidates
                ->map(fn (AgentProfile $profile) => ['profile' => $profile, 'score' => self::score($profile, $lead)])
                ->filter(fn (array $c) => $c['score'] > 0)
                ->sortByDesc('score')
                ->values();

            if ($scored->isEmpty()) {
                return null;
            }

            $now = now();
            foreach ($scored->take(self::MAX_MATCHES_STORED) as $c) {
                LeadMatch::create([
                    'lead_id' => $lead->id,
                    'agent_id' => $c['profile']->user_id,
                    'score' => $c['score'],
                    'matched_at' => $now,
                ]);
            }

            $top = $scored->first();
            if ($top['score'] < self::MIN_ASSIGN_SCORE) {
                return null;
            }

            $agentUserId = $top['profile']->user_id;

            LeadAssignment::create([
                'lead_id' => $lead->id,
                'agent_id' => $agentUserId,
                'status' => 'sent',
                'assigned_at' => $now,
            ]);

            $lead->forceFill(['assigned_to' => $agentUserId])->saveQuietly();

            self::notifyAgent($agentUserId, $lead);

            return $agentUserId;
        } catch (\Throwable $e) {
            // Routing is a best-effort enhancement on top of lead capture — a
            // failure here must never break the capture request itself.
            Log::warning('Lead routing failed', ['lead_id' => $lead->id, 'error' => $e->getMessage()]);
            return null;
        }
    }

    private static function score(AgentProfile $profile, Lead $lead): int
    {
        $areas = array_map(
            fn ($a) => strtolower(trim((string) $a)),
            is_array($profile->service_areas) ? $profile->service_areas : []
        );

        $score = 0;
        if ($lead->zip_code && in_array(strtolower($lead->zip_code), $areas, true)) {
            $score = 50;
        } elseif ($lead->zip_code && $profile->radius_miles && ($withinRadius = self::withinRadiusScore($profile, $lead->zip_code)) !== null) {
            // Not an exact ZIP match, but the lead falls inside the agent's
            // declared coverage radius — real haversine distance via the
            // free zip_codes centroid table, not a fabricated estimate.
            $score = $withinRadius;
        } elseif ($lead->city && in_array(strtolower($lead->city), $areas, true)) {
            $score = 30;
        } elseif ($lead->location) {
            $locationLower = strtolower($lead->location);
            foreach ($areas as $area) {
                if ($area !== '' && str_contains($locationLower, $area)) {
                    $score = 20;
                    break;
                }
            }
        }

        // No geographic signal at all — this isn't a routing match, just a
        // generic active agent. Don't auto-route on preference/rating alone.
        if ($score === 0) {
            return 0;
        }

        $prefs = is_array($profile->lead_type_preferences) ? ($profile->lead_type_preferences['leads'] ?? []) : [];
        $prefs = array_map('strtolower', is_array($prefs) ? $prefs : []);

        if (!empty($prefs)) {
            if (!in_array(strtolower($lead->type), $prefs, true)) {
                return 0; // agent explicitly opted out of this lead type
            }
            $score += 20;
        } else {
            $score += 10; // no explicit preference recorded — treat as a generalist
        }

        $score += (int) round(((float) ($profile->rating ?? 0)) * 2);

        return $score;
    }

    /**
     * Scores 30-45 (between the city-match and exact-ZIP tiers) when the lead's
     * ZIP is within the agent's declared radius of one of their coverage ZIPs,
     * scaled by proximity. Returns null when it can't be determined (agent has
     * no ZIP-formatted coverage entries, or either ZIP is outside the free
     * centroid table) — callers must not treat null as zero distance.
     */
    private static function withinRadiusScore(AgentProfile $profile, string $leadZip): ?int
    {
        $agentZips = array_filter(array_unique(array_merge(
            [$profile->office_zip],
            is_array($profile->service_areas) ? $profile->service_areas : []
        )), fn ($z) => is_string($z) && preg_match('/^\d{5}$/', trim($z)));

        if (empty($agentZips)) {
            return null;
        }

        $nearest = DistanceService::nearest($leadZip, array_values($agentZips));
        if ($nearest === null || $nearest['miles'] > $profile->radius_miles) {
            return null;
        }

        $proximity = 1 - ($nearest['miles'] / $profile->radius_miles); // 0 (edge) .. 1 (same spot)
        return (int) round(30 + $proximity * 15); // 30..45
    }

    private static function notifyAgent(int $agentUserId, Lead $lead): void
    {
        Notification::create([
            'user_id' => $agentUserId,
            'type' => 'lead_routed',
            'severity' => Notification::SEVERITY_INFO,
            'module' => 'leads',
            'title' => 'New ' . ucfirst($lead->type) . ' lead routed to you',
            'message' => trim(($lead->first_name ?? '') . ' ' . ($lead->last_name ?? ''))
                . ' matches your service area. Accept it from your leads dashboard before it is offered to another agent.',
            'action_url' => '/agent/dashboard/leads/' . $lead->id,
            'action_label' => 'View lead',
            'data' => ['lead_id' => $lead->id],
        ]);
    }
}
