<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cloudflare Turnstile server-side verification (free tier, unlimited).
 * Silently passes when TURNSTILE_SECRET_KEY isn't configured yet, so forms
 * keep working during rollout — but any request that DOES include a token
 * gets it genuinely checked, and a configured secret always enforces.
 */
class TurnstileVerifier
{
    public static function isConfigured(): bool
    {
        return filled(config('services.turnstile.secret_key'));
    }

    /**
     * @return array{passed: bool, reason: ?string}
     */
    public static function verify(?string $token, ?string $ip = null): array
    {
        if (!self::isConfigured()) {
            return ['passed' => true, 'reason' => null];
        }

        if (empty($token)) {
            return ['passed' => false, 'reason' => 'missing_token'];
        }

        try {
            $response = Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret' => config('services.turnstile.secret_key'),
                'response' => $token,
                'remoteip' => $ip,
            ]);

            $body = $response->json();

            if ($body['success'] ?? false) {
                return ['passed' => true, 'reason' => null];
            }

            return ['passed' => false, 'reason' => implode(',', $body['error-codes'] ?? ['verification_failed'])];
        } catch (\Throwable $e) {
            Log::warning('Turnstile verification request failed', ['error' => $e->getMessage()]);
            // Fail open on our own network/outage errors, not on the visitor's
            // behalf — a Cloudflare/network blip must never block real leads.
            return ['passed' => true, 'reason' => null];
        }
    }
}
