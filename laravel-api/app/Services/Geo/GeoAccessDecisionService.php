<?php

namespace App\Services\Geo;

use App\Models\GeoBlacklistEntry;
use App\Models\GeoWhitelistEntry;
use App\Models\SiteSetting;
use App\Models\User;
use App\Support\CidrMatcher;
use Illuminate\Support\Facades\Cache;

/**
 * Single source of truth for "should this IP be allowed in." Pure — takes
 * an IP (+ optionally an already-authenticated user) and returns a decision;
 * does not touch the request, does not log. Callers (EnforceGeoAccess
 * middleware, the /api/geo/check endpoint used by the Next.js frontend)
 * are responsible for acting on / logging the result.
 *
 * Priority order: admin session > whitelist > blacklist > blocking disabled
 * > unresolvable GeoIP > Tor > datacenter/VPN ASN > blocked country > allow.
 */
class GeoAccessDecisionService
{
    public function __construct(
        private GeoIpLookupService $geoIpLookup,
        private IpReputationService $ipReputation,
        private CrawlerVerificationService $crawlerVerification,
    ) {
    }

    public function decide(string $ip, ?User $user = null): array
    {
        if ($user && in_array($user->role, ['admin', 'super_admin'], true)) {
            return $this->allow('admin_authenticated');
        }

        if ($whitelisted = $this->matchEntry(GeoWhitelistEntry::class, $ip)) {
            $whitelisted->forceFill(['last_used_at' => now()])->saveQuietly();

            return $this->allow('whitelisted');
        }

        if ($this->matchEntry(GeoBlacklistEntry::class, $ip)) {
            return $this->deny('blacklisted', $ip);
        }

        /*
         * Search engines crawl from datacenter ASNs, so without this they were
         * denied below and served a 403 carrying a noindex tag — which is why
         * the site could not be indexed at all. Verification is DNS-based, not
         * User-Agent based, so this cannot be used to bypass the block.
         * Deliberately placed after the blacklist: an explicitly blacklisted IP
         * stays blocked whatever its reverse DNS claims.
         */
        if ($this->crawlerVerification->isVerifiedCrawler($ip)) {
            return $this->allow('verified_search_crawler');
        }

        $settings = $this->settings();

        if (!$settings['geo_blocking_enabled']) {
            return $this->allow('geo_blocking_disabled');
        }

        $intel = $this->geoIpLookup->lookup($ip);

        if ($intel['country_code'] === null && $intel['asn'] === null) {
            return $this->allow('geoip_unresolvable', $intel);
        }

        $reputation = $this->ipReputation->check($ip, $intel['asn']);

        if ($settings['tor_blocking_enabled'] && $reputation['is_tor']) {
            return $this->deny('tor_exit_node', $ip, $intel, $reputation);
        }

        if (($settings['vpn_detection_enabled'] || $settings['proxy_detection_enabled'] || $settings['datacenter_blocking_enabled']) && $reputation['is_datacenter']) {
            return $this->deny('datacenter_asn', $ip, $intel, $reputation);
        }

        if ($intel['country_code'] && in_array($intel['country_code'], $settings['blocked_countries'], true)) {
            return $this->deny('country_blocked', $ip, $intel, $reputation);
        }

        return $this->allow('country_allowed', $intel, $reputation);
    }

    /** @param class-string<GeoWhitelistEntry>|class-string<GeoBlacklistEntry> $model */
    private function matchEntry(string $model, string $ip): GeoWhitelistEntry|GeoBlacklistEntry|null
    {
        $cacheKey = $model === GeoWhitelistEntry::class ? 'geo:whitelist_entries' : 'geo:blacklist_entries';
        $entries = Cache::remember($cacheKey, now()->addMinutes(5), fn () => $model::query()->active()->get());

        foreach ($entries as $entry) {
            if ($entry->is_cidr) {
                if (CidrMatcher::matches($ip, $entry->value)) {
                    return $entry;
                }
            } elseif ($entry->value === $ip) {
                return $entry;
            }
        }

        return null;
    }

    private function settings(): array
    {
        // Short TTL: admin changes take effect within a minute, while every
        // decide() call avoids re-querying SiteSetting ~7 times over.
        return Cache::remember('geo:settings', now()->addMinute(), function () {
            $get = fn (string $key, mixed $default) => SiteSetting::get($key, $default);
            $getJson = function (string $key, array $default) {
                $raw = SiteSetting::get($key, null);
                if ($raw === null) {
                    return $default;
                }
                $decoded = is_string($raw) ? json_decode($raw, true) : $raw;

                return is_array($decoded) ? $decoded : $default;
            };

            return [
                'geo_blocking_enabled' => (bool) $get('geo_blocking_enabled', true),
                'blocked_countries' => $getJson('blocked_countries', ['PK']),
                'vpn_detection_enabled' => (bool) $get('vpn_detection_enabled', true),
                'proxy_detection_enabled' => (bool) $get('proxy_detection_enabled', true),
                'tor_blocking_enabled' => (bool) $get('tor_blocking_enabled', true),
                'datacenter_blocking_enabled' => (bool) $get('datacenter_blocking_enabled', true),
                'blocked_message' => (string) $get('blocked_message', config('geo.default_blocked_message')),
            ];
        });
    }

    private function allow(string $reason, array $intel = [], array $reputation = []): array
    {
        return $this->result(true, $reason, $intel, $reputation);
    }

    private function deny(string $reason, string $ip, array $intel = [], array $reputation = []): array
    {
        return $this->result(false, $reason, $intel, $reputation);
    }

    private function result(bool $allowed, string $reason, array $intel, array $reputation): array
    {
        return [
            'allowed' => $allowed,
            'reason' => $reason,
            'country_code' => $intel['country_code'] ?? null,
            'country_name' => $intel['country_name'] ?? null,
            'city' => $intel['city'] ?? null,
            'asn' => $intel['asn'] ?? null,
            'isp' => $intel['isp'] ?? null,
            'is_tor' => $reputation['is_tor'] ?? false,
            'is_datacenter' => $reputation['is_datacenter'] ?? false,
            'blocked_message' => $this->settings()['blocked_message'],
        ];
    }
}
