<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrackPageView
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if ($request->isMethod('GET') && !$request->is('api/*') && !$request->ajax()) {
            try {
                DB::table('page_views')->insert([
                    'url' => $request->fullUrl(),
                    'path' => $request->path(),
                    'ip_address' => $request->ip(),
                    'user_agent' => substr($request->userAgent(), 0, 500),
                    'referer' => $request->header('referer'),
                    'user_id' => $request->user()?->id,
                    'created_at' => now(),
                ]);
            } catch (\Exception $e) {
                // silently fail
            }
        }

        return $response;
    }
}
