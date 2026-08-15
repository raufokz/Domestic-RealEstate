<?php

namespace App\Services;

use App\Models\ZipCode;

/**
 * Haversine distance between US ZIP codes, backed by the free zip_codes
 * centroid table (see ZipCodeSeeder) — no paid geocoding API involved.
 */
class DistanceService
{
    private const EARTH_RADIUS_MILES = 3958.8;

    /** @var array<string, array{latitude: float, longitude: float}|null> */
    private static array $cache = [];

    private static function centroid(string $zip): ?array
    {
        $zip = str_pad(substr(trim($zip), 0, 5), 5, '0', STR_PAD_LEFT);

        if (array_key_exists($zip, self::$cache)) {
            return self::$cache[$zip];
        }

        $row = ZipCode::find($zip);
        return self::$cache[$zip] = $row ? ['latitude' => $row->latitude, 'longitude' => $row->longitude] : null;
    }

    /**
     * Distance in miles between two ZIPs, or null when either ZIP isn't in
     * the reference table — callers must treat null as "unknown," never as
     * zero or infinity.
     */
    public static function milesBetweenZips(string $zipA, string $zipB): ?float
    {
        $a = self::centroid($zipA);
        $b = self::centroid($zipB);

        if (!$a || !$b) {
            return null;
        }

        return self::haversineMiles($a['latitude'], $a['longitude'], $b['latitude'], $b['longitude']);
    }

    public static function haversineMiles(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $h = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        return self::EARTH_RADIUS_MILES * 2 * atan2(sqrt($h), sqrt(1 - $h));
    }

    /** Nearest ZIP among $candidateZips to $originZip, with its distance — or null if none resolvable. */
    public static function nearest(string $originZip, array $candidateZips): ?array
    {
        $best = null;
        foreach ($candidateZips as $candidate) {
            $miles = self::milesBetweenZips($originZip, $candidate);
            if ($miles !== null && ($best === null || $miles < $best['miles'])) {
                $best = ['zip' => $candidate, 'miles' => $miles];
            }
        }
        return $best;
    }
}
