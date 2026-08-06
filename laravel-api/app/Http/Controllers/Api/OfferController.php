<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Offer;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Buyer ⇄ seller offer negotiation. Single-row-per-offer design — the offer
 * itself tracks current negotiation state (current_amount/last_action_by)
 * rather than a separate history table, matching the simplest model that
 * still supports an unlimited back-and-forth counter negotiation.
 */
class OfferController extends Controller
{
    private function isPrivileged($user): bool
    {
        return in_array($user->role, ['admin', 'super_admin'], true);
    }

    /** Offers on properties this user represents as seller/agent/broker — or all, if privileged. */
    private function sellerOffersQuery($user)
    {
        if ($this->isPrivileged($user)) {
            return Offer::query();
        }

        return Offer::whereHas('property', function ($q) use ($user) {
            $q->where('seller_id', $user->id)
                ->orWhere('realtor_id', $user->id)
                ->orWhere('broker_id', $user->id);
        });
    }

    public function buyerIndex(Request $request): JsonResponse
    {
        $offers = Offer::where('buyer_id', $request->user()->id)
            ->with('property:id,title,slug,address,city,state,photos')
            ->latest()
            ->get();

        return response()->json(['data' => $offers]);
    }

    public function sellerIndex(Request $request): JsonResponse
    {
        $offers = $this->sellerOffersQuery($request->user())
            ->with(['property:id,title,slug,address,city,state,photos', 'buyer:id,name,email,phone'])
            ->latest()
            ->get();

        return response()->json(['data' => $offers]);
    }

    /** Buyer submits a new offer on an active, approved listing. */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'amount' => 'required|numeric|min:1',
            'financing_type' => 'nullable|in:cash,conventional,fha,va,other',
            'contingencies' => 'nullable|array',
            'contingencies.*' => 'string',
            'closing_date' => 'nullable|date',
            'message' => 'nullable|string|max:2000',
        ]);

        $property = Property::where('status', 'active')
            ->where('approval_status', 'approved')
            ->find($validated['property_id']);

        if (!$property) {
            return response()->json(['message' => 'This property is not currently accepting offers.'], 422);
        }

        $offer = Offer::create([
            'property_id' => $property->id,
            'buyer_id' => $request->user()->id,
            'amount' => $validated['amount'],
            'current_amount' => $validated['amount'],
            'financing_type' => $validated['financing_type'] ?? null,
            'contingencies' => $validated['contingencies'] ?? null,
            'closing_date' => $validated['closing_date'] ?? null,
            'message' => $validated['message'] ?? null,
            'status' => 'submitted',
            'last_action_by' => 'buyer',
            'created_by' => $request->user()->id,
        ]);

        $offer->load('property');
        $this->notifySellerSide(
            $offer,
            'New offer received',
            "A new offer of $".number_format((float) $validated['amount'], 2)." was submitted on {$property->title}."
        );

        return response()->json([
            'message' => 'Offer submitted successfully.',
            'data' => $offer,
        ], 201);
    }

    /** Seller/agent/broker accepts, rejects, or counters — only when it's their turn. */
    public function sellerRespond(Request $request, int $id): JsonResponse
    {
        $offer = $this->sellerOffersQuery($request->user())->with('property')->findOrFail($id);

        if (!($offer->status === 'submitted' || ($offer->status === 'countered' && $offer->last_action_by === 'buyer'))) {
            return response()->json(['message' => 'This offer is not awaiting your response.'], 422);
        }

        return $this->respond($offer, $request, 'seller');
    }

    /** Buyer accepts, rejects, or counters a seller's counter — only when it's their turn. */
    public function buyerRespond(Request $request, int $id): JsonResponse
    {
        $offer = Offer::where('buyer_id', $request->user()->id)->with('property')->findOrFail($id);

        if (!($offer->status === 'countered' && $offer->last_action_by === 'seller')) {
            return response()->json(['message' => 'This offer is not awaiting your response.'], 422);
        }

        return $this->respond($offer, $request, 'buyer');
    }

    private function respond(Offer $offer, Request $request, string $side): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:accept,reject,counter',
            'amount' => 'required_if:action,counter|nullable|numeric|min:1',
            'message' => 'nullable|string|max:2000',
        ]);

        $property = $offer->property;

        switch ($validated['action']) {
            case 'accept':
                $offer->update(['status' => 'accepted', 'responded_at' => now()]);
                $title = 'Offer accepted';
                $message = "Your offer on {$property->title} was accepted.";
                break;
            case 'reject':
                $offer->update(['status' => 'rejected', 'responded_at' => now()]);
                $title = 'Offer rejected';
                $message = "Your offer on {$property->title} was rejected.";
                break;
            default: // counter
                $offer->update([
                    'status' => 'countered',
                    'current_amount' => $validated['amount'],
                    'counter_message' => $validated['message'] ?? null,
                    'last_action_by' => $side,
                ]);
                $title = 'Offer countered';
                $message = "A counter-offer of $".number_format((float) $validated['amount'], 2)." was made on {$property->title}.";
                break;
        }

        $offer->refresh()->load('property');

        if ($side === 'seller') {
            $this->notifyBuyer($offer, $title, $message);
        } else {
            $this->notifySellerSide($offer, $title, $message);
        }

        return response()->json(['message' => 'Response recorded.', 'data' => $offer]);
    }

    /** Buyer withdraws their own offer at any point before it's resolved. */
    public function withdraw(Request $request, int $id): JsonResponse
    {
        $offer = Offer::where('buyer_id', $request->user()->id)->with('property')->findOrFail($id);

        if (!in_array($offer->status, ['submitted', 'countered'], true)) {
            return response()->json(['message' => 'This offer can no longer be withdrawn.'], 422);
        }

        $offer->update(['status' => 'withdrawn', 'responded_at' => now()]);
        $offer->refresh()->load('property');

        $this->notifySellerSide($offer, 'Offer withdrawn', "The buyer withdrew their offer on {$offer->property->title}.");

        return response()->json(['message' => 'Offer withdrawn.', 'data' => $offer]);
    }

    private function notifyBuyer(Offer $offer, string $title, string $message): void
    {
        Notification::create([
            'user_id' => $offer->buyer_id,
            'type' => 'offer_update',
            'severity' => Notification::SEVERITY_INFO,
            'module' => 'offers',
            'title' => $title,
            'message' => $message,
            'action_url' => '/buyer/dashboard/offers',
            'action_label' => 'View Offer',
            'data' => ['offer_id' => $offer->id],
        ]);
    }

    private function notifySellerSide(Offer $offer, string $title, string $message): void
    {
        $property = $offer->property;
        $sellerUserIds = array_unique(array_filter([$property->seller_id, $property->realtor_id, $property->broker_id]));

        foreach ($sellerUserIds as $userId) {
            Notification::create([
                'user_id' => $userId,
                'type' => 'offer_update',
                'severity' => Notification::SEVERITY_INFO,
                'module' => 'offers',
                'title' => $title,
                'message' => $message,
                'action_url' => '/seller/dashboard/offers',
                'action_label' => 'View Offer',
                'data' => ['offer_id' => $offer->id],
            ]);
        }
    }
}
