<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Lead;
use App\Models\TransactionDocument;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Seller Portal — every query is strictly scoped to the signed-in user.
 * Access is enforced at the route level via `role:seller,agent,broker,admin,super_admin`.
 */
class SellerPortalController extends Controller
{
    // ---------------------------------------------------------------
    // Appointments (real table — appointments — matched via the
    // seller's own leads, same approach as BuyerPortalController;
    // Appointment.user_id is the agent who scheduled the showing.)
    // ---------------------------------------------------------------

    public function appointments(Request $request): JsonResponse
    {
        $leadIds = Lead::where('normalized_email', strtolower($request->user()->email))->pluck('id');

        $appointments = Appointment::with(['lead.property', 'user'])
            ->whereIn('lead_id', $leadIds)
            ->orderBy('starts_at')
            ->get()
            ->map(function (Appointment $a) {
                return [
                    'id' => $a->id,
                    'property' => $a->lead?->property_type ?? $a->title,
                    'buyersAgent' => $a->user?->name,
                    'date' => optional($a->starts_at)->format('M j, Y'),
                    'time' => optional($a->starts_at)->format('g:i A'),
                    'type' => ucfirst($a->type),
                    'feedback' => $a->description,
                    'status' => ucfirst($a->status),
                ];
            });

        return response()->json($appointments);
    }

    // ---------------------------------------------------------------
    // Valuations — the seller's own valuation-request Leads (created
    // via the real /forms/seller-request flow). No fabricated "AI
    // confidence %" — only real fields the platform actually captured.
    // ---------------------------------------------------------------

    public function valuations(Request $request): JsonResponse
    {
        $leads = Lead::where('normalized_email', strtolower($request->user()->email))
            ->where('source', 'seller_request')
            ->latest()
            ->get();

        $valuations = $leads->map(function (Lead $lead) {
            $meta = json_decode($lead->chat_metadata ?? '{}', true) ?: [];
            $address = collect([$meta['property_address'] ?? null, $meta['city'] ?? null, $meta['state'] ?? null])
                ->filter()->implode(', ');

            return [
                'id' => $lead->id,
                'address' => $address ?: ($lead->location ?? 'Address not provided'),
                'estimatedValue' => $meta['expected_price'] ?? null,
                'status' => $lead->status,
                'requestedAt' => $lead->created_at->format('M j, Y'),
            ];
        });

        return response()->json($valuations);
    }

    // ---------------------------------------------------------------
    // Documents (shared transaction_documents table with buyers).
    // ---------------------------------------------------------------

    public function documents(Request $request): JsonResponse
    {
        $docs = TransactionDocument::where('user_id', $request->user()->id)->latest()->get();

        return response()->json($docs->map(fn (TransactionDocument $d) => [
            'id' => $d->id,
            'name' => $d->name,
            'type' => str($d->document_type)->headline(),
            'date' => $d->created_at->format('M j, Y'),
            'size' => $d->size_bytes ? number_format($d->size_bytes / 1024, 0) . ' KB' : '—',
            'status' => str($d->status)->headline(),
        ]));
    }

    public function storeDocument(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|max:15360|mimes:pdf,jpg,jpeg,png,doc,docx',
            'document_type' => 'nullable|string|max:100',
            'name' => 'nullable|string|max:255',
        ]);

        $file = $request->file('file');
        $path = $file->store('transaction-documents', 'public');

        $doc = TransactionDocument::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'] ?: $file->getClientOriginalName(),
            'document_type' => $validated['document_type'] ?? 'other',
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'size_bytes' => $file->getSize(),
            'status' => 'received',
        ]);

        return response()->json(['message' => 'Document uploaded.', 'data' => $doc], 201);
    }

    public function downloadDocument(Request $request, int $id)
    {
        $doc = TransactionDocument::where('user_id', $request->user()->id)->findOrFail($id);

        if (!Storage::disk('public')->exists($doc->file_path)) {
            return ApiResponse::fail('File not found', 'not_found', 404, reason: 'this document is missing from storage');
        }

        return Storage::disk('public')->download($doc->file_path, $doc->original_name ?? $doc->name);
    }

    public function destroyDocument(Request $request, int $id): JsonResponse
    {
        $doc = TransactionDocument::where('user_id', $request->user()->id)->findOrFail($id);

        if (Storage::disk('public')->exists($doc->file_path)) {
            Storage::disk('public')->delete($doc->file_path);
        }
        $doc->delete();

        return response()->json(['message' => 'Document deleted.']);
    }
}
