<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user');
        if ($request->action) $query->where('action', $request->action);
        if ($request->entity_type) $query->where('entity_type', $request->entity_type);
        if ($request->user_id) $query->where('user_id', $request->user_id);
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('action', 'like', "%{$request->search}%")
                  ->orWhere('entity_type', 'like', "%{$request->search}%");
            });
        }
        return response()->json($query->latest()->paginate($request->get('per_page', 30)));
    }

    public function stats()
    {
        return response()->json([
            'total' => AuditLog::count(),
            'today' => AuditLog::whereDate('created_at', today())->count(),
            'top_actions' => AuditLog::select('action', \Illuminate\Support\Facades\DB::raw('COUNT(*) as count'))
                ->groupBy('action')->orderByDesc('count')->limit(10)->get(),
            'recent' => AuditLog::with('user')->latest()->limit(20)->get(),
        ]);
    }
}
