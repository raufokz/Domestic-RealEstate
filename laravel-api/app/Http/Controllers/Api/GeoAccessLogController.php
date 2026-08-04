<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GeoAccessLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GeoAccessLogController extends Controller
{
    private function checkAdmin(): void
    {
        $user = Auth::user();
        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    private function filtered(Request $request)
    {
        $query = GeoAccessLog::query();

        if ($ip = $request->get('ip')) {
            $query->where('ip_address', 'like', "%{$ip}%");
        }
        if ($country = $request->get('country')) {
            $query->where('country_code', $country);
        }
        if ($reason = $request->get('reason')) {
            $query->where('reason', $reason);
        }
        if ($from = $request->get('from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->get('to')) {
            $query->whereDate('created_at', '<=', $to);
        }
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('ip_address', 'like', "%{$search}%")
                    ->orWhere('url', 'like', "%{$search}%")
                    ->orWhere('user_agent', 'like', "%{$search}%");
            });
        }

        return $query->orderByDesc('created_at');
    }

    public function index(Request $request): JsonResponse
    {
        $this->checkAdmin();
        $perPage = min((int) $request->get('per_page', 25), 100);

        // Flat paginator shape (not wrapped in {success,data}), matching
        // BlogController::adminIndex's convention that AdminDataTable expects.
        return response()->json($this->filtered($request)->paginate($perPage));
    }

    public function export(Request $request): StreamedResponse
    {
        $this->checkAdmin();
        $logs = $this->filtered($request)->limit(10000)->get();

        return response()->streamDownload(function () use ($logs) {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['timestamp', 'ip_address', 'country', 'city', 'asn', 'isp', 'is_vpn', 'is_tor', 'is_datacenter', 'reason', 'url', 'method', 'user_agent']);
            foreach ($logs as $log) {
                fputcsv($output, [
                    $log->created_at,
                    $log->ip_address,
                    $log->country_code,
                    $log->city,
                    $log->asn,
                    $log->isp,
                    $log->is_vpn ? '1' : '0',
                    $log->is_tor ? '1' : '0',
                    $log->is_datacenter ? '1' : '0',
                    $log->reason,
                    $log->url,
                    $log->method,
                    $log->user_agent,
                ]);
            }
            fclose($output);
        }, 'geo-access-logs-' . now()->format('Y-m-d') . '.csv', ['Content-Type' => 'text/csv']);
    }
}
