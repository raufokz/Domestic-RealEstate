<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ZipCode;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * Public read-only lookup against the free zip_codes centroid table (see
 * ZipCodeSeeder) — lets the frontend center a map / draw a radius circle
 * for a ZIP without any paid geocoding API.
 */
class ZipLookupController extends Controller
{
    public function show(string $zip): JsonResponse
    {
        $zip = str_pad(substr(trim($zip), 0, 5), 5, '0', STR_PAD_LEFT);
        $row = ZipCode::find($zip);

        if (!$row) {
            return ApiResponse::fail('Unknown ZIP code.', 'not_found', 404);
        }

        return ApiResponse::ok(['zip' => $row->zip, 'latitude' => $row->latitude, 'longitude' => $row->longitude]);
    }
}
