<?php

namespace App\Http\Middleware;

use App\Models\GeoAccessLog;
use App\Services\Geo\GeoAccessDecisionService;
use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;

/**
 * Registered globally on the `api` middleware group (bootstrap/app.php).
 * No-ops for admin/auth/health-check paths (config `geo.excluded_path_patterns`)
 * so the admin dashboard and login always stay reachable regardless of geo,
 * per the Geo Access Control spec's ADMIN ACCESS section. Everything else
 * goes through GeoAccessDecisionService using the request's real IP.
 */
class EnforceGeoAccess
{
    public function __construct(private GeoAccessDecisionService $decision)
    {
    }

    public function handle(Request $request, Closure $next)
    {
        foreach (config('geo.excluded_path_patterns', []) as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        $ip = $request->ip();
        $result = $this->decision->decide($ip, $request->user());

        if ($result['allowed']) {
            return $next($request);
        }

        $this->logBlocked($request, $ip, $result);

        return ApiResponse::fail(
            $result['blocked_message'],
            'geo_blocked',
            403,
            reason: $result['reason'],
        );
    }

    private function logBlocked(Request $request, string $ip, array $result): void
    {
        try {
            GeoAccessLog::create([
                'ip_address' => $ip,
                'country_code' => $result['country_code'],
                'country_name' => $result['country_name'],
                'city' => $result['city'],
                'asn' => $result['asn'],
                'isp' => $result['isp'],
                'is_vpn' => $result['is_datacenter'],
                'is_tor' => $result['is_tor'],
                'is_datacenter' => $result['is_datacenter'],
                'reason' => $result['reason'],
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'user_agent' => substr((string) $request->userAgent(), 0, 1000),
            ]);
        } catch (\Throwable) {
            // Never let logging failures break the block response.
        }
    }
}
