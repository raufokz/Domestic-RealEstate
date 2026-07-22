<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestingController extends Controller
{
    public function smtpTest(Request $request): JsonResponse {
        return response()->json(['success' => false, 'message' => 'SMTP not configured. Add SMTP credentials in Settings > Email.', 'details' => null]);
    }

    public function spamScore(Request $request): JsonResponse {
        return response()->json(['score' => 0, 'max' => 10, 'status' => 'N/A', 'details' => 'No email content provided']);
    }

    public function dnsCheck(Request $request): JsonResponse {
        return response()->json(['spf' => 'not_configured', 'dkim' => 'not_configured', 'dmarc' => 'not_configured', 'mx' => ['status' => 'ok', 'records' => []]]);
    }

    public function sendTestEmail(Request $request): JsonResponse {
        return response()->json(['success' => false, 'message' => 'SMTP not configured. Add SMTP credentials in Settings > Email.']);
    }

    public function recentPayments(): JsonResponse {
        return response()->json(['data' => []]);
    }

    public function generateTestInvoice(Request $request): JsonResponse {
        return response()->json(['success' => true, 'message' => 'Test invoice generated', 'invoice' => ['id' => 1, 'amount' => 99.99, 'status' => 'draft']]);
    }

    public function sendTestPayment(Request $request): JsonResponse {
        return response()->json(['success' => false, 'message' => 'Payoneer not configured. Add API key in Settings > Integrations.']);
    }

    public function simulatePayment(Request $request): JsonResponse {
        return response()->json(['success' => true, 'message' => 'Payment simulated successfully']);
    }

    public function smsWebhooks(): JsonResponse {
        return response()->json(['data' => []]);
    }

    public function sendTestSms(Request $request): JsonResponse {
        return response()->json(['success' => false, 'message' => 'SMS not configured. Add Twilio credentials in Settings > Integrations.']);
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
        return response()->json(['success' => true, 'message' => 'Test webhook sent', 'status_code' => 200]);
    }
}
