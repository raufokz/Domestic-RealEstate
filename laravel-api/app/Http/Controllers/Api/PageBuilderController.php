<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentBlock;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\PageTemplate;
use App\Support\ApiResponse;
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
        $templates = PageTemplate::orderBy('name')->get();
        return ApiResponse::ok($templates);
    }

    public function storePageTemplate(Request $request): JsonResponse {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'sections_config' => 'nullable|array',
        ]);

        $template = PageTemplate::create($validated);
        return ApiResponse::ok($template, 'Template created', 201);
    }

    public function destroyPageTemplate($id): JsonResponse {
        $template = PageTemplate::findOrFail($id);
        $template->delete();
        return ApiResponse::ok(null, 'Template deleted');
    }

    public function usePageTemplate(Request $request, $id): JsonResponse {
        $template = PageTemplate::findOrFail($id);
        $pageId = $request->input('page_id');
        if (!$pageId) {
            return ApiResponse::fail('page_id is required to apply template.', 'missing_page_id', 422);
        }
        $page = Page::findOrFail($pageId);

        $sections = $template->sections_config ?? [];
        foreach ($sections as $index => $sec) {
            PageSection::create([
                'page_id' => $page->id,
                'type' => $sec['type'] ?? 'hero',
                'name' => $sec['name'] ?? 'Section',
                'settings' => $sec['settings'] ?? [],
                'sort_order' => $index,
            ]);
        }

        return ApiResponse::ok(['page_id' => $page->id, 'sections_added' => count($sections)], 'Template applied');
    }

    public function contentBlocks(): JsonResponse {
        $blocks = ContentBlock::orderBy('title')->get();
        return ApiResponse::ok($blocks);
    }

    public function updateContentBlocks(Request $request): JsonResponse {
        $blocks = $request->input('blocks', []);
        foreach ($blocks as $blockData) {
            if (!empty($blockData['key_name'])) {
                ContentBlock::updateOrCreate(
                    ['key_name' => $blockData['key_name']],
                    [
                        'title' => $blockData['title'] ?? $blockData['key_name'],
                        'content' => $blockData['content'] ?? null,
                        'type' => $blockData['type'] ?? 'text',
                        'settings' => $blockData['settings'] ?? [],
                    ]
                );
            }
        }
        return ApiResponse::ok(ContentBlock::all(), 'Content blocks updated');
    }
}
