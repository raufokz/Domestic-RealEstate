<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\GeoListEntryCrud;
use App\Http\Controllers\Controller;
use App\Models\GeoBlacklistEntry;

class GeoBlacklistController extends Controller
{
    use GeoListEntryCrud;

    protected function model(): string
    {
        return GeoBlacklistEntry::class;
    }

    protected function cacheKey(): string
    {
        return 'geo:blacklist_entries';
    }

    protected function label(): string
    {
        return 'blacklist';
    }
}
