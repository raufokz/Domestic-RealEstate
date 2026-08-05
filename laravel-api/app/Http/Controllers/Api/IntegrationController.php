<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Models\IntegrationTestLog;
use App\Services\IntegrationGate;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class IntegrationController extends Controller
{
    public function index(): JsonResponse
    {
        $integrations = Integration::orderBy('category')->orderBy('name')->get();
        return response()->json($integrations);
    }

    public function show(string $key): JsonResponse
    {
        $integration = Integration::where('integration_key', $key)->firstOrFail();
        return response()->json($integration);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        $integration = Integration::where('integration_key', $key)->firstOrFail();
        $validated = $request->validate([
            'credentials' => 'nullable|array',
            'status' => 'nullable|string|in:not_configured,connected,error,disconnected',
        ]);

        $integration->update($validated);
        return response()->json($integration);
    }

    public function test(Request $request, string $key): JsonResponse
    {
        $integration = Integration::where('integration_key', $key)->firstOrFail();
        $started = microtime(true);

        try {
            $result = $this->runRealTest($integration);
            $ms = (int) ((microtime(true) - $started) * 1000);

            IntegrationTestLog::create([
                'integration_id' => $integration->id,
                'tested_by' => $request->user()->id,
                'result' => $result['ok'] ? 'success' : 'error',
                'response_summary' => $result['message'].' ('.$ms.'ms)',
            ]);

            $integration->update([
                'last_tested_at' => now(),
                'last_test_result' => $result['ok'] ? 'success' : 'error',
                'last_error_message' => $result['ok'] ? null : $result['message'],
                'status' => $result['ok'] ? 'connected' : 'error',
            ]);

            if ($result['ok']) {
                return response()->json([
                    'success' => true,
                    'status' => 'success',
                    'message' => $result['message'],
                    'response_time_ms' => $ms,
                ]);
            }

            return response()->json([
                'success' => false,
                'status' => 'error',
                'code' => 'integration_test_failed',
                'feature' => $integration->name,
                'message' => "{$integration->name} is not working because {$result['reason']}.",
                'reason' => $result['reason'],
                'fix' => $result['fix'],
                'action_url' => '/admin/integrations',
                'action_label' => 'Fix integration',
                'response_time_ms' => $ms,
            ], 422);
        } catch (\Throwable $e) {
            $msg = $e->getMessage();
            IntegrationTestLog::create([
                'integration_id' => $integration->id,
                'tested_by' => $request->user()->id,
                'result' => 'error',
                'response_summary' => $msg,
            ]);
            $integration->update([
                'last_tested_at' => now(),
                'last_test_result' => 'error',
                'last_error_message' => $msg,
                'status' => 'error',
            ]);

            return response()->json([
                'success' => false,
                'status' => 'error',
                'code' => 'integration_test_failed',
                'feature' => $integration->name,
                'message' => "{$integration->name} is not working because the connection test failed.",
                'reason' => $msg,
                'fix' => 'Double-check API keys/credentials, then try Test again.',
                'action_url' => '/admin/integrations',
            ], 422);
        }
    }

    /**
     * @return array{ok:bool,message:string,reason:string,fix:string}
     */
    protected function runRealTest(Integration $integration): array
    {
        $creds = $integration->credentials ?? [];

        return match ($integration->integration_key) {
            'smtp' => $this->testSmtp($creds),
            'sendgrid' => $this->testSendgrid($creds),
            'google_gemini' => $this->testGemini($creds),
            'openai' => $this->testOpenAi($creds),
            'anthropic' => $this->testAnthropic($creds),
            'google_maps' => $this->testGoogleMaps($creds),
            'cloudinary' => $this->testCloudinary($creds),
            default => $this->testGenericConnected($integration, $creds),
        };
    }

    protected function testSmtp(array $creds): array
    {
        $host = $creds['host'] ?? config('mail.mailers.smtp.host') ?: env('MAIL_HOST');
        $port = (int) ($creds['port'] ?? config('mail.mailers.smtp.port') ?: env('MAIL_PORT', 587));
        $username = $creds['username'] ?? config('mail.mailers.smtp.username') ?: env('MAIL_USERNAME');
        $password = $creds['password'] ?? config('mail.mailers.smtp.password') ?: env('MAIL_PASSWORD');

        if (! $host || ! $username || ! $password) {
            return [
                'ok' => false,
                'message' => 'SMTP credentials missing',
                'reason' => 'SMTP host, username, or password is not saved',
                'fix' => 'Open Admin → Email Settings, enter Namecheap SMTP (mail.privateemail.com), save, then test again.',
            ];
        }

        $errno = 0;
        $errstr = '';
        $fp = @fsockopen($host, $port, $errno, $errstr, 8);
        if (! $fp) {
            return [
                'ok' => false,
                'message' => "Cannot reach SMTP host {$host}:{$port}",
                'reason' => "the mail server did not respond ({$errstr})",
                'fix' => 'Confirm host/port (usually mail.privateemail.com port 587) and that your firewall allows outbound SMTP.',
            ];
        }
        fclose($fp);

        return [
            'ok' => true,
            'message' => "SMTP reachable at {$host}:{$port}",
            'reason' => '',
            'fix' => '',
        ];
    }

    protected function testSendgrid(array $creds): array
    {
        $key = $creds['api_key'] ?? null;
        if (! $key) {
            return [
                'ok' => false,
                'message' => 'SendGrid API key missing',
                'reason' => 'no SendGrid API key is saved',
                'fix' => 'Paste your SendGrid API key, Connect, then Test.',
            ];
        }

        $res = Http::withToken($key)->timeout(15)->get('https://api.sendgrid.com/v3/user/account');
        if (! $res->successful()) {
            return [
                'ok' => false,
                'message' => 'SendGrid rejected the API key',
                'reason' => 'the SendGrid API key is invalid or missing permissions',
                'fix' => 'Create a new API key in SendGrid with Mail Send permission and reconnect.',
            ];
        }

        return ['ok' => true, 'message' => 'SendGrid connected', 'reason' => '', 'fix' => ''];
    }

    protected function testGemini(array $creds): array
    {
        $key = $creds['api_key'] ?? $creds['key'] ?? IntegrationGate::credentialOrEnv('google_gemini', 'api_key', ['GEMINI_API_KEY']);
        if (! $key) {
            return [
                'ok' => false,
                'message' => 'Gemini API key missing',
                'reason' => 'no Gemini API key is saved in Integrations or .env',
                'fix' => 'Get a free key at ai.google.dev, paste it here, Connect, then Test.',
            ];
        }

        $res = Http::timeout(20)->post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$key}",
            ['contents' => [['parts' => [['text' => 'Reply with the single word: ok']]]]]
        );

        if (! $res->successful()) {
            return [
                'ok' => false,
                'message' => 'Gemini API test failed',
                'reason' => 'Gemini rejected the key or the free quota may be exhausted',
                'fix' => 'Verify the key at Google AI Studio and try again.',
            ];
        }

        return ['ok' => true, 'message' => 'Google Gemini responded successfully', 'reason' => '', 'fix' => ''];
    }

    protected function testOpenAi(array $creds): array
    {
        $key = $creds['api_key'] ?? $creds['key'] ?? IntegrationGate::credentialOrEnv('openai', 'api_key', ['OPENAI_API_KEY']);
        if (! $key) {
            return [
                'ok' => false,
                'message' => 'OpenAI API key missing',
                'reason' => 'no OpenAI API key is saved',
                'fix' => 'Add an OpenAI API key, Connect, then Test.',
            ];
        }

        $res = Http::withToken($key)->timeout(20)->get('https://api.openai.com/v1/models');
        if (! $res->successful()) {
            return [
                'ok' => false,
                'message' => 'OpenAI API test failed',
                'reason' => 'OpenAI rejected the API key',
                'fix' => 'Create a new key at platform.openai.com and reconnect.',
            ];
        }

        return ['ok' => true, 'message' => 'OpenAI connected', 'reason' => '', 'fix' => ''];
    }

    protected function testAnthropic(array $creds): array
    {
        $key = $creds['api_key'] ?? $creds['key'] ?? IntegrationGate::credentialOrEnv('anthropic', 'api_key', ['ANTHROPIC_API_KEY']);
        if (! $key) {
            return [
                'ok' => false,
                'message' => 'Anthropic API key missing',
                'reason' => 'no Claude API key is saved',
                'fix' => 'Add an Anthropic API key, Connect, then Test.',
            ];
        }

        // Cheapest possible real call to confirm the key works — 1 max token.
        $res = Http::withHeaders([
            'x-api-key' => $key,
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json',
        ])->timeout(20)->post('https://api.anthropic.com/v1/messages', [
            'model' => 'claude-3-5-haiku-latest',
            'max_tokens' => 1,
            'messages' => [['role' => 'user', 'content' => 'hi']],
        ]);

        if (! $res->successful()) {
            return [
                'ok' => false,
                'message' => 'Anthropic API test failed',
                'reason' => 'Claude rejected the API key',
                'fix' => 'Create a new key at console.anthropic.com and reconnect.',
            ];
        }

        return ['ok' => true, 'message' => 'Claude connected', 'reason' => '', 'fix' => ''];
    }

    protected function testGoogleMaps(array $creds): array
    {
        $key = $creds['api_key'] ?? $creds['key'] ?? env('GOOGLE_MAPS_API_KEY');
        if (! $key) {
            return [
                'ok' => false,
                'message' => 'Google Maps key missing',
                'reason' => 'no Google Maps API key is saved',
                'fix' => 'Add a Maps key, or rely on free OpenStreetMap (Leaflet) as fallback on the site.',
            ];
        }

        $res = Http::timeout(15)->get('https://maps.googleapis.com/maps/api/geocode/json', [
            'address' => 'New York, NY',
            'key' => $key,
        ]);

        $status = $res->json('status');
        if ($status !== 'OK' && $status !== 'ZERO_RESULTS') {
            return [
                'ok' => false,
                'message' => 'Google Maps test failed',
                'reason' => 'Google Maps returned status: '.($status ?: 'unknown'),
                'fix' => 'Enable Geocoding API for this key in Google Cloud Console.',
            ];
        }

        return ['ok' => true, 'message' => 'Google Maps geocoding OK', 'reason' => '', 'fix' => ''];
    }

    protected function testCloudinary(array $creds): array
    {
        $cloud = $creds['cloud_name'] ?? null;
        $apiKey = $creds['api_key'] ?? null;
        if (! $cloud || ! $apiKey) {
            return [
                'ok' => false,
                'message' => 'Cloudinary credentials missing',
                'reason' => 'cloud name or API key is not saved',
                'fix' => 'Add Cloudinary cloud_name + api_key, or use local storage fallback.',
            ];
        }

        return ['ok' => true, 'message' => 'Cloudinary credentials present', 'reason' => '', 'fix' => ''];
    }

    protected function testGenericConnected(Integration $integration, array $creds): array
    {
        if ($integration->status === 'connected' || ! empty($creds)) {
            return [
                'ok' => true,
                'message' => "{$integration->name} credentials saved. Full live probe is not available for this provider yet — configure and use in product flows.",
                'reason' => '',
                'fix' => '',
            ];
        }

        return [
            'ok' => false,
            'message' => "{$integration->name} not configured",
            'reason' => 'no credentials have been connected yet',
            'fix' => 'Click Connect, save credentials/OAuth, then Test again.',
        ];
    }

    public function connect(Request $request, string $key): JsonResponse
    {
        $integration = Integration::where('integration_key', $key)->firstOrFail();
        $validated = $request->validate(['credentials' => 'required|array']);
        $integration->update([
            'credentials' => $validated['credentials'],
            'status' => 'connected',
            'last_error_message' => null,
        ]);
        return response()->json([
            'success' => true,
            'status' => 'connected',
            'message' => "{$integration->name} connected successfully. Click Test to verify it works.",
        ]);
    }

    public function disconnect(Request $request, string $key): JsonResponse
    {
        $integration = Integration::where('integration_key', $key)->firstOrFail();
        $integration->update([
            'status' => 'disconnected',
            'credentials' => null,
            'last_error_message' => null,
        ]);
        return response()->json([
            'success' => true,
            'status' => 'disconnected',
            'message' => "{$integration->name} disconnected. Saved keys were removed.",
        ]);
    }

    public function logs(Request $request, string $key): JsonResponse
    {
        $integration = Integration::where('integration_key', $key)->firstOrFail();
        $logs = IntegrationTestLog::where('integration_id', $integration->id)
            ->with('tester:id,name,email')
            ->latest()
            ->paginate(20);
        return response()->json($logs);
    }

    public function seed(): JsonResponse
    {
        $integrations = [
            ['integration_key' => 'facebook', 'name' => 'Facebook', 'category' => 'social', 'docs_url' => 'https://developers.facebook.com'],
            ['integration_key' => 'instagram', 'name' => 'Instagram Business', 'category' => 'social', 'docs_url' => 'https://developers.facebook.com'],
            ['integration_key' => 'linkedin', 'name' => 'LinkedIn', 'category' => 'social', 'docs_url' => 'https://developer.linkedin.com'],
            ['integration_key' => 'x', 'name' => 'X (Twitter)', 'category' => 'social', 'docs_url' => 'https://developer.twitter.com'],
            ['integration_key' => 'tiktok', 'name' => 'TikTok', 'category' => 'social', 'docs_url' => 'https://developers.tiktok.com'],
            ['integration_key' => 'youtube', 'name' => 'YouTube', 'category' => 'social', 'docs_url' => 'https://developers.google.com/youtube'],
            ['integration_key' => 'pinterest', 'name' => 'Pinterest', 'category' => 'social', 'docs_url' => 'https://developers.pinterest.com'],
            ['integration_key' => 'google_business', 'name' => 'Google Business Profile', 'category' => 'social', 'docs_url' => 'https://developers.google.com/my-business'],
            ['integration_key' => 'smtp', 'name' => 'SMTP (domesticrealestate.us)', 'category' => 'email'],
            ['integration_key' => 'sendgrid', 'name' => 'SendGrid', 'category' => 'email', 'docs_url' => 'https://docs.sendgrid.com'],
            ['integration_key' => 'google_gemini', 'name' => 'Google Gemini', 'category' => 'ai', 'is_free_tier' => true, 'docs_url' => 'https://ai.google.dev'],
            ['integration_key' => 'openai', 'name' => 'OpenAI', 'category' => 'ai', 'docs_url' => 'https://platform.openai.com'],
            ['integration_key' => 'anthropic', 'name' => 'Anthropic Claude', 'category' => 'ai', 'docs_url' => 'https://console.anthropic.com'],
            ['integration_key' => 'google_maps', 'name' => 'Google Maps', 'category' => 'maps', 'docs_url' => 'https://developers.google.com/maps'],
            ['integration_key' => 'google_calendar', 'name' => 'Google Calendar', 'category' => 'calendar', 'docs_url' => 'https://developers.google.com/calendar'],
            ['integration_key' => 'calendly', 'name' => 'Calendly', 'category' => 'calendar', 'docs_url' => 'https://developer.calendly.com'],
            ['integration_key' => 'cloudinary', 'name' => 'Cloudinary', 'category' => 'storage', 'docs_url' => 'https://cloudinary.com/documentation'],
            ['integration_key' => 'aws_s3', 'name' => 'AWS S3', 'category' => 'storage', 'docs_url' => 'https://docs.aws.amazon.com/s3'],
            ['integration_key' => 'google_analytics', 'name' => 'Google Analytics 4', 'category' => 'analytics', 'docs_url' => 'https://developers.google.com/analytics'],
            ['integration_key' => 'google_search_console', 'name' => 'Google Search Console', 'category' => 'analytics', 'docs_url' => 'https://developers.google.com/search'],
            ['integration_key' => 'microsoft_clarity', 'name' => 'Microsoft Clarity', 'category' => 'analytics', 'docs_url' => 'https://clarity.microsoft.com'],
            ['integration_key' => 'meta_pixel', 'name' => 'Meta Pixel', 'category' => 'analytics', 'docs_url' => 'https://developers.facebook.com'],
            ['integration_key' => 'docusign', 'name' => 'DocuSign', 'category' => 'esign', 'docs_url' => 'https://developers.docusign.com'],
            ['integration_key' => 'zapier', 'name' => 'Zapier', 'category' => 'automation', 'docs_url' => 'https://zapier.com/developer'],
            ['integration_key' => 'payoneer', 'name' => 'Payoneer', 'category' => 'payments', 'is_free_tier' => true],
        ];

        foreach ($integrations as $data) {
            Integration::updateOrCreate(['integration_key' => $data['integration_key']], $data);
        }

        return ApiResponse::ok(['count' => count($integrations)], 'Integrations seeded');
    }
}
