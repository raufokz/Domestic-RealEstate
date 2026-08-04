<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Internal cross-service secret
    |--------------------------------------------------------------------------
    | Shared with the Next.js frontend's server-only GEO_INTERNAL_SECRET env
    | var. Required by POST /api/geo/check (X-Geo-Internal-Secret header) so
    | that endpoint's client-supplied IP override can't be used by the public
    | to bypass the geo-block on the regular API (which only ever trusts
    | $request->ip()).
    */
    'internal_secret' => env('GEO_INTERNAL_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | MaxMind GeoLite2 database paths
    |--------------------------------------------------------------------------
    | Populated by `php artisan geo:refresh-intelligence` when GEOIP_LICENSE_KEY
    | is set. Country/ASN lookups fail open (treated as "allow") when these
    | files are missing, so the site never breaks because of a missing DB.
    */
    'mmdb_country_path' => storage_path('app/geoip/GeoLite2-Country.mmdb'),
    'mmdb_asn_path' => storage_path('app/geoip/GeoLite2-ASN.mmdb'),
    'geoip_license_key' => env('GEOIP_LICENSE_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Tor exit node list
    |--------------------------------------------------------------------------
    */
    'tor_list_url' => env('GEO_TOR_LIST_URL', 'https://check.torproject.org/torbulkexitlist'),

    /*
    |--------------------------------------------------------------------------
    | Seeded datacenter / cloud / commercial-VPN-hosting ASNs
    |--------------------------------------------------------------------------
    | Free/self-hosted substitute for a paid VPN/proxy reputation API. Catches
    | traffic exiting known cloud & hosting providers (most consumer VPN exit
    | nodes run on these). Admin-added ASNs (SiteSetting group `geo_access`,
    | key `custom_blocked_asns`) are merged on top of this list at runtime —
    | no code change needed to extend it. Does NOT catch residential-IP or
    | mobile-proxy VPN services; see IpReputationService for the swap point
    | if a paid provider is added later.
    */
    'datacenter_asns' => [
        16509 => 'Amazon AWS',
        14618 => 'Amazon AWS',
        15169 => 'Google Cloud',
        396982 => 'Google Cloud',
        8075 => 'Microsoft Azure',
        8068 => 'Microsoft Azure',
        14061 => 'DigitalOcean',
        16276 => 'OVH',
        24940 => 'Hetzner',
        20940 => 'Akamai/Linode',
        63949 => 'Linode',
        20473 => 'Vultr / Choopa',
        31898 => 'Oracle Cloud',
        45102 => 'Alibaba Cloud',
        37963 => 'Alibaba Cloud',
        9009 => 'M247 (common VPN host)',
        60068 => 'Datacamp Limited (known VPN/proxy host)',
        212238 => 'Datacamp Limited',
        202422 => 'G-Core Labs (common VPN host)',
        396356 => 'Latitude.sh',
        20738 => 'Psychz Networks (common VPN host)',
        53667 => 'FranTech/BuyVM (common VPN host)',
        174 => 'Cogent (mixed hosting)',
    ],

    /*
    |--------------------------------------------------------------------------
    | Enforcement exclusions
    |--------------------------------------------------------------------------
    | Path patterns (Request::is() syntax) that EnforceGeoAccess always
    | allows through untouched. Admin auth/dashboard stays reachable from
    | anywhere; /api/geo/check gates itself via the shared secret instead.
    */
    'excluded_path_patterns' => [
        'api/admin/*',
        'api/auth/*',
        'api/geo/check',
        'up',
    ],

    'default_blocked_message' => 'Domestic Real Estate is currently available only to users located in the United States and Canada. If you believe this is an error, please contact support.',
];
