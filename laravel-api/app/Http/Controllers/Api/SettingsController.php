<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
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
        $defaults = [
            'email_notifications' => true,
            'sms_notifications' => false,
            'lead_notifications' => true,
            'campaign_notifications' => true,
            'system_notifications' => true,
        ];
        return ApiResponse::ok($this->getGroup('notifications', $defaults));
    }

    public function updateNotificationSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email_notifications' => 'nullable|boolean',
            'sms_notifications' => 'nullable|boolean',
            'lead_notifications' => 'nullable|boolean',
            'campaign_notifications' => 'nullable|boolean',
            'system_notifications' => 'nullable|boolean',
        ]);
        $defaults = [
            'email_notifications' => true,
            'sms_notifications' => false,
            'lead_notifications' => true,
            'campaign_notifications' => true,
            'system_notifications' => true,
        ];
        $saved = $this->saveGroup('notifications', $validated, $defaults);
        return ApiResponse::ok($saved, 'Notification settings updated');
    }
}
