<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpCodeMail;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

/**
 * Email-based OTP for public forms where the submitter doesn't have a User
 * account yet (e.g. realtor application) — a free alternative to
 * AuthController::sendOtp/verifyOtp, which are phone/SMS-only and have no
 * actual delivery mechanism since no SMS provider is configured.
 */
class EmailOtpController extends Controller
{
    private const CODE_TTL_MINUTES = 10;
    private const VERIFIED_TTL_MINUTES = 30;

    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $code = (string) random_int(100000, 999999);
        cache()->put('email_otp:' . strtolower($validated['email']), $code, now()->addMinutes(self::CODE_TTL_MINUTES));

        Mail::to($validated['email'])->queue(new OtpCodeMail($code, 'verify your email for your realtor application'));

        return ApiResponse::ok(null, 'Verification code sent — check your inbox.');
    }

    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'code' => 'required|string',
        ]);

        $key = strtolower($validated['email']);
        $cached = cache()->get('email_otp:' . $key);

        if (!$cached || !hash_equals((string) $cached, (string) $validated['code'])) {
            return ApiResponse::fail('Invalid or expired code.', 'invalid_code', 422);
        }

        cache()->forget('email_otp:' . $key);
        cache()->put('email_otp_verified:' . $key, true, now()->addMinutes(self::VERIFIED_TTL_MINUTES));

        return ApiResponse::ok(null, 'Email verified.');
    }

    public static function isVerified(string $email): bool
    {
        return (bool) cache()->get('email_otp_verified:' . strtolower($email));
    }
}
