<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function ok(mixed $data = null, string $message = 'OK', int $status = 200): JsonResponse
    {
        $payload = ['success' => true, 'message' => $message];
        if ($data !== null) {
            $payload['data'] = $data;
        }

        return response()->json($payload, $status);
    }

    public static function fail(
        string $message,
        string $code = 'error',
        int $status = 400,
        ?string $feature = null,
        ?string $reason = null,
        ?string $fix = null,
        ?string $actionUrl = null,
        mixed $errors = null,
    ): JsonResponse {
        $payload = [
            'success' => false,
            'code' => $code,
            'message' => $message,
        ];

        if ($feature) {
            $payload['feature'] = $feature;
        }
        if ($reason) {
            $payload['reason'] = $reason;
        }
        if ($fix) {
            $payload['fix'] = $fix;
        }
        if ($actionUrl) {
            $payload['action_url'] = $actionUrl;
            $payload['action_label'] = 'Open settings';
        }
        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }
}
