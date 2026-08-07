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

    $load = function_exists('sys_getloadavg') ? sys_getloadavg() : false;

    return view('status', [
        'overallOk' => $dbOk,
        'dbOk' => $dbOk,
        'responseMs' => round((microtime(true) - $start) * 1000, 1),
        'load1' => $load ? round($load[0], 2) : null,
        'memUsed' => round(memory_get_peak_usage(true) / 1024 / 1024, 1) . ' MB',
        'phpVersion' => phpversion(),
        'laravelVersion' => app()->version(),
        'env' => app()->environment(),
        'checkedAt' => now()->toDateTimeString() . ' UTC',
    ]);
});
