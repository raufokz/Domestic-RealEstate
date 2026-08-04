<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\GeoListEntryCrud;
use App\Http\Controllers\Controller;
use App\Models\GeoWhitelistEntry;

class GeoWhitelistController extends Controller
{
    use GeoListEntryCrud;

    protected function model(): string
    {
        return GeoWhitelistEntry::class;
    }

    protected function cacheKey(): string
    {
        return 'geo:whitelist_entries';
    }

    protected function label(): string
    {
        return 'whitelist';
    }
}
