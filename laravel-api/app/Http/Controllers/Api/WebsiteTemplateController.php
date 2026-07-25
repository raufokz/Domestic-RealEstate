<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebsiteTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WebsiteTemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = WebsiteTemplate::query();

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        $templates = $query->orderBy('name')->get();
        return ApiResponse::ok($templates, 'Templates loaded');
    }

    public function show(int $id): JsonResponse
    {
        $template = WebsiteTemplate::findOrFail($id);
        return ApiResponse::ok($template, 'OK');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:website_templates,slug',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|string|max:255',
            'config' => 'nullable|array',
            'category' => 'required|string|in:real_estate,agency,portfolio,landing',
            'is_active' => 'nullable|boolean',
            'is_premium' => 'nullable|boolean',
        ]);

        $template = WebsiteTemplate::create($validated);
        return ApiResponse::ok($template, 'Template created', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $template = WebsiteTemplate::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:website_templates,slug,' . $id,
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|string|max:255',
            'config' => 'nullable|array',
            'category' => 'sometimes|string|in:real_estate,agency,portfolio,landing',
            'is_active' => 'nullable|boolean',
            'is_premium' => 'nullable|boolean',
        ]);

        $template->update($validated);
        return ApiResponse::ok($template, 'OK');
    }

    public function destroy(int $id): JsonResponse
    {
        $template = WebsiteTemplate::findOrFail($id);
        $template->delete();
        return ApiResponse::ok(null, 'Template deleted');
    }

    public function duplicate(int $id): JsonResponse
    {
        $original = WebsiteTemplate::findOrFail($id);

        $clone = $original->replicate();
        $clone->name = $original->name . ' (Copy)';
        $clone->slug = Str::slug($original->name . ' copy-' . Str::random(5));
        $clone->is_active = false;
        $clone->save();

        return ApiResponse::ok($clone, 'Template duplicated', 201);
    }
}
