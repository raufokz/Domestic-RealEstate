<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MortgageApplication;
use App\Models\Offer;
use Illuminate\Http\JsonResponse;

class PortalController extends Controller
{
    public function brokerDashboard(): JsonResponse
    {
        return response()->json([
            'team_agents' => 0,
            'team_listings' => 0,
            'team_revenue' => 0,
            'team_leads' => 0,
            'top_agents' => [],
            'team_activity' => [],
            // agent_profiles has no broker_id FK yet — only free-text brokerage_name/broker_name —
            // so a real "my team" roster can't be derived until that relation exists.
            'team_linked' => false,
        ]);
    }

    /** Platform-wide mortgage applications (real, buyer-self-reported via
     * BuyerPortalController::storeMortgageApplication) — NOT scoped to an
     * individual lender since `lender_name` is free text, not an FK to a
     * `role=lender` account, so there is no "my applications" concept yet. */
    public function lenderDashboard(): JsonResponse
    {
        $applications = MortgageApplication::with('user:id,name,email')->latest('applied_at')->limit(10)->get();

        return response()->json([
            'total_applications' => MortgageApplication::count(),
            'pending_applications' => MortgageApplication::where('status', 'applied')->count(),
            'approved_applications' => MortgageApplication::where('status', 'approved')->count(),
            'total_requested_volume' => (int) MortgageApplication::whereIn('status', ['applied', 'pre_approved', 'approved'])->sum('amount'),
            'lender_linked' => false,
            'recent_applications' => $applications->map(fn (MortgageApplication $a) => [
                'id' => $a->id,
                'borrower' => $a->user?->name ?? 'Unknown',
                'lender' => $a->lender_name,
                'amount' => (int) $a->amount,
                'rate' => $a->rate,
                'status' => str($a->status)->headline(),
                'date' => $a->applied_at->format('M j, Y'),
            ]),
        ]);
    }

    /** Platform-wide accepted offers stand in for "closings in progress" —
     * there is no dedicated title/escrow-order table, but every accepted
     * offer genuinely needs title work, so this is real data, not invented.
     * Not scoped to an individual title company (no such account link exists
     * yet — same limitation as lenderDashboard). */
    public function titleDashboard(): JsonResponse
    {
        $accepted = Offer::with(['property', 'buyer:id,name'])
            ->where('status', 'accepted')
            ->latest('responded_at')
            ->get();

        $completedThisMonth = Offer::where('status', 'accepted')
            ->whereNotNull('closing_date')
            ->whereBetween('closing_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();

        return response()->json([
            'active_closings' => $accepted->count(),
            'completed_this_month' => $completedThisMonth,
            'title_linked' => false,
            'recent_closings' => $accepted->take(10)->map(fn (Offer $o) => [
                'id' => $o->id,
                'property' => collect([$o->property?->address, $o->property?->city])->filter()->implode(', ') ?: 'Unknown property',
                'buyer' => $o->buyer?->name ?? 'Unknown',
                'amount' => (int) $o->current_amount,
                'closing_date' => optional($o->closing_date)->format('M j, Y'),
                'status' => 'Accepted — Pending Closing',
            ]),
        ]);
    }

}
