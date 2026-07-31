<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmailSettingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $settings = EmailSetting::orderBy('setting_group')->orderBy('setting_key')->get()->groupBy('setting_group');
        return response()->json($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.setting_key' => 'required|string|exists:email_settings,setting_key',
            'settings.*.value' => 'nullable|string',
        ]);

        foreach ($validated['settings'] as $setting) {
            EmailSetting::where('setting_key', $setting['setting_key'])->update(['value' => $setting['value']]);
        }

        return response()->json(['message' => 'Settings updated']);
    }

    public function getGroup(string $group): JsonResponse
    {
        $settings = EmailSetting::byGroup($group)->orderBy('setting_key')->get();
        return response()->json($settings);
    }

    public function testEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'to' => 'required|email',
        ]);

        $smtpHost = EmailSetting::where('setting_key', 'smtp_host')->value('value');

        if (empty($smtpHost)) {
            return response()->json(['message' => 'SMTP not configured. Test email skipped.', 'sent' => false]);
        }

        try {
            Mail::raw('This is a test email from Domestic Real Estate.', function ($message) use ($validated) {
                $fromName = EmailSetting::where('setting_key', 'from_name')->value('value') ?? 'Domestic Real Estate';
                $fromEmail = EmailSetting::where('setting_key', 'from_email')->value('value') ?? 'noreply@domesticrealestate.us';
                $message->to($validated['to'])
                    ->from($fromEmail, $fromName)
                    ->subject('Test Email - Domestic Real Estate');
            });

            return response()->json(['message' => 'Test email sent', 'sent' => true]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send: ' . $e->getMessage(), 'sent' => false], 500);
        }
    }
}
