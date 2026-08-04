<?php

namespace App\Services\Geo;

use GeoIp2\Database\Reader;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Resolves country/city/ASN/ISP for an IP from local MaxMind GeoLite2 .mmdb
 * files (see config/geo.php, populated by `php artisan geo:refresh-intelligence`).
 * Fails open (returns nulls) on any error — missing DB file, reserved/private
 * IP, unparsable address — so a missing/stale database never blocks traffic,
 * it just disables country-based blocking until fixed.
 */
class GeoIpLookupService
{
    public function lookup(string $ip): array
    {
        return Cache::remember("geoip:{$ip}", now()->addHours(12), function () use ($ip) {
            return $this->resolve($ip);
        });
    }

    private function resolve(string $ip): array
    {
        $result = [
            'country_code' => null,
            'country_name' => null,
            'city' => null,
            'asn' => null,
            'isp' => null,
        ];

        if (!filter_var($ip, FILTER_VALIDATE_IP)) {
            return $result;
        }

        // GeoLite2-City.mmdb also answers ->country(), so pointing
        // mmdb_country_path at either the Country or City edition works;
        // ->city queries on a Country-only DB are caught and left null.
        $countryPath = config('geo.mmdb_country_path');
        if (is_string($countryPath) && file_exists($countryPath)) {
            try {
                $reader = new Reader($countryPath);
                $record = $reader->country($ip);
                $result['country_code'] = $record->country->isoCode;
                $result['country_name'] = $record->country->name;
            } catch (\Throwable $e) {
                Log::debug('GeoIpLookupService: country lookup failed', ['ip' => $ip, 'error' => $e->getMessage()]);
            }

            try {
                $reader ??= new Reader($countryPath);
                $cityRecord = $reader->city($ip);
                $result['city'] = $cityRecord->city->name;
            } catch (\Throwable) {
                // Country-only DB has no city data — leave null.
            }
        }

        $asnPath = config('geo.mmdb_asn_path');
        if (is_string($asnPath) && file_exists($asnPath)) {
            try {
                $reader = new Reader($asnPath);
                $record = $reader->asn($ip);
                $result['asn'] = $record->autonomousSystemNumber;
                $result['isp'] = $record->autonomousSystemOrganization;
            } catch (\Throwable $e) {
                Log::debug('GeoIpLookupService: ASN lookup failed', ['ip' => $ip, 'error' => $e->getMessage()]);
            }
        }

        return $result;
    }
}
