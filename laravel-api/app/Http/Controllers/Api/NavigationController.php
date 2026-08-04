<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NavigationMenu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NavigationController extends Controller
{
    public function getHeaderMenu(): JsonResponse
    {
        $items = cache()->remember('nav_header_items', 86400, function () {
            return NavigationMenu::active()->header()->ordered()->get();
        });
        return response()->json($items);
    }

    public function getFooterMenu(): JsonResponse
    {
        $items = cache()->remember('nav_footer_items', 86400, function () {
            return NavigationMenu::active()->footer()->ordered()->get();
        });
        return response()->json($items);
    }

    public function getAll(): JsonResponse
    {
        $items = NavigationMenu::orderBy('position')->orderBy('sort_order')->get();
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'target' => 'nullable|string|in:_self,_blank',
            'position' => 'required|string|in:header,footer,both',
            'group_name' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'children' => 'nullable|array',
            'icon' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
        ]);

        $item = NavigationMenu::create($validated);
        return response()->json($item, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $item = NavigationMenu::findOrFail($id);

        $validated = $request->validate([
            'label' => 'sometimes|string|max:255',
            'url' => 'nullable|string|max:255',
            'target' => 'nullable|string|in:_self,_blank',
            'position' => 'sometimes|string|in:header,footer,both',
            'group_name' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'children' => 'nullable|array',
            'icon' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
        ]);

        $item->update($validated);
        return response()->json($item);
    }

    public function destroy(int $id): JsonResponse
    {
        $item = NavigationMenu::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Navigation item deleted']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:navigation_menus,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['items'] as $item) {
            NavigationMenu::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Navigation items reordered']);
    }

    public function toggleActive(int $id): JsonResponse
    {
        $item = NavigationMenu::findOrFail($id);
        $item->update(['is_active' => !$item->is_active]);
        return response()->json($item);
    }
}
