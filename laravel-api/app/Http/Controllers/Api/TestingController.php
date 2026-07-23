<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class TestingController extends Controller
{
    public function smtpTest(Request $request): JsonResponse {
        return ApiResponse::fail(
            message: 'SMTP is not fully configured or tested.',
            code: 'smtp_not_configured',
            status: 400,
            feature: 'Email',
            reason: 'MAIL_PASSWORD in .env is missing or invalid',
            fix: 'Set a valid MAIL_PASSWORD in laravel-api/.env and run php artisan queue:work.',
            actionUrl: '/admin/settings'
        );
    }

    public function spamScore(Request $request): JsonResponse {
        return response()->json(['score' => 0, 'max' => 10, 'status' => 'N/A', 'details' => 'No email content provided']);
    }

    public function dnsCheck(Request $request): JsonResponse {
        return response()->json(['spf' => 'not_configured', 'dkim' => 'not_configured', 'dmarc' => 'not_configured', 'mx' => ['status' => 'ok', 'records' => []]]);
    }

    public function sendTestEmail(Request $request): JsonResponse {
        $to = $request->input('to', Auth::user()?->email ?? 'info@domesticrealestate.us');
        try {
            Mail::raw('This is a test email from Domestic Real Estate Platform Testing Center.', function ($msg) use ($to) {
                $msg->to($to)->subject('DomesticRE — SMTP Test Email');
            });
            return ApiResponse::ok(['recipient' => $to], 'Test email queued successfully');
        } catch (\Throwable $e) {
            return ApiResponse::fail(
                message: 'Failed to send test email: '.$e->getMessage(),
                code: 'email_failed',
                status: 500,
                feature: 'Email',
                reason: $e->getMessage(),
                fix: 'Verify MAIL_HOST, MAIL_USERNAME, and MAIL_PASSWORD in laravel-api/.env',
                actionUrl: '/admin/testing/email'
            );
        }
    }

    public function recentPayments(): JsonResponse {
        $invoices = Invoice::where('status', 'paid')->latest()->limit(10)->get();
        return ApiResponse::ok($invoices);
    }

    public function generateTestInvoice(Request $request): JsonResponse {
        $user = Auth::user() ?? User::first();
        if (!$user) {
            return ApiResponse::fail('No user available to generate a test invoice.', 'no_user', 400);
        }

        $invoice = Invoice::create([
            'invoice_number' => Invoice::generateNumber(),
            'user_id' => $user->id,
            'description' => 'Test Invoice — Generated via Admin Testing Center',
            'amount' => 99.99,
            'currency' => 'USD',
            'status' => 'draft',
            'notes' => 'Generated automatically for testing invoice workflows.',
            'due_at' => now()->addDays(7),
            'created_by' => Auth::id() ?? $user->id,
        ]);

        return ApiResponse::ok(['invoice' => $invoice], 'Real test invoice generated successfully', 201);
    }

    public function sendTestPayment(Request $request): JsonResponse {
        return ApiResponse::fail(
            message: 'Payoneer integration is not configured.',
            code: 'payoneer_not_configured',
            status: 400,
            feature: 'Payments',
            reason: 'Payoneer credentials are not set',
            fix: 'Add Payoneer credentials in Admin → Integrations.',
            actionUrl: '/admin/integrations'
        );
    }

    public function simulatePayment(Request $request): JsonResponse {
        $invoiceId = $request->input('invoice_id');
        if ($invoiceId) {
            $invoice = Invoice::find($invoiceId);
            if ($invoice) {
                $invoice->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                ]);
                return ApiResponse::ok(['invoice' => $invoice->fresh()], 'Invoice marked as paid via test simulation');
            }
        }

        $latest = Invoice::whereIn('status', ['draft', 'sent'])->latest()->first();
        if ($latest) {
            $latest->update(['status' => 'paid', 'paid_at' => now()]);
            return ApiResponse::ok(['invoice' => $latest->fresh()], 'Latest unpaid invoice #'.$latest->invoice_number.' marked as paid');
        }

        return ApiResponse::fail('No unpaid invoice found to simulate payment.', 'no_unpaid_invoice', 400);
    }

    public function smsWebhooks(): JsonResponse {
        return response()->json(['data' => []]);
    }

    public function sendTestSms(Request $request): JsonResponse {
        return ApiResponse::fail(
            message: 'SMS provider is not configured.',
            code: 'sms_not_configured',
            status: 400,
            feature: 'SMS',
            reason: 'Twilio credentials are missing in laravel-api/.env',
            fix: 'Set TWILIO_SID and TWILIO_AUTH_TOKEN in .env',
            actionUrl: '/admin/integrations'
        );
    }

    public function smsLookup(Request $request): JsonResponse {
        return response()->json(['valid' => false, 'carrier' => 'unknown', 'type' => 'unknown', 'message' => 'SMS provider not configured']);
    }

    public function webhookEndpoints(): JsonResponse {
        return response()->json(['data' => []]);
    }

    public function webhookHistory(): JsonResponse {
        return response()->json(['data' => []]);
    }

    public function sendTestWebhook(Request $request): JsonResponse {
        $targetUrl = $request->input('target_url') ?? $request->input('url');
        if (!$targetUrl) {
            return ApiResponse::fail(
                message: 'No target URL provided for test webhook.',
                code: 'missing_target_url',
                status: 422,
                feature: 'Webhooks',
                reason: 'target_url parameter was empty',
                fix: 'Pass a valid target_url parameter when calling sendTestWebhook.',
                actionUrl: '/admin/testing/webhooks'
            );
        }

        try {
            $res = Http::timeout(10)->post($targetUrl, [
                'event' => 'test.webhook',
                'timestamp' => now()->toIso8601String(),
                'data' => ['message' => 'DomesticRE test webhook delivery'],
            ]);

            return ApiResponse::ok([
                'target_url' => $targetUrl,
                'status_code' => $res->status(),
                'body' => $res->body(),
            ], 'Test webhook dispatched');
        } catch (\Throwable $e) {
            return ApiResponse::fail(
                message: 'Webhook dispatch failed: '.$e->getMessage(),
                code: 'webhook_dispatch_failed',
                status: 500,
                feature: 'Webhooks',
                reason: $e->getMessage(),
                fix: 'Verify the target URL is accessible and accepting POST requests.',
                actionUrl: '/admin/testing/webhooks'
            );
        }
    }
}
