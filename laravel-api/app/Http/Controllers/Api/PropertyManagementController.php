<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PropertyManagementController extends Controller
{
    public function propertyTypes(): JsonResponse {
        $types = DB::table('property_types')->select('id', 'name', 'slug', 'icon', 'is_active', 'sort_order')->get();
        return response()->json(['data' => $types]);
    }

    public function storePropertyType(Request $request): JsonResponse {
        $validated = $request->validate(['name' => 'required|string|max:255', 'description' => 'nullable|string', 'icon' => 'nullable|string']);
        $id = DB::table('property_types')->insertGetId([
            'name' => $validated['name'],
            'slug' => \Illuminate\Support\Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        return response()->json(['message' => 'Property type created', 'data' => DB::table('property_types')->find($id)], 201);
    }

    public function updatePropertyType(Request $request, $id): JsonResponse {
        $validated = $request->validate(['name' => 'sometimes|string|max:255', 'description' => 'nullable|string', 'icon' => 'nullable|string', 'is_active' => 'sometimes|boolean']);
        DB::table('property_types')->where('id', $id)->update(array_merge($validated, ['updated_at' => now()]));
        return response()->json(['message' => 'Property type updated', 'data' => DB::table('property_types')->find($id)]);
    }

    public function destroyPropertyType($id): JsonResponse {
        DB::table('property_types')->where('id', $id)->delete();
        return response()->json(['message' => 'Property type deleted']);
    }

    public function propertyCategories(): JsonResponse {
        $categories = PropertyCategory::withCount('propertyTypes')
            ->orderBy('sort_order')->orderBy('name')->get()
            ->map(fn (PropertyCategory $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'description' => $c->description,
                'icon' => $c->icon,
                'is_active' => $c->is_active,
                'status' => $c->is_active ? 'active' : 'inactive',
                'types_count' => $c->property_types_count,
                'sort_order' => $c->sort_order,
            ]);
        return ApiResponse::ok($categories, 'Property categories loaded');
    }

    public function storePropertyCategory(Request $request): JsonResponse {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'status' => 'nullable|string|in:active,inactive',
            'is_active' => 'nullable|boolean',
        ]);

        $category = PropertyCategory::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'sort_order' => $validated['sort_order'] ?? (PropertyCategory::max('sort_order') + 1),
            'is_active' => $validated['is_active'] ?? (($validated['status'] ?? 'active') === 'active'),
        ]);

        return ApiResponse::ok($category, 'Property category created', 201);
    }

    public function updatePropertyCategory(Request $request, $id): JsonResponse {
        $category = PropertyCategory::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'status' => 'nullable|string|in:active,inactive',
            'is_active' => 'nullable|boolean',
        ]);

        if (isset($validated['status'])) {
            $validated['is_active'] = $validated['status'] === 'active';
        }
        if (isset($validated['name']) && ! isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        unset($validated['status']);

        $category->update($validated);
        return ApiResponse::ok($category->fresh(), 'Property category updated');
    }

    public function destroyPropertyCategory($id): JsonResponse {
        $category = PropertyCategory::findOrFail($id);
        $category->delete();
        return ApiResponse::ok(null, 'Property category deleted');
    }

    public function amenities(): JsonResponse {
        $amenities = \App\Models\Amenity::orderBy('name')->get();
        return ApiResponse::ok($amenities);
    }

    public function storeAmenity(Request $request): JsonResponse {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);
        $validated['slug'] = Str::slug($validated['name']);
        $amenity = \App\Models\Amenity::create($validated);
        return ApiResponse::ok($amenity, 'Amenity created', 201);
    }

    public function updateAmenity(Request $request, $id): JsonResponse {
        $amenity = \App\Models\Amenity::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'icon' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);
        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        $amenity->update($validated);
        return ApiResponse::ok($amenity->fresh(), 'Amenity updated');
    }

    public function destroyAmenity($id): JsonResponse {
        $amenity = \App\Models\Amenity::findOrFail($id);
        $amenity->delete();
        return ApiResponse::ok(null, 'Amenity deleted');
    }

    public function propertiesAnalytics(Request $request): JsonResponse {
        // Real aggregation from the property_analytics table (views/inquiries/clicks per day).
        $range = $request->query('range', '30d');
        $days = (int) filter_var($range, FILTER_SANITIZE_NUMBER_INT) ?: 30;
        $since = now()->subDays($days)->toDateString();

        $base = DB::table('property_analytics')->where('date', '>=', $since);

        $totalViews = (int) (clone $base)->sum('views');
        $totalInquiries = (int) (clone $base)->sum('inquiries');
        $totalClicks = (int) (clone $base)->sum('clicks');
        $trackedProperties = (int) (clone $base)->distinct('property_id')->count('property_id');

        $top = (clone $base)
            ->select('property_id', DB::raw('SUM(views) as views'), DB::raw('SUM(inquiries) as inquiries'), DB::raw('SUM(clicks) as clicks'))
            ->groupBy('property_id')
            ->orderByDesc('views')
            ->limit(10)
            ->get();

        $titles = Property::whereIn('id', $top->pluck('property_id'))->pluck('title', 'id');
        $rows = $top->map(fn ($r) => [
            'property_id' => $r->property_id,
            'title' => $titles[$r->property_id] ?? ('Property #' . $r->property_id),
            'views' => (int) $r->views,
            'inquiries' => (int) $r->inquiries,
            'clicks' => (int) $r->clicks,
        ])->values();

        return ApiResponse::ok([
            'stats' => [
                'total_views' => $totalViews,
                'total_inquiries' => $totalInquiries,
                'total_clicks' => $totalClicks,
                'tracked_properties' => $trackedProperties,
            ],
            'data' => $rows,
            'has_data' => $trackedProperties > 0,
            'period' => $days . 'd',
        ], 'Property analytics loaded');
    }
}
