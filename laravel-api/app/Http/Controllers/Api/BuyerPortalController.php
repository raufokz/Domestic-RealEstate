<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Enquiry;
use App\Models\Lead;
use App\Models\MortgageApplication;
use App\Models\SavedSearch;
use App\Models\TransactionDocument;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Buyer Portal — every query is strictly scoped to the signed-in user.
 * Access is enforced at the route level via `role:buyer,admin,super_admin`.
 */
class BuyerPortalController extends Controller
{
    // ---------------------------------------------------------------
    // Saved Searches (real table — saved_searches)
    // ---------------------------------------------------------------

    public function savedSearches(Request $request): JsonResponse
    {
        $searches = SavedSearch::where('user_id', $request->user()->id)->latest()->get();

        $data = $searches->map(function (SavedSearch $s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'location' => $s->location,
                'priceMin' => $s->price_min,
                'priceMax' => $s->price_max,
                'beds' => $s->beds,
                'baths' => $s->baths,
                'propertyType' => $s->property_type,
                'newMatches' => $s->newMatchesCount(),
                'lastAlert' => optional($s->last_alert_at)->diffForHumans(),
                'alertEnabled' => $s->alert_enabled,
            ];
        });

        return response()->json($data);
    }

    public function storeSavedSearch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'price_min' => 'nullable|integer|min:0',
            'price_max' => 'nullable|integer|min:0',
            'beds' => 'nullable|integer|min:0',
            'baths' => 'nullable|integer|min:0',
            'property_type' => 'nullable|string|max:100',
            'alert_enabled' => 'nullable|boolean',
        ]);

        $search = SavedSearch::create([...$validated, 'user_id' => $request->user()->id]);

        return response()->json(['message' => 'Search saved.', 'data' => $search], 201);
    }

    public function updateSavedSearch(Request $request, int $id): JsonResponse
    {
        $search = SavedSearch::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:255',
            'price_min' => 'nullable|integer|min:0',
            'price_max' => 'nullable|integer|min:0',
            'beds' => 'nullable|integer|min:0',
            'baths' => 'nullable|integer|min:0',
            'property_type' => 'nullable|string|max:100',
            'alert_enabled' => 'nullable|boolean',
        ]);

        $search->update($validated);

        return response()->json(['message' => 'Search updated.', 'data' => $search]);
    }

    public function destroySavedSearch(Request $request, int $id): JsonResponse
    {
        $search = SavedSearch::where('user_id', $request->user()->id)->findOrFail($id);
        $search->delete();

        return response()->json(['message' => 'Search deleted.']);
    }

    /** Properties currently matching a saved search, and marks it as alerted (resets the "new" counter). */
    public function runSavedSearch(Request $request, int $id): JsonResponse
    {
        $search = SavedSearch::where('user_id', $request->user()->id)->findOrFail($id);
        $properties = $search->matchingProperties()->with(['propertyType', 'images'])->latest()->limit(50)->get();
        $search->update(['last_alert_at' => now()]);

        return response()->json(['data' => $properties]);
    }

    // ---------------------------------------------------------------
    // Appointments (real table — appointments — matched via the
    // buyer's own leads, since Appointment.user_id is the AGENT who
    // scheduled it, not the buyer. A buyer's appointments are the ones
    // linked to a lead captured under their own email.)
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
                    'address' => $a->location,
                    'agent' => $a->user?->name,
                    'date' => optional($a->starts_at)->format('M j, Y'),
                    'time' => optional($a->starts_at)->format('g:i A'),
                    'type' => ucfirst($a->type),
                    'status' => ucfirst($a->status),
                ];
            });

        return response()->json($appointments);
    }

    // ---------------------------------------------------------------
    // Mortgage applications (real table — mortgage_applications — self
    // reported by the buyer; there is no lender-integration in this
    // platform yet, so these are the buyer's own records, not verified
    // third-party data.)
    // ---------------------------------------------------------------

    public function mortgageApplications(Request $request): JsonResponse
    {
        $apps = MortgageApplication::where('user_id', $request->user()->id)->latest('applied_at')->get();

        return response()->json([
            'applications' => $apps->map(fn (MortgageApplication $a) => [
                'id' => $a->id,
                'lender' => $a->lender_name,
                'amount' => '$' . number_format($a->amount),
                'rate' => $a->rate ? number_format((float) $a->rate, 2) . '%' : '—',
                'status' => str($a->status)->headline(),
                'date' => $a->applied_at->format('M j, Y'),
                'monthlyPayment' => $a->monthly_payment ? '$' . number_format((float) $a->monthly_payment) : '—',
            ]),
        ]);
    }

    public function storeMortgageApplication(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lender_name' => 'required|string|max:255',
            'amount' => 'required|integer|min:1',
            'rate' => 'nullable|numeric|min:0|max:99',
            'term_years' => 'nullable|integer|in:15,20,30',
            'monthly_payment' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:applied,pre_approved,approved,denied,withdrawn',
            'notes' => 'nullable|string',
        ]);

        $app = MortgageApplication::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'applied_at' => now(),
        ]);

        return response()->json(['message' => 'Mortgage application logged.', 'data' => $app], 201);
    }

    // ---------------------------------------------------------------
    // Messages — real thread on the buyer's own Enquiry submissions
    // (Enquiry + EnquiryReply already existed but EnquiryReply was
    // never wired to any controller before this).
    // ---------------------------------------------------------------

    public function messages(Request $request): JsonResponse
    {
        $enquiries = Enquiry::with(['agent', 'property', 'replies.replier'])
            ->where('email', $request->user()->email)
            ->latest()
            ->get();

        $conversations = $enquiries->map(function (Enquiry $e) {
            $lastReply = $e->replies->last();
            return [
                'id' => $e->id,
                'name' => $e->agent?->name ?? 'Domestic Real Estate',
                'role' => $e->agent ? 'Agent' : 'Support',
                'property' => $e->property?->title ?? $e->subject,
                'lastMessage' => $lastReply?->reply ?? $e->message,
                'time' => optional($lastReply?->created_at ?? $e->created_at)->diffForHumans(),
                'unread' => 0,
            ];
        });

        return response()->json($conversations);
    }

    public function messageThread(Request $request, int $id): JsonResponse
    {
        $enquiry = Enquiry::with(['replies.replier'])
            ->where('email', $request->user()->email)
            ->findOrFail($id);

        $messages = collect([[
            'id' => 'initial',
            'sender' => $enquiry->name,
            'content' => $enquiry->message,
            'time' => $enquiry->created_at->format('g:i A'),
            'isMe' => true,
        ]])->concat($enquiry->replies->map(fn ($r) => [
            'id' => $r->id,
            'sender' => $r->replier?->name ?? 'Agent',
            'content' => $r->reply,
            'time' => $r->created_at->format('g:i A'),
            'isMe' => false,
        ]));

        return response()->json(['data' => $messages->values()]);
    }

    public function storeMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversationId' => 'required|integer|exists:enquiries,id',
            'content' => 'required|string|max:5000',
        ]);

        $enquiry = Enquiry::where('email', $request->user()->email)->findOrFail($validated['conversationId']);

        $reply = $enquiry->replies()->create([
            'reply' => $validated['content'],
            'replied_by' => $request->user()->id,
            'is_guest' => false,
        ]);

        return response()->json(['message' => 'Message sent.', 'data' => $reply], 201);
    }

    // ---------------------------------------------------------------
    // Documents (real table — transaction_documents — a private vault
    // for the buyer's own transaction paperwork).
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
