<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Geo\GeoAccessDecisionService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Cross-service endpoint used by the Next.js edge middleware to decide
 * whether to render a public page for a given visitor IP (Next.js sees the
 * real visitor IP at the edge; a server-to-server call to Laravel from
 * Vercel would otherwise only carry Vercel's own IP). Gated by a shared
 * secret — never trust a client-supplied IP override without it, otherwise
 * anyone could spoof this on the public API to bypass the geo-block.
 */
class GeoCheckController extends Controller
{
    public function __construct(private GeoAccessDecisionService $decision)
    {
    }

    public function check(Request $request): JsonResponse
    {
        $secret = config('geo.internal_secret');
        if (!$secret || !hash_equals($secret, (string) $request->header('X-Geo-Internal-Secret'))) {
            return ApiResponse::fail('Invalid or missing internal secret.', 'unauthorized', 401);
        }

        $validated = $request->validate([
            'ip' => 'required|ip',
        ]);

        $result = $this->decision->decide($validated['ip']);

        return ApiResponse::ok([
            'allowed' => $result['allowed'],
            'reason' => $result['reason'],
            'country' => $result['country_code'],
            'blocked_message' => $result['blocked_message'],
        ]);
    }
}
