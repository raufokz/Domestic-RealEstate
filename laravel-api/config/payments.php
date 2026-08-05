<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Payoneer
    |--------------------------------------------------------------------------
    | Payoneer's real API (Mass Payout API for payouts, Checkout API for
    | accepting payments) requires an approved partnership before OAuth2
    | credentials are issued — it is not a self-serve instant-API-key
    | product. Until PAYONEER_CLIENT_ID/SECRET are set, PayoneerService
    | throws PaymentGatewayNotConfiguredException rather than faking success.
    |
    | Endpoint paths below are Payoneer's documented product shape as of
    | this writing (developer.payoneer.com) but are marked // VERIFY where
    | the exact path/payload could not be confirmed against a live partner
    | reference — confirm these once partner API access is granted.
    */
    'payoneer' => [
        'client_id' => env('PAYONEER_CLIENT_ID'),
        'client_secret' => env('PAYONEER_CLIENT_SECRET'),
        'program_id' => env('PAYONEER_PROGRAM_ID'),
        'webhook_secret' => env('PAYONEER_WEBHOOK_SECRET'),
        'environment' => env('PAYONEER_ENV', 'sandbox'), // sandbox|production
        'api_base' => env('PAYONEER_API_BASE', env('PAYONEER_ENV', 'sandbox') === 'production'
            ? 'https://payoneer.com/v4' // VERIFY production base URL against partner docs
            : 'https://sandbox.payoneer.com/v4' // VERIFY sandbox base URL against partner docs
        ),
        'token_url' => env('PAYONEER_TOKEN_URL'), // VERIFY OAuth2 token endpoint — set explicitly once partner docs confirm it
    ],
];
