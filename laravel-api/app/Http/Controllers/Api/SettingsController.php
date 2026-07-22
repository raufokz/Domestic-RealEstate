<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function getSeoSettings(): JsonResponse {
        return response()->json(['meta_title' => '', 'meta_description' => '', 'og_image' => '', 'google_analytics_id' => '', 'sitemap_enabled' => true, 'robots_txt' => 'User-agent: *\nAllow: /']);
    }

    public function updateSeoSettings(Request $request): JsonResponse {
        return response()->json(['message' => 'SEO settings updated', 'data' => $request->all()]);
    }

    public function getAppearanceSettings(): JsonResponse {
        return response()->json(['primary_color' => '#0A2647', 'secondary_color' => '#C9A227', 'accent_color' => '#8B1E3F', 'font_heading' => 'Poppins', 'font_body' => 'Inter', 'logo_url' => null, 'favicon_url' => null]);
    }

    public function updateAppearanceSettings(Request $request): JsonResponse {
        return response()->json(['message' => 'Appearance settings updated', 'data' => $request->all()]);
    }

    public function getSecuritySettings(): JsonResponse {
        return response()->json(['two_factor_enabled' => false, 'session_timeout' => 120, 'max_login_attempts' => 5, 'password_min_length' => 8, 'require_password_change' => false]);
    }

    public function updateSecuritySettings(Request $request): JsonResponse {
        return response()->json(['message' => 'Security settings updated', 'data' => $request->all()]);
    }

    public function getNotificationSettings(): JsonResponse {
        return response()->json(['email_notifications' => true, 'sms_notifications' => false, 'lead_notifications' => true, 'campaign_notifications' => true, 'system_notifications' => true]);
    }

    public function updateNotificationSettings(Request $request): JsonResponse {
        return response()->json(['message' => 'Notification settings updated', 'data' => $request->all()]);
    }
}
