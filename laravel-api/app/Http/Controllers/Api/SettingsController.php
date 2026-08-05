<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiUsageLog;
use App\Models\SiteSetting;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    private function checkAdmin(): void
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['admin', 'super_admin'], true)) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    private function getGroup(string $group, array $defaults): array
    {
        $rows = SiteSetting::where('group_name', $group)->get();
        $result = $defaults;
        foreach ($rows as $row) {
            $val = $row->value;
            if ($val === 'true') {
                $typedVal = true;
            } elseif ($val === 'false') {
                $typedVal = false;
            } elseif (is_numeric($val)) {
                $typedVal = $val + 0;
            } else {
                $typedVal = $val;
            }
            $result[$row->key_name] = $typedVal;
        }
        return $result;
    }

    private function saveGroup(string $group, array $data, array $defaults): array
    {
        foreach ($data as $key => $val) {
            SiteSetting::set($key, $val, $group);
        }
        return $this->getGroup($group, $defaults);
    }

    public function getSeoSettings(): JsonResponse
    {
        $defaults = [
            'meta_title' => 'Domestic Real Estate — Your Key to Home',
            'meta_description' => 'Find off-market properties, motivated sellers, and top-tier agents across the US and Canada.',
            'og_image' => '',
            'google_analytics_id' => '',
            'sitemap_enabled' => true,
            'robots_txt' => "User-agent: *\nAllow: /",
        ];
        return ApiResponse::ok($this->getGroup('seo', $defaults));
    }

    public function updateSeoSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'og_image' => 'nullable|string',
            'google_analytics_id' => 'nullable|string',
            'sitemap_enabled' => 'nullable|boolean',
            'robots_txt' => 'nullable|string',
        ]);
        $defaults = [
            'meta_title' => '',
            'meta_description' => '',
            'og_image' => '',
            'google_analytics_id' => '',
            'sitemap_enabled' => true,
            'robots_txt' => "User-agent: *\nAllow: /",
        ];
        $saved = $this->saveGroup('seo', $validated, $defaults);
        return ApiResponse::ok($saved, 'SEO settings updated');
    }

    public function getAppearanceSettings(): JsonResponse
    {
        $defaults = [
            'primary_color' => '#0A2647',
            'secondary_color' => '#C9A227',
            'accent_color' => '#8B1E3F',
            'font_heading' => 'Poppins',
            'font_body' => 'Inter',
            'logo_url' => null,
            'favicon_url' => null,
        ];
        return ApiResponse::ok($this->getGroup('appearance', $defaults));
    }

    public function updateAppearanceSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'primary_color' => 'nullable|string',
            'secondary_color' => 'nullable|string',
            'accent_color' => 'nullable|string',
            'font_heading' => 'nullable|string',
            'font_body' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'favicon_url' => 'nullable|string',
        ]);
        $defaults = [
            'primary_color' => '#0A2647',
            'secondary_color' => '#C9A227',
            'accent_color' => '#8B1E3F',
            'font_heading' => 'Poppins',
            'font_body' => 'Inter',
            'logo_url' => null,
            'favicon_url' => null,
        ];
        $saved = $this->saveGroup('appearance', $validated, $defaults);
        return ApiResponse::ok($saved, 'Appearance settings updated');
    }

    public function getSecuritySettings(): JsonResponse
    {
        $defaults = [
            'two_factor_enabled' => false,
            'session_timeout' => 120,
            'max_login_attempts' => 5,
            'password_min_length' => 8,
            'require_password_change' => false,
        ];
        return ApiResponse::ok($this->getGroup('security', $defaults));
    }

    public function updateSecuritySettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'two_factor_enabled' => 'nullable|boolean',
            'session_timeout' => 'nullable|integer',
            'max_login_attempts' => 'nullable|integer',
            'password_min_length' => 'nullable|integer',
            'require_password_change' => 'nullable|boolean',
        ]);
        $defaults = [
            'two_factor_enabled' => false,
            'session_timeout' => 120,
            'max_login_attempts' => 5,
            'password_min_length' => 8,
            'require_password_change' => false,
        ];
        $saved = $this->saveGroup('security', $validated, $defaults);
        return ApiResponse::ok($saved, 'Security settings updated');
    }

    public function getNotificationSettings(): JsonResponse
    {
        $this->checkAdmin();

        $defaults = [
            'email_enabled' => true,
            'sms_enabled' => false,
            'push_enabled' => true,
            'new_lead' => true,
            'new_enquiry' => true,
            'property_inquiry' => true,
            'offer_received' => true,
            'payment_received' => true,
            'contract_signed' => true,
        ];
        return ApiResponse::ok($this->getGroup('notifications', $defaults));
    }

    public function updateNotificationSettings(Request $request): JsonResponse
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'email_enabled' => 'nullable|boolean',
            'sms_enabled' => 'nullable|boolean',
            'push_enabled' => 'nullable|boolean',
            'new_lead' => 'nullable|boolean',
            'new_enquiry' => 'nullable|boolean',
            'property_inquiry' => 'nullable|boolean',
            'offer_received' => 'nullable|boolean',
            'payment_received' => 'nullable|boolean',
            'contract_signed' => 'nullable|boolean',
        ]);

        $unknown = array_diff(array_keys($request->all()), array_keys($validated));
        if ($unknown !== []) {
            return ApiResponse::fail(
                'Unknown notification settings: ' . implode(', ', $unknown) . '.',
                'unknown_setting',
                422
            );
        }

        $defaults = [
            'email_enabled' => true,
            'sms_enabled' => false,
            'push_enabled' => true,
            'new_lead' => true,
            'new_enquiry' => true,
            'property_inquiry' => true,
            'offer_received' => true,
            'payment_received' => true,
            'contract_signed' => true,
        ];
        $saved = $this->saveGroup('notifications', $validated, $defaults);
        return ApiResponse::ok($saved, 'Notification settings updated');
    }

    private function geoDefaults(): array
    {
        return [
            'geo_blocking_enabled' => true,
            'mode' => 'blacklist',
            'blocked_countries' => ['PK'],
            'allowed_countries' => [],
            'vpn_detection_enabled' => true,
            'proxy_detection_enabled' => true,
            'tor_blocking_enabled' => true,
            'datacenter_blocking_enabled' => true,
            'custom_blocked_asns' => [],
            'blocked_message' => config('geo.default_blocked_message'),
            'log_retention_days' => 90,
        ];
    }

    public function getGeoSettings(): JsonResponse
    {
        $defaults = $this->geoDefaults();
        $rows = SiteSetting::where('group_name', 'geo_access')->get()->keyBy('key_name');
        $result = $defaults;

        foreach ($defaults as $key => $default) {
            if (!$rows->has($key)) {
                continue;
            }
            $val = $rows[$key]->value;
            if (is_array($default)) {
                $decoded = json_decode((string) $val, true);
                $result[$key] = is_array($decoded) ? $decoded : $default;
            } elseif (is_bool($default)) {
                $result[$key] = $val === 'true';
            } elseif (is_int($default)) {
                $result[$key] = is_numeric($val) ? (int) $val : $default;
            } else {
                $result[$key] = $val;
            }
        }

        return ApiResponse::ok($result);
    }

    public function updateGeoSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'geo_blocking_enabled' => 'nullable|boolean',
            'mode' => 'nullable|in:blacklist,allowlist',
            'blocked_countries' => 'nullable|array',
            'blocked_countries.*' => 'string|size:2',
            'allowed_countries' => 'nullable|array',
            'allowed_countries.*' => 'string|size:2',
            'vpn_detection_enabled' => 'nullable|boolean',
            'proxy_detection_enabled' => 'nullable|boolean',
            'tor_blocking_enabled' => 'nullable|boolean',
            'datacenter_blocking_enabled' => 'nullable|boolean',
            'custom_blocked_asns' => 'nullable|array',
            'custom_blocked_asns.*' => 'integer',
            'blocked_message' => 'nullable|string|max:2000',
            'log_retention_days' => 'nullable|integer|min:1|max:3650',
        ]);

        foreach ($validated as $key => $val) {
            $toStore = is_array($val) ? array_map(fn ($c) => is_string($c) ? strtoupper($c) : $c, $val) : $val;
            SiteSetting::set($key, $toStore, 'geo_access');
        }

        Cache::forget('geo:settings');

        return ApiResponse::ok($this->getGeoSettings()->getData(true)['data'] ?? null, 'Geo access settings updated');
    }

    private function aiDefaults(): array
    {
        return [
            'provider_priority' => ['gemini', 'openai', 'claude'],
            'disabled_providers' => [],
        ];
    }

    public function getAiSettings(): JsonResponse
    {
        $this->checkAdmin();

        $defaults = $this->aiDefaults();
        $rows = SiteSetting::where('group_name', 'ai')->get()->keyBy('key_name');
        $result = $defaults;

        foreach ($defaults as $key => $default) {
            if (! $rows->has($key)) {
                continue;
            }
            $decoded = json_decode((string) $rows[$key]->value, true);
            $result[$key] = is_array($decoded) ? $decoded : $default;
        }

        return ApiResponse::ok($result);
    }

    public function updateAiSettings(Request $request): JsonResponse
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'provider_priority' => 'nullable|array',
            'provider_priority.*' => 'string|in:gemini,openai,claude',
            'disabled_providers' => 'nullable|array',
            'disabled_providers.*' => 'string|in:gemini,openai,claude',
        ]);

        foreach ($validated as $key => $val) {
            SiteSetting::set($key, $val, 'ai');
        }

        return ApiResponse::ok($this->getAiSettings()->getData(true)['data'] ?? null, 'AI settings updated');
    }

    public function getAiUsageAnalytics(Request $request): JsonResponse
    {
        $this->checkAdmin();

        $days = min(max((int) $request->query('days', 30), 1), 365);
        $since = now()->subDays($days)->startOfDay();

        $byProvider = AiUsageLog::where('created_at', '>=', $since)
            ->select('provider')
            ->selectRaw('COUNT(*) as calls')
            ->selectRaw('SUM(COALESCE(input_tokens, 0)) as input_tokens')
            ->selectRaw('SUM(COALESCE(output_tokens, 0)) as output_tokens')
            ->selectRaw('SUM(cost_estimate) as cost')
            ->groupBy('provider')
            ->get();

        $byDay = AiUsageLog::where('created_at', '>=', $since)
            ->selectRaw('DATE(created_at) as date')
            ->selectRaw('COUNT(*) as calls')
            ->selectRaw('SUM(cost_estimate) as cost')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        return ApiResponse::ok([
            'since' => $since->toDateString(),
            'totals' => [
                'calls' => (int) $byProvider->sum('calls'),
                'input_tokens' => (int) $byProvider->sum('input_tokens'),
                'output_tokens' => (int) $byProvider->sum('output_tokens'),
                'cost_estimate' => round((float) $byProvider->sum('cost'), 6),
            ],
            'by_provider' => $byProvider,
            'by_day' => $byDay,
        ]);
    }
}
