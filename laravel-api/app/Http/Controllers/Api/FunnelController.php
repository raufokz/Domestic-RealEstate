<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LeadCaptureService;
use App\Services\TurnstileVerifier;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Progressive-capture consumer funnels (buy/sell/invest) — see the plan's
 * Workstream 2. Deliberately separate from FormSubmissionController's
 * single-page submitBuyerRequest/submitSellerRequest/submitInvestorInquiry,
 * which stay untouched and keep serving the legacy single-page forms.
 *
 * Every funnel has two calls: checkpoint() at the name/phone screen (real
 * TCPA consent capture, Lead created here so an abandoned session is still
 * a real, sellable-later lead) and complete() at the final screen (token-
 * bound to the checkpoint lead — never re-matched by email/phone, which
 * would let a stranger inject data into someone else's lead record).
 */
class FunnelController extends Controller
{
    private function blockIfSpam(Request $request): ?JsonResponse
    {
        $result = TurnstileVerifier::verify($request->input('turnstile_token'), $request->ip());
        if ($result['passed']) {
            return null;
        }

        return ApiResponse::fail('Spam verification failed. Please refresh the page and try again.', 'spam_blocked', 422);
    }

    private function checkpointCommon(Request $request, string $intent): JsonResponse
    {
        if ($blocked = $this->blockIfSpam($request)) {
            return $blocked;
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'location' => 'nullable|string|max:255',
            'timeline' => 'nullable|string|max:100',
            'consent_text' => 'required|string',
            'consent_version' => 'required|string|max:20',
        ]);

        $result = LeadCaptureService::checkpoint($intent, [
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'location' => $validated['location'] ?? null,
            'timeline' => $validated['timeline'] ?? null,
            'consent_text' => $validated['consent_text'],
            'consent_version' => $validated['consent_version'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'page_url' => $request->input('page_url'),
        ]);

        return ApiResponse::ok(['token' => $result['token']], 'Got it — a few more questions for better matches.', 201);
    }

    private function completeCommon(Request $request, string $intent, array $extraRules, array $extraDataMap): JsonResponse
    {
        if ($blocked = $this->blockIfSpam($request)) {
            return $blocked;
        }

        $validated = $request->validate(array_merge([
            'token' => 'required|string',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ], $extraRules));

        $data = ['name' => $validated['name'] ?? null, 'phone' => $validated['phone'] ?? null, 'email' => $validated['email'] ?? null];
        foreach ($extraDataMap as $key) {
            if (array_key_exists($key, $validated)) {
                $data[$key] = $validated[$key];
            }
        }

        $lead = LeadCaptureService::complete($intent, $validated['token'], $data);

        return ApiResponse::ok([
            'lead_id' => $lead->id,
            'lead_number' => $lead->lead_number,
            'quality_tier' => $lead->quality_tier,
        ], 'Thanks — a specialist will be in touch soon.');
    }

    // ── Buy ──

    public function buyCheckpoint(Request $request): JsonResponse
    {
        return $this->checkpointCommon($request, 'buy');
    }

    public function buyComplete(Request $request): JsonResponse
    {
        return $this->completeCommon($request, 'buy', [
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'property_type' => 'nullable|string|max:100',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|numeric|min:0',
            'financing' => 'nullable|string|max:100',
            'pre_approved' => 'nullable|boolean',
        ], ['budget_min', 'budget_max', 'property_type', 'bedrooms', 'bathrooms', 'financing', 'pre_approved']);
    }

    // ── Sell ──

    public function sellCheckpoint(Request $request): JsonResponse
    {
        return $this->checkpointCommon($request, 'sell');
    }

    public function sellComplete(Request $request): JsonResponse
    {
        return $this->completeCommon($request, 'sell', [
            'property_type' => 'nullable|string|max:100',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|numeric|min:0',
            'condition' => 'nullable|string|max:100',
            'occupancy' => 'nullable|string|max:100',
        ], ['property_type', 'bedrooms', 'bathrooms', 'condition', 'occupancy']);
    }

    // ── Invest ──

    public function investCheckpoint(Request $request): JsonResponse
    {
        return $this->checkpointCommon($request, 'invest');
    }

    public function investComplete(Request $request): JsonResponse
    {
        return $this->completeCommon($request, 'invest', [
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'financing' => 'nullable|string|max:100',
            'motivation' => 'nullable|string|max:100',
        ], ['budget_min', 'budget_max', 'financing', 'motivation']);
    }
}
