<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use App\Models\Lead;
use App\Models\Property;
use App\Models\PropertyFavorite;
use App\Models\TransactionDocument;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Investor Portal — every query is strictly scoped to the signed-in user.
 * Access is enforced at the route level via `role:investor,admin,super_admin`.
 *
 * Deliberately does NOT fabricate ROI / cap rate / occupancy / cash-flow
 * figures anywhere — this platform has no rental-income, expense, or
 * acquisition tracking, so those numbers would just be invented. Every
 * response here is built only from real columns.
 */
class InvestorPortalController extends Controller
{
    // ---------------------------------------------------------------
    // Opportunities — real active listings, no fabricated financials.
    // ---------------------------------------------------------------

    public function opportunities(Request $request): JsonResponse
    {
        $properties = Property::where('approval_status', 'approved')
            ->where('status', 'active')
            ->with(['propertyType', 'images'])
            ->latest()
            ->limit(30)
            ->get();

        return response()->json($properties->map(fn (Property $p) => [
            'id' => $p->id,
            'slug' => $p->slug,
            'address' => collect([$p->address, $p->city, $p->state])->filter()->implode(', '),
            'type' => $p->propertyType?->name ?? 'Property',
            'price' => $p->price,
            'beds' => $p->bedrooms,
            'baths' => $p->bathrooms,
            'sqft' => $p->sqft,
        ]));
    }

    // ---------------------------------------------------------------
    // Saved properties (real table — property_favorites).
    // ---------------------------------------------------------------

    public function savedProperties(Request $request): JsonResponse
    {
        $favorites = PropertyFavorite::where('user_id', $request->user()->id)
            ->with(['property.propertyType', 'property.images'])
            ->latest()
            ->get()
            ->filter(fn (PropertyFavorite $f) => $f->property !== null);

        return response()->json($favorites->map(fn (PropertyFavorite $f) => [
            'id' => $f->property->id,
            'slug' => $f->property->slug,
            'title' => $f->property->title,
            'address' => collect([$f->property->address, $f->property->city, $f->property->state])->filter()->implode(', '),
            'price' => $f->property->price,
            'beds' => $f->property->bedrooms,
            'baths' => $f->property->bathrooms,
            'sqft' => $f->property->sqft,
            'status' => $f->property->status,
            'savedAt' => $f->created_at->diffForHumans(),
        ]));
    }

    public function destroySavedProperty(Request $request, int $propertyId): JsonResponse
    {
        PropertyFavorite::where('user_id', $request->user()->id)->where('property_id', $propertyId)->delete();

        return response()->json(['message' => 'Removed from saved properties.']);
    }

    // ---------------------------------------------------------------
    // Analytics — real counts only (no fabricated portfolio value/ROI).
    // ---------------------------------------------------------------

    public function analytics(Request $request): JsonResponse
    {
        $user = $request->user();
        $saved = PropertyFavorite::where('user_id', $user->id)->with('property')->get()
            ->filter(fn (PropertyFavorite $f) => $f->property !== null);

        $inquiriesSubmitted = Lead::where('normalized_email', strtolower($user->email))
            ->where('source', 'investor_inquiry')
            ->count();

        return response()->json([
            'saved_properties_count' => $saved->count(),
            'saved_properties_total_value' => (int) $saved->sum(fn (PropertyFavorite $f) => $f->property->price),
            'saved_properties_avg_price' => $saved->count() ? (int) round($saved->avg(fn (PropertyFavorite $f) => $f->property->price)) : 0,
            'investor_inquiries_submitted' => $inquiriesSubmitted,
            'note' => 'Portfolio value/ROI/occupancy figures require transaction and rental-income tracking, which this platform does not yet have — only real, currently-available numbers are shown above.',
        ]);
    }

    // ---------------------------------------------------------------
    // Portfolio — honest: this platform doesn't track acquisitions yet.
    // ---------------------------------------------------------------

    public function portfolio(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'available' => false,
            'message' => 'Acquired-property tracking is not built yet — this platform does not currently record when an investor closes on a property. Use Saved Properties to track opportunities you are evaluating.',
        ]);
    }

    // ---------------------------------------------------------------
    // Messages — real thread on the investor's own Enquiry submissions
    // (same pattern as BuyerPortalController).
    // ---------------------------------------------------------------

    public function messages(Request $request): JsonResponse
    {
        $enquiries = Enquiry::with(['agent', 'property', 'replies.replier'])
            ->where('email', $request->user()->email)
            ->latest()
            ->get();

        return response()->json($enquiries->map(function (Enquiry $e) {
            $lastReply = $e->replies->last();
            return [
                'id' => $e->id,
                'name' => $e->agent?->name ?? 'Domestic Real Estate',
                'role' => $e->agent ? 'Agent' : 'Support',
                'property' => $e->property?->title ?? $e->subject,
                'lastMessage' => $lastReply?->reply ?? $e->message,
                'time' => optional($lastReply?->created_at ?? $e->created_at)->diffForHumans(),
            ];
        }));
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
    // Documents (shared transaction_documents table).
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
