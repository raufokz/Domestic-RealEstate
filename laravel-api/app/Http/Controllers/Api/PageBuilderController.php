<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PageBuilderController extends Controller
{
    public function pages(): JsonResponse {
        $pages = Page::select('id', 'title', 'slug', 'status')->orderBy('title')->get();
        return response()->json(['data' => $pages]);
    }

    public function pageSections($pageId): JsonResponse {
        $page = Page::findOrFail($pageId);
        $sections = $page->sections()->get()
            ->map(fn (PageSection $s) => [
                'id' => $s->id,
                'type' => $s->type,
                'name' => $s->name,
                'settings' => $s->settings ?? (object) [],
            ]);
        return response()->json(['data' => $sections]);
    }

    public function storePageSection(Request $request, $pageId): JsonResponse {
        $page = Page::findOrFail($pageId);
        $validated = $request->validate([
            'type' => 'required|string|max:100',
            'name' => 'required|string|max:255',
            'settings' => 'nullable|array',
        ]);

        $nextOrder = (int) $page->sections()->max('sort_order') + 1;
        $section = PageSection::create([
            'page_id' => $page->id,
            'type' => $validated['type'],
            'name' => $validated['name'],
            'settings' => $validated['settings'] ?? [],
            'sort_order' => $nextOrder,
        ]);

        return response()->json([
            'message' => 'Section added',
            'data' => [
                'id' => $section->id,
                'type' => $section->type,
                'name' => $section->name,
                'settings' => $section->settings ?? (object) [],
            ],
        ], 201);
    }

    public function reorderPageSections(Request $request, $pageId): JsonResponse {
        $page = Page::findOrFail($pageId);
        $validated = $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer',
        ]);

        DB::transaction(function () use ($page, $validated) {
            foreach ($validated['order'] as $index => $sectionId) {
                $page->sections()->whereKey($sectionId)->update(['sort_order' => $index]);
            }
        });

        return response()->json(['message' => 'Sections reordered']);
    }

    public function updatePageSection(Request $request, $pageId, $sectionId): JsonResponse {
        $page = Page::findOrFail($pageId);
        $section = $page->sections()->whereKey($sectionId)->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|max:100',
            'settings' => 'sometimes|array',
        ]);

        $section->update($validated);

        return response()->json([
            'message' => 'Section updated',
            'data' => [
                'id' => $section->id,
                'type' => $section->type,
                'name' => $section->name,
                'settings' => $section->settings ?? (object) [],
            ],
        ]);
    }

    public function destroyPageSection($pageId, $sectionId): JsonResponse {
        $page = Page::findOrFail($pageId);
        $section = $page->sections()->whereKey($sectionId)->firstOrFail();
        $section->delete();
        return response()->json(['message' => 'Section deleted']);
    }

    public function publishPage(Request $request, $pageId): JsonResponse {
        $page = Page::findOrFail($pageId);
        $validated = $request->validate([
            'status' => 'sometimes|in:draft,published',
        ]);
        $page->status = $validated['status'] ?? 'published';
        $page->save();
        return response()->json(['message' => 'Page ' . $page->status, 'data' => ['id' => $page->id, 'status' => $page->status]]);
    }

    public function pageTemplates(): JsonResponse {
        return response()->json(['data' => []]);
    }

    public function storePageTemplate(Request $request): JsonResponse {
        return response()->json(['message' => 'Template created', 'data' => ['id' => 1] + $request->only(['name'])], 201);
    }

    public function destroyPageTemplate($id): JsonResponse {
        return response()->json(['message' => 'Template deleted']);
    }

    public function usePageTemplate($id): JsonResponse {
        return response()->json(['message' => 'Template applied', 'data' => ['id' => 1]]);
    }

    public function contentBlocks(): JsonResponse {
        return response()->json(['data' => []]);
    }

    public function updateContentBlocks(Request $request): JsonResponse {
        return response()->json(['message' => 'Content blocks updated']);
    }
}
