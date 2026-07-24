<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PortalController extends Controller
{
    public function buyerSearches(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
        ]);
    }

    public function destroyBuyerSearch($id): JsonResponse
    {
        return response()->json(['message' => 'Search deleted']);
    }

    public function buyerOffers(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
        ]);
    }

    public function buyerMortgage(): JsonResponse
    {
        return response()->json(['data' => []]);
    }

    public function buyerMessages(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
        ]);
    }

    public function storeBuyerMessage($request): JsonResponse
    {
        return response()->json(['message' => 'Message sent'], 201);
    }

    public function buyerDocuments(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
        ]);
    }

    public function buyerAppointments(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
        ]);
    }

    public function sellerAppointments(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
        ]);
    }

    public function sellerValuations(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
        ]);
    }

    public function sellerOffers(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
        ]);
    }

    public function sellerDocuments(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
        ]);
    }

    public function investorOpportunities(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
        ]);
    }

    public function investorDocuments(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
        ]);
    }

    public function investorAnalytics(): JsonResponse
    {
        return response()->json([
            'properties_viewed' => 0,
            'saved_properties' => 0,
            'offers_made' => 0,
            'total_invested' => 0,
        ]);
    }

    public function investorAlerts(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
        ]);
    }

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

    public function lenderDashboard(): JsonResponse
    {
        return response()->json([
            'total_loans' => 0,
            'pending_applications' => 0,
            'approved_loans' => 0,
            'total_volume' => 0,
        ]);
    }

    public function titleDashboard(): JsonResponse
    {
        return response()->json([
            'active_closings' => 0,
            'completed_this_month' => 0,
            'pending_documents' => 0,
            'revenue' => 0,
        ]);
    }

    public function superAdminDashboard(): JsonResponse
    {
        return response()->json([
            'total_users' => 0,
            'total_properties' => 0,
            'total_revenue' => 0,
            'system_health' => 'good',
        ]);
    }

    public function staffDashboard(): JsonResponse
    {
        return response()->json([
            'assigned_tasks' => 0,
            'completed_tasks' => 0,
            'pending_tasks' => 0,
            'open_tickets' => 0,
        ]);
    }

    public function staffDashboardTasks(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
        ]);
    }
}
