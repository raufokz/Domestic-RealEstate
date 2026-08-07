<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailHistory;
use App\Models\SentEmail;
use App\Services\IntegrationGate;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailWebhookController extends Controller
{
    /**
     * Generic, provider-agnostic bounce/complaint endpoint. A real ESP
     * (SendGrid/Postmark/SES) sends a provider-specific payload shape —
     * connecting one later needs a thin adapter in front of this that
     * normalizes to {email, event_type, message_id, reason} and forwards here.
     *
     * Fail-closed like the Payoneer webhook: a shared secret (configured by
     * whoever wires up the ESP adapter) must be present, since this endpoint
     * is otherwise unauthenticated and public by necessity.
     */
    public function bounce(Request $request): JsonResponse
    {
        $configuredSecret = config('services.email_bounce_webhook.secret');
        if (IntegrationGate::isPlaceholder($configuredSecret)) {
            Log::warning('Email bounce webhook called but EMAIL_BOUNCE_WEBHOOK_SECRET is not configured.');

            return ApiResponse::fail(
                message: 'Bounce webhook is not configured.',
                code: 'bounce_webhook_not_configured',
                status: 501,
                feature: 'Email bounce tracking',
                reason: 'EMAIL_BOUNCE_WEBHOOK_SECRET is not set',
                fix: 'Set EMAIL_BOUNCE_WEBHOOK_SECRET in laravel-api/.env and configure your ESP to send X-Webhook-Secret with that value.',
                actionUrl: '/admin/settings'
            );
        }

        $providedSecret = $request->header('X-Webhook-Secret', '');
        if (!hash_equals((string) $configuredSecret, (string) $providedSecret)) {
            Log::warning('Rejected email bounce webhook with invalid/missing secret', ['ip' => $request->ip()]);

            return ApiResponse::fail(
                'Invalid signature.',
                'invalid_signature',
                401,
                reason: 'the webhook secret did not match',
            );
        }

        $validated = $request->validate([
            'email' => 'required|email',
            'event_type' => 'required|string|in:bounce,complaint,dropped',
            'message_id' => 'nullable|string',
            'reason' => 'nullable|string|max:1000',
        ]);

        $status = match ($validated['event_type']) {
            'complaint' => 'complained',
            default => 'bounced',
        };

        $sentEmail = null;
        if (!empty($validated['message_id'])) {
            $sentEmail = SentEmail::where('tracking_id', $validated['message_id'])->first();
        }
        if (!$sentEmail) {
            $sentEmail = SentEmail::where('to_email', $validated['email'])->latest('sent_at')->first();
        }

        if ($sentEmail) {
            $sentEmail->update([
                'status' => $status,
                'error_message' => $validated['reason'] ?? $sentEmail->error_message,
                'metadata' => array_merge($sentEmail->metadata ?? [], [
                    'bounce_event' => [
                        'event_type' => $validated['event_type'],
                        'reason' => $validated['reason'] ?? null,
                        'received_at' => now()->toIso8601String(),
                    ],
                ]),
            ]);

            $historyId = $sentEmail->metadata['email_history_id'] ?? null;
            if ($historyId) {
                EmailHistory::where('id', $historyId)->update([
                    'status' => $status,
                    'error_message' => $validated['reason'] ?? null,
                ]);
            }
        } else {
            $history = EmailHistory::where('recipient', $validated['email'])->latest('sent_at')->first();
            $history?->update([
                'status' => $status,
                'error_message' => $validated['reason'] ?? null,
            ]);
        }

        Log::info('Email bounce/complaint webhook received', $validated + ['matched_sent_email' => $sentEmail?->id]);

        return ApiResponse::ok(['matched' => (bool) $sentEmail, 'status' => $status], 'Bounce event recorded');
    }
}
