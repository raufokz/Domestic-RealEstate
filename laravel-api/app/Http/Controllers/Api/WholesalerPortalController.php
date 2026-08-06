<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashBuyer;
use App\Models\WholesaleDeal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Wholesaler Portal — every query scoped to the signed-in wholesaler.
 * Access enforced at the route level via role:wholesaler,admin,super_admin,
 * mirroring AgentPortalController's ownership-scoping pattern.
 */
class WholesalerPortalController extends Controller
{
    private function isPrivileged($user): bool
    {
        return in_array($user->role, ['admin', 'super_admin'], true);
    }

    private function myDeals($user)
    {
        return $this->isPrivileged($user) ? WholesaleDeal::query() : WholesaleDeal::where('wholesaler_id', $user->id);
    }

    /** Own buyers + the shared public-signup pool. */
    private function visibleBuyers($user)
    {
        if ($this->isPrivileged($user)) {
            return CashBuyer::query();
        }
        return CashBuyer::where('wholesaler_id', $user->id)->orWhereNull('wholesaler_id');
    }

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $deals = $this->myDeals($user);

        $activeDeals = (clone $deals)->whereNotIn('status', ['draft', 'closed'])->count();
        $dealsClosed = (clone $deals)->where('status', 'closed')->count();
        $avgAssignmentFee = (clone $deals)->whereNotNull('assignment_fee')->avg('assignment_fee');
        $totalBuyers = $this->visibleBuyers($user)->count();
        $recentDeals = (clone $deals)->latest()->limit(5)->get();

        return response()->json([
            'stats' => [
                'active_deals' => $activeDeals,
                'total_buyers' => $totalBuyers,
                'deals_closed' => $dealsClosed,
                'avg_assignment_fee' => $avgAssignmentFee ? round((float) $avgAssignmentFee, 2) : 0,
            ],
            'recent_deals' => $recentDeals,
        ]);
    }

    public function deals(Request $request): JsonResponse
    {
        $query = $this->myDeals($request->user());
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        return response()->json(['data' => $query->with('assignedBuyer')->latest()->get()]);
    }

    public function storeDeal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip' => 'nullable|string|max:20',
            'property_type' => 'nullable|string|max:100',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|numeric|min:0',
            'sqft' => 'nullable|integer|min:0',
            'year_built' => 'nullable|integer|min:1800',
            'asking_price' => 'nullable|numeric|min:0',
            'arv' => 'nullable|numeric|min:0',
            'repair_estimate' => 'nullable|numeric|min:0',
            'assignment_fee' => 'nullable|numeric|min:0',
            'monthly_rent_estimate' => 'nullable|numeric|min:0',
            'deal_source' => 'nullable|string|max:100',
            'condition' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'repair_details' => 'nullable|string',
            'status' => 'nullable|in:draft,new',
        ]);

        $validated['wholesaler_id'] = $request->user()->id;
        $validated['status'] = $validated['status'] ?? 'new';

        $deal = WholesaleDeal::create($validated);

        return response()->json(['message' => 'Deal saved.', 'data' => $deal], 201);
    }

    public function showDeal(Request $request, int $id): JsonResponse
    {
        $deal = $this->myDeals($request->user())->with('assignedBuyer')->findOrFail($id);
        return response()->json(['data' => $deal]);
    }

    public function updateDeal(Request $request, int $id): JsonResponse
    {
        $deal = $this->myDeals($request->user())->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'address' => 'sometimes|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip' => 'nullable|string|max:20',
            'property_type' => 'nullable|string|max:100',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|numeric|min:0',
            'sqft' => 'nullable|integer|min:0',
            'year_built' => 'nullable|integer|min:1800',
            'asking_price' => 'nullable|numeric|min:0',
            'arv' => 'nullable|numeric|min:0',
            'repair_estimate' => 'nullable|numeric|min:0',
            'assignment_fee' => 'nullable|numeric|min:0',
            'monthly_rent_estimate' => 'nullable|numeric|min:0',
            'deal_source' => 'nullable|string|max:100',
            'condition' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'repair_details' => 'nullable|string',
            'status' => 'sometimes|in:draft,new,under_contract,assigned,closed',
            'assigned_buyer_id' => 'nullable|exists:cash_buyers,id',
        ]);

        if (($validated['status'] ?? null) === 'assigned' && empty($validated['assigned_buyer_id']) && !$deal->assigned_buyer_id) {
            return response()->json(['message' => 'Select a buyer before marking this deal as assigned.'], 422);
        }

        if (!empty($validated['assigned_buyer_id'])) {
            $buyerVisible = $this->visibleBuyers($request->user())->where('id', $validated['assigned_buyer_id'])->exists();
            if (!$buyerVisible) {
                return response()->json(['message' => 'That buyer is not available to assign.'], 422);
            }
        }

        $deal->update($validated);

        return response()->json(['message' => 'Deal updated.', 'data' => $deal->fresh('assignedBuyer')]);
    }

    public function buyers(Request $request): JsonResponse
    {
        $buyers = $this->visibleBuyers($request->user())->latest()->get();
        return response()->json(['data' => $buyers]);
    }

    public function storeBuyer(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'preferred_areas' => 'nullable|array',
            'property_types' => 'nullable|array',
            'criteria' => 'nullable|string',
        ]);

        $validated['wholesaler_id'] = $request->user()->id;
        $validated['source'] = 'manual';
        $validated['last_active_at'] = now();

        $buyer = CashBuyer::create($validated);

        return response()->json(['message' => 'Buyer added.', 'data' => $buyer], 201);
    }

    public function updateBuyer(Request $request, int $id): JsonResponse
    {
        // Editing is restricted to the wholesaler's own privately-added buyers —
        // never the shared public-signup pool (wholesaler_id null).
        $buyer = CashBuyer::where('wholesaler_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'phone' => 'nullable|string|max:50',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'preferred_areas' => 'nullable|array',
            'property_types' => 'nullable|array',
            'criteria' => 'nullable|string',
        ]);

        $buyer->update($validated);

        return response()->json(['message' => 'Buyer updated.', 'data' => $buyer->fresh()]);
    }
}
