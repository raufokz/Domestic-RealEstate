<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ServiceRequestController extends Controller
{
    public function store(Request $request) {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'service_type' => 'required|string|max:100',
            'budget_range' => 'nullable|string|max:50',
            'timeline' => 'nullable|string|max:50',
            'message' => 'nullable|string|max:5000',
            'how_did_you_hear' => 'nullable|string|max:100',
        ]);

        $user = Auth::user();
        $sr = ServiceRequest::create([
            'request_number' => ServiceRequest::generateNumber(),
            'user_id' => $user?->id,
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'service_type' => $request->service_type,
            'budget_range' => $request->budget_range,
            'timeline' => $request->timeline,
            'message' => $request->message,
            'how_did_you_hear' => $request->how_did_you_hear,
            'status' => 'new',
        ]);

        \App\Services\LeadCaptureService::upsert([
            'name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'source' => 'service_request',
            'type' => 'buyer',
            'timeline' => $request->timeline,
            'notes' => 'Service request '.$sr->request_number.' ('.$request->service_type.'): '.($request->message ?? ''),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'performed_by' => $user?->id,
        ]);

        return response()->json([
            'message' => 'Your request has been submitted. Our team will review and contact you shortly.',
            'request_number' => $sr->request_number,
        ], 201);
    }

    public function show($requestNumber) {
        $user = Auth::user();
        $sr = ServiceRequest::where('request_number', $requestNumber)->firstOrFail();
        $isAdmin = $user && in_array($user->role, ['admin', 'super_admin']);
        if (!$sr->user_id && !$isAdmin) {
            abort(403);
        }
        if ($sr->user_id && $sr->user_id !== $user?->id && !$isAdmin) {
            abort(403);
        }
        return response()->json($sr->load(['contracts', 'invoices']));
    }

    public function myRequests() {
        $user = Auth::user();
        return response()->json(
            ServiceRequest::where('user_id', $user->id)->orderBy('created_at', 'desc')->get()
        );
    }
}
