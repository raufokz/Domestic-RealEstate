<?php

namespace App\Services\Geo;

use App\Models\GeoTorExitNode;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;

/**
 * Free/self-hosted VPN-and-proxy signal: Tor exit node membership + known
 * datacenter/cloud/commercial-VPN-hosting ASN membership (config/geo.php,
 * extendable at runtime via SiteSetting group `geo_access` key
 * `custom_blocked_asns` — no code change needed). This is the single seam
 * to swap in a paid IP-reputation provider (IPQualityScore, ipinfo, etc.)
 * later without touching GeoAccessDecisionService.
 */
class IpReputationService
{
    public function check(string $ip, ?int $asn): array
    {
        return [
            'is_tor' => $this->isTorExitNode($ip),
            'is_datacenter' => $asn !== null && $this->isDatacenterAsn($asn),
        ];
    }

    private function isTorExitNode(string $ip): bool
    {
        $set = Cache::remember('geo:tor_set', now()->addHours(6), function () {
            return GeoTorExitNode::query()->pluck('ip_address')->flip()->all();
        });

        return isset($set[$ip]);
    }

    private function isDatacenterAsn(int $asn): bool
    {
        $seeded = array_keys(config('geo.datacenter_asns', []));
        $custom = Cache::remember('geo:custom_blocked_asns', now()->addMinutes(30), function () {
            // SiteSetting::get() only type-casts bool/numeric/string — arrays
            // are stored as JSON text and must be decoded explicitly here.
            $raw = SiteSetting::get('custom_blocked_asns', '[]');
            $decoded = is_string($raw) ? json_decode($raw, true) : $raw;

            return array_map('intval', is_array($decoded) ? $decoded : []);
        });

        return in_array($asn, $seeded, true) || in_array($asn, $custom, true);
    }
}
