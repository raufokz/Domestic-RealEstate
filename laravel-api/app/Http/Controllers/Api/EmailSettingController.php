<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class EmailSettingController extends Controller
{
    private function checkAdmin(): void
    {
        $user = Auth::user();
        if (!$user || !in_array($user->role, ['admin', 'super_admin'], true)) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $this->checkAdmin();

        $settings = EmailSetting::orderBy('setting_group')->orderBy('setting_key')->get()
            ->pluck('value', 'setting_key');

        return response()->json(['data' => $settings]);
    }

    public function update(Request $request): JsonResponse
    {
        $this->checkAdmin();

        // Accept either { settings: [{setting_key, value}] } (legacy) or the flat
        // { from_name: "...", smtp_host: "..." } map the frontend sends per group.
        if (!is_array($request->input('settings'))) {
            $flat = [];
            foreach ($request->except(['_method', 'settings']) as $key => $value) {
                if (is_array($value)) {
                    continue;
                }
                $flat[] = ['setting_key' => $key, 'value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value];
            }
            $request->merge(['settings' => $flat]);
        }

        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.setting_key' => 'required|string',
            'settings.*.value' => 'nullable|string',
        ]);

        foreach ($validated['settings'] as $setting) {
            $key = $setting['setting_key'] === 'daily_limit' ? 'campaign_daily_limit' : $setting['setting_key'];
            if (!EmailSetting::where('setting_key', $key)->exists()) {
                return response()->json([
                    'success' => false,
                    'code' => 'unknown_setting',
                    'message' => "Unknown email setting: {$key}",
                    'reason' => 'that setting key does not exist in email_settings',
                    'fix' => 'Only send keys returned by GET /admin/email-settings.',
                ], 422);
            }
            EmailSetting::where('setting_key', $key)->update(['value' => $setting['value'] ?? '']);
        }

        return response()->json(['message' => 'Settings updated']);
    }

    public function getGroup(string $group): JsonResponse
    {
        $this->checkAdmin();

        $settings = EmailSetting::byGroup($group)->orderBy('setting_key')->get();
        return response()->json($settings);
    }

    public function testEmail(Request $request): JsonResponse
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'to' => 'required_without:email|email',
            'email' => 'required_without:to|email',
        ]);

        $smtpHost = EmailSetting::where('setting_key', 'smtp_host')->value('value');

        if (empty($smtpHost)) {
            return response()->json(['message' => 'SMTP not configured. Test email skipped.', 'sent' => false]);
        }

        try {
            Mail::raw('This is a test email from Domestic Real Estate.', function ($message) use ($validated) {
                $fromName = EmailSetting::where('setting_key', 'from_name')->value('value') ?? 'Domestic Real Estate';
                $fromEmail = EmailSetting::where('setting_key', 'from_email')->value('value') ?? 'noreply@domesticrealestate.us';
                $message->to($validated['to'] ?? $validated['email'])
                    ->from($fromEmail, $fromName)
                    ->subject('Test Email - Domestic Real Estate');
            });

            return response()->json(['message' => 'Test email sent', 'sent' => true]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send: ' . $e->getMessage(), 'sent' => false], 500);
        }
    }
}
