<?php

namespace App\Services;

use App\Exceptions\FeatureUnavailableException;
use App\Models\Integration;
use Illuminate\Support\Facades\Schema;

class IntegrationGate
{
    /** Human labels for features used in toast messages */
    public const FEATURES = [
        'ai' => 'AI tools',
        'email' => 'Email sending',
        'sms' => 'SMS messaging',
        'maps' => 'Maps',
        'social' => 'Social media posting',
        'storage' => 'Image storage',
        'payments' => 'Invoices & Payoneer',
    ];

    public static function requireAi(string $featureLabel = 'AI tools'): void
    {
        $gemini = self::credentialOrEnv('google_gemini', 'api_key', ['GEMINI_API_KEY', 'GOOGLE_GEMINI_API_KEY']);
        $openai = self::credentialOrEnv('openai', 'api_key', ['OPENAI_API_KEY']);
        $claude = self::credentialOrEnv('anthropic', 'api_key', ['ANTHROPIC_API_KEY']);

        if ($gemini || $openai || $claude) {
            return;
        }

        throw new FeatureUnavailableException(
            feature: $featureLabel,
            reason: 'no AI provider is connected',
            fix: 'Go to Admin → Integrations and connect Google Gemini (free), OpenAI, or Claude, then click Test.',
            actionUrl: '/admin/integrations',
            codeKey: 'ai_not_connected',
        );
    }

    public static function requireEmail(string $featureLabel = 'Email sending'): void
    {
        $host = config('mail.mailers.smtp.host') ?: env('MAIL_HOST');
        $username = config('mail.mailers.smtp.username') ?: env('MAIL_USERNAME');
        $password = config('mail.mailers.smtp.password') ?: env('MAIL_PASSWORD');

        $smtpIntegration = self::getIntegration('smtp');
        $sendgrid = self::getIntegration('sendgrid');

        $hasSmtp = filled($host) && filled($username) && filled($password);
        $hasIntegrationSmtp = $smtpIntegration
            && $smtpIntegration->status === 'connected'
            && ! empty(data_get($smtpIntegration->credentials, 'host'));
        $hasSendgrid = $sendgrid
            && $sendgrid->status === 'connected'
            && ! empty(data_get($sendgrid->credentials, 'api_key'));

        if ($hasSmtp || $hasIntegrationSmtp || $hasSendgrid) {
            return;
        }

        throw new FeatureUnavailableException(
            feature: $featureLabel,
            reason: 'email (SMTP) is not set up yet',
            fix: 'Go to Admin → Email Settings and add your Namecheap SMTP details (mail.privateemail.com), then send a test email.',
            actionUrl: '/admin/email-settings',
            codeKey: 'smtp_not_connected',
        );
    }

    public static function requireMaps(string $featureLabel = 'Maps'): void
    {
        $key = self::credentialOrEnv('google_maps', 'api_key', ['GOOGLE_MAPS_API_KEY', 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY']);
        if ($key) {
            return;
        }

        // OpenStreetMap / Leaflet works without a key — soft warning only for Google features
        throw new FeatureUnavailableException(
            feature: $featureLabel,
            reason: 'Google Maps is not connected',
            fix: 'Maps will use the free OpenStreetMap fallback. To enable Google Places autocomplete, connect Google Maps in Admin → Integrations.',
            actionUrl: '/admin/integrations',
            codeKey: 'maps_not_connected',
            httpStatus: 503,
        );
    }

    public static function softAiAvailable(): bool
    {
        try {
            self::requireAi();
            return true;
        } catch (FeatureUnavailableException) {
            return false;
        }
    }

    public static function softEmailAvailable(): bool
    {
        try {
            self::requireEmail();
            return true;
        } catch (FeatureUnavailableException) {
            return false;
        }
    }

    public static function getIntegration(string $key): ?Integration
    {
        if (! Schema::hasTable('integrations')) {
            return null;
        }

        try {
            return Integration::where('key', $key)->first();
        } catch (\Throwable) {
            return null;
        }
    }

    public static function isPlaceholder(?string $value): bool
    {
        if (blank($value)) {
            return true;
        }
        $val = strtolower(trim($value));
        return str_starts_with($val, 'your_') || $val === 'placeholder' || $val === 'null' || $val === 'none' || $val === 'your-api-key';
    }

    /**
     * @param  array<int, string>  $envKeys
     */
    public static function credentialOrEnv(string $integrationKey, string $credentialField, array $envKeys = []): ?string
    {
        foreach ($envKeys as $env) {
            $val = env($env) ?: config('services.'.str_replace('_', '.', $integrationKey).'.key');
            if (filled($val) && !self::isPlaceholder($val)) {
                return $val;
            }
        }

        // Common services config paths
        if ($integrationKey === 'google_gemini') {
            $val = config('services.gemini.key') ?: env('GEMINI_API_KEY');
            if (filled($val) && !self::isPlaceholder($val)) {
                return $val;
            }
        }
        if ($integrationKey === 'openai') {
            $val = config('services.openai.key') ?: env('OPENAI_API_KEY');
            if (filled($val) && !self::isPlaceholder($val)) {
                return $val;
            }
        }

        $integration = self::getIntegration($integrationKey);
        if ($integration && in_array($integration->status, ['connected', 'warning'], true)) {
            $fromCreds = data_get($integration->credentials, $credentialField)
                ?: data_get($integration->credentials, 'key')
                ?: data_get($integration->credentials, 'api_key');
            if (filled($fromCreds) && !self::isPlaceholder($fromCreds)) {
                return $fromCreds;
            }
        }

        return null;
    }

    public static function markError(string $key, string $message): void
    {
        $integration = self::getIntegration($key);
        if (! $integration) {
            return;
        }

        $integration->update([
            'status' => 'error',
            'last_error_message' => $message,
            'last_tested_at' => now(),
            'last_test_result' => 'error',
        ]);
    }

    public static function markConnected(string $key): void
    {
        $integration = self::getIntegration($key);
        if (! $integration) {
            return;
        }

        $integration->update([
            'status' => 'connected',
            'last_error_message' => null,
            'last_tested_at' => now(),
            'last_test_result' => 'success',
        ]);
    }
}
