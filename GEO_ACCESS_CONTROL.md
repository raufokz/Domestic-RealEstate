# Geo Access Control

Restricts the public website to the United States and Canada, blocks a
configurable list of countries (default: **Pakistan**), and blocks known
Tor exit nodes and datacenter/cloud/commercial-VPN-hosting IPs — while
letting the admin whitelist specific IPs/CIDRs (e.g. a developer's home or
office connection) that bypass all of it.

## Architecture

Laravel (`laravel-api/`) is the single source of truth for policy — the
whitelist, blacklist, settings, and access logs all live in MySQL. Next.js
(`nextjs-frontend/`) never duplicates that policy; it asks Laravel for a
decision and caches the answer in a short-lived cookie.

```
Visitor → Next.js src/proxy.ts (edge — Next.js 16's replacement for middleware.ts)
            │  cookie cached? ──yes──► allow/block instantly
            │  no
            ▼
          POST {LARAVEL}/api/geo/check  (X-Geo-Internal-Secret header)
            │
            ▼
Laravel App\Services\Geo\GeoAccessDecisionService
  1. authenticated admin?              → allow
  2. IP/CIDR whitelisted?              → allow
  3. IP/CIDR blacklisted?              → deny
  4. geo blocking disabled in settings?→ allow
  5. GeoIP lookup unresolvable?        → allow (fail open)
  6. Tor exit node?                    → deny
  7. datacenter/VPN-hosting ASN?       → deny
  8. country in blocked_countries?     → deny
  9. else                              → allow
```

The exact same `GeoAccessDecisionService` also runs as
`App\Http\Middleware\EnforceGeoAccess`, registered globally on Laravel's
`api` middleware group, so **direct API access bypassing the frontend is
blocked too**. It no-ops for `/api/admin/*`, `/api/auth/*`, `/api/geo/check`,
and `/up` — the admin dashboard and login always stay reachable regardless
of geo.

## One-time setup

1. **Shared secret** — generate a strong random value and set it as
   `GEO_INTERNAL_SECRET` in both:
   - `laravel-api/.env`
   - the Next.js project's env (Vercel dashboard → Environment Variables for
     production; `nextjs-frontend/.env.local` for dev). It must be
     **identical** in both places and must **not** be prefixed
     `NEXT_PUBLIC_` (it's read server-side only, inside `src/middleware.ts`).

2. **MaxMind GeoLite2 (enables country-based blocking)** — country blocking
   fails open (allows everyone) until this is configured:
   - Create a free account at https://www.maxmind.com/en/geolite2/signup
   - Generate a license key
   - Set `GEOIP_LICENSE_KEY` in `laravel-api/.env`
   - Run `php artisan geo:refresh-intelligence` once (also runs nightly via
     the scheduler at 03:15)

   Tor exit-node and datacenter-ASN blocking work immediately without any
   key — `geo:refresh-intelligence` downloads the free Tor bulk exit list
   regardless, and the datacenter ASN list ships seeded in `config/geo.php`.

3. **Whitelist your own IP** before relying on this in production —
   `/admin/geo-access/whitelist` in the admin panel, or `POST
   /api/admin/geo-whitelist`. Whitelist entries always win over every other
   check, including if you're browsing from a blocked country.

## Admin module

`/admin/geo-access` (sidebar: **GEO ACCESS CONTROL**):

- **Settings** — master on/off, blocked countries list, Tor/datacenter/VPN/
  proxy detection toggles, blocked-page message, log retention.
- **Whitelist** / **Blacklist** — add/edit/disable/delete IP or CIDR
  entries, with notes, optional expiration, CSV import/export.
- **Access Logs** — every blocked request (IP, country, ASN/ISP, reason,
  URL, user agent, timestamp), filterable and exportable to CSV.

All settings are stored in the `site_settings` table (`group_name =
'geo_access'`) — nothing requires a code change or deploy to update.

## Known tradeoffs (by design, confirmed with the site owner)

- **Deny-list, not allow-list**: only the countries in `blocked_countries`
  (default just `PK`) are blocked; everyone else is allowed. The settings
  schema also supports an `allowlist` mode (allow only specific countries,
  e.g. US/CA) if you want to switch later — no migration needed, just set
  `mode` to `allowlist` and populate `allowed_countries`; note the
  allow-list branch isn't wired into `GeoAccessDecisionService` yet and
  would need a small follow-up change to enforce it.
- **Free VPN/proxy detection only**: `IpReputationService` checks Tor exit
  nodes + known datacenter/cloud/commercial-VPN-hosting ASNs. This catches
  most VPN exit traffic (consumer VPNs overwhelmingly run on datacenter
  IPs) but **will not** reliably catch residential-IP or mobile-proxy VPN
  services. `IpReputationService` is the single seam to swap in a paid
  provider (IPQualityScore, ipinfo.io privacy add-on, MaxMind Precision
  Insights) later without touching `GeoAccessDecisionService` or the
  middleware.
- **Fails open** in two places, intentionally, so a misconfiguration or
  outage never takes the public site down for legitimate visitors:
  - GeoIP lookup returns no data (missing `.mmdb`, unresolvable/reserved
    IP) → allowed.
  - Next.js → Laravel `/geo/check` call errors or times out (2.5s) →
    allowed, logged to the server console.
- **Direct-to-Laravel-API IP resolution** trusts `$request->ip()` as-is —
  correct for this deployment (confirmed no CDN/Cloudflare in front of
  either service). If a CDN/reverse proxy is added later in front of the
  Laravel API, configure Laravel's `trustProxies` accordingly or IP
  resolution will start reading the proxy's IP instead of the visitor's.
