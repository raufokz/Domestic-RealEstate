<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FooterLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FooterLinkController extends Controller
{
    public function getLinks(): JsonResponse
    {
        $links = FooterLink::active()->ordered()->get()->groupBy('group_name');
        return response()->json($links);
    }

    public function getAll(): JsonResponse
    {
        $links = FooterLink::orderBy('group_name')->orderBy('sort_order')->get();
        return response()->json($links);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'group_name' => 'nullable|string|max:255',
            'target' => 'nullable|string|in:_self,_blank',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $link = FooterLink::create($validated);
        return response()->json($link, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $link = FooterLink::findOrFail($id);

        $validated = $request->validate([
            'label' => 'sometimes|string|max:255',
            'url' => 'sometimes|string|max:255',
            'group_name' => 'nullable|string|max:255',
            'target' => 'nullable|string|in:_self,_blank',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $link->update($validated);
        return response()->json($link);
    }

    public function destroy(int $id): JsonResponse
    {
        $link = FooterLink::findOrFail($id);
        $link->delete();
        return response()->json(['message' => 'Footer link deleted']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:footer_links,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['items'] as $item) {
            FooterLink::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Footer links reordered']);
    }

    public function toggleActive(int $id): JsonResponse
    {
        $link = FooterLink::findOrFail($id);
        $link->update(['is_active' => !$link->is_active]);
        return response()->json($link);
    }
}
