<?php

namespace App\Services;

use App\Models\Lead;

/**
 * Classifies a lead into an observable-signal-based quality tier — never a
 * fabricated numeric score. Result is advisory: shown to admin in the
 * existing marketplace publish UI, not an auto-publish gate. Admin still
 * curates what actually gets listed, matching how publishing already works.
 */
class LeadQualityService
{
    public const HIGH_INTENT = 'high_intent';
    public const QUALIFIED = 'qualified';
    public const NURTURE = 'nurture';
    public const LOW_INTENT = 'low_intent';
    public const INVALID = 'invalid';
    public const DUPLICATE = 'duplicate';

    private const URGENT_TIMELINES = ['asap', 'immediately', '1-3-months', '1-3 months', 'sell soon'];

    public static function classify(Lead $lead): string
    {
        if (self::isInvalid($lead)) {
            return self::INVALID;
        }

        if (self::isDuplicate($lead)) {
            return self::DUPLICATE;
        }

        if (!$lead->funnel_completed_at) {
            return self::NURTURE;
        }

        if (self::hasUrgentTimeline($lead)) {
            return self::HIGH_INTENT;
        }

        $timeline = strtolower((string) $lead->timeline);
        if ($timeline !== '' && $timeline !== 'just-exploring' && $timeline !== 'just exploring' && $timeline !== 'not-sure' && $timeline !== 'not sure yet') {
            return self::QUALIFIED;
        }

        return self::LOW_INTENT;
    }

    private static function isInvalid(Lead $lead): bool
    {
        $hasValidEmail = $lead->normalized_email && filter_var($lead->email, FILTER_VALIDATE_EMAIL);
        $hasValidPhone = $lead->normalized_phone && strlen($lead->normalized_phone) >= 10;

        return !$hasValidEmail && !$hasValidPhone;
    }

    private static function isDuplicate(Lead $lead): bool
    {
        if (!$lead->source_intent) {
            return false;
        }

        return Lead::where('source_intent', $lead->source_intent)
            ->where('id', '!=', $lead->id)
            ->where('created_at', '>=', now()->subDays(30))
            ->where(function ($q) use ($lead) {
                if ($lead->normalized_email) {
                    $q->orWhere('normalized_email', $lead->normalized_email);
                }
                if ($lead->normalized_phone) {
                    $q->orWhere('normalized_phone', $lead->normalized_phone);
                }
            })
            ->exists();
    }

    private static function hasUrgentTimeline(Lead $lead): bool
    {
        $timeline = strtolower((string) $lead->timeline);

        foreach (self::URGENT_TIMELINES as $urgent) {
            if ($timeline === $urgent || str_contains($timeline, $urgent)) {
                return true;
            }
        }

        return false;
    }
}
