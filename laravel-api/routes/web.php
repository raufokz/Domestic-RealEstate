<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $start = microtime(true);

    $dbOk = true;
    try {
        DB::select('select 1');
    } catch (\Throwable $e) {
        $dbOk = false;
    }

    // Detailed system info (PHP/Laravel version, load, memory, env) is
    // fingerprinting data for attackers — only show it outside production.
    $showDetails = ! app()->environment('production');
    $load = $showDetails && function_exists('sys_getloadavg') ? sys_getloadavg() : false;

    return view('status', [
        'overallOk' => $dbOk,
        'dbOk' => $dbOk,
        'responseMs' => round((microtime(true) - $start) * 1000, 1),
        'showDetails' => $showDetails,
        'load1' => $load ? round($load[0], 2) : null,
        'memUsed' => $showDetails ? round(memory_get_peak_usage(true) / 1024 / 1024, 1) . ' MB' : null,
        'phpVersion' => $showDetails ? phpversion() : null,
        'laravelVersion' => $showDetails ? app()->version() : null,
        'env' => $showDetails ? app()->environment() : null,
        'checkedAt' => now()->toDateTimeString() . ' UTC',
    ]);
});
