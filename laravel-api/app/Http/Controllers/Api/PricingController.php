<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeadPackage;
use App\Models\MembershipPlan;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Admin CRUD for MembershipPlan/LeadPackage — these are a separate,
 * role-quota-based pricing model (lead_quota/listing_limit/territory) from
 * the agent-registration plan tiers in AgentProfile::PLAN_TIERS /
 * nextjs-frontend's agentPlans.ts (cap/category-based service selection,
 * actively enforced at /register — left untouched, no dollar figures here
 * change anything the public /pricing page shows). This just makes the
 * previously admin-unreachable MembershipPlan/LeadPackage rows manageable
 * instead of permanently empty/static.
 */
class PricingController extends Controller
{
    public function plans(): JsonResponse
    {
        return ApiResponse::ok(MembershipPlan::orderBy('price_monthly')->get());
    }

    public function storePlan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'role' => 'nullable|string|max:50',
            'lead_quota' => 'nullable|integer|min:0',
            'listing_limit' => 'nullable|integer|min:0',
            'territory_coverage' => 'nullable|string|max:255',
            'priority_level' => 'nullable|integer|min:0',
            'price_monthly' => 'nullable|numeric|min:0',
            'price_yearly' => 'nullable|numeric|min:0',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'is_popular' => 'nullable|boolean',
            'badge' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(4);
        $validated['status'] = $validated['status'] ?? 'active';

        $plan = MembershipPlan::create($validated);

        return ApiResponse::ok($plan, 'Plan created.', 201);
    }

    public function updatePlan(Request $request, int $id): JsonResponse
    {
        $plan = MembershipPlan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'role' => 'nullable|string|max:50',
            'lead_quota' => 'nullable|integer|min:0',
            'listing_limit' => 'nullable|integer|min:0',
            'territory_coverage' => 'nullable|string|max:255',
            'priority_level' => 'nullable|integer|min:0',
            'price_monthly' => 'nullable|numeric|min:0',
            'price_yearly' => 'nullable|numeric|min:0',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'is_popular' => 'nullable|boolean',
            'badge' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $plan->update($validated);

        return ApiResponse::ok($plan->fresh(), 'Plan updated.');
    }

    public function destroyPlan(int $id): JsonResponse
    {
        MembershipPlan::findOrFail($id)->delete();

        return ApiResponse::ok(null, 'Plan deleted.');
    }

    public function leadPackages(): JsonResponse
    {
        return ApiResponse::ok(LeadPackage::orderBy('price')->get());
    }

    public function storeLeadPackage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'lead_count' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'price_per_lead' => 'nullable|numeric|min:0',
            'is_popular' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(4);
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['price_per_lead'] = $validated['price_per_lead']
            ?? round($validated['price'] / max($validated['lead_count'], 1), 2);

        $package = LeadPackage::create($validated);

        return ApiResponse::ok($package, 'Lead package created.', 201);
    }

    public function updateLeadPackage(Request $request, int $id): JsonResponse
    {
        $package = LeadPackage::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'lead_count' => 'sometimes|required|integer|min:1',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'price_per_lead' => 'nullable|numeric|min:0',
            'is_popular' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $package->update($validated);

        return ApiResponse::ok($package->fresh(), 'Lead package updated.');
    }

    public function destroyLeadPackage(int $id): JsonResponse
    {
        LeadPackage::findOrFail($id)->delete();

        return ApiResponse::ok(null, 'Lead package deleted.');
    }
}
