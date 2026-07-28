<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Settings for the CORS middleware. Controls which origins can access
    | the API and whether credentials (cookies, auth headers) are allowed.
    |
    */

    "paths" => ["api/*", "sanctum/csrf-cookie"],

    "allowed_methods" => ["*"],

    "allowed_origins" => [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://domesticrealestate.us",
        "https://www.domesticrealestate.us",
    ],

    "allowed_origins_patterns" => [],

    "allowed_headers" => ["*"],

    "exposed_headers" => [],

    "max_age" => 86400,

    "supports_credentials" => true,

];
