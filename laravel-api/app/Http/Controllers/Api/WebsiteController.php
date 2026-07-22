<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Website;
use App\Models\WebsitePage;
use App\Models\WebsiteDomain;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WebsiteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Website::with(['user', 'domains', 'pages']);
        if ($request->user()->role !== 'super_admin') {
            $query->where('user_id', $request->user()->id);
        }
        return ApiResponse::ok($query->latest()->get(), 'Websites loaded');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'template' => 'nullable|string',
            'theme_config' => 'nullable|array',
        ]);

        $website = Website::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'slug' => Str::slug($validated['name']),
            'status' => 'draft',
        ]);

        return ApiResponse::ok($website, 'Website created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $website = Website::with(['pages', 'domains', 'user'])->findOrFail($id);
        return ApiResponse::ok($website, 'Website loaded');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $website = Website::findOrFail($id);
        $data = $request->only(['name', 'template', 'status', 'subdomain', 'self_editing_enabled', 'analytics_config']);

        // Shallow-merge theme_config so partial updates (e.g. SEO tab, settings tab)
        // never clobber unrelated keys already stored on the website.
        if ($request->has('theme_config') && is_array($request->input('theme_config'))) {
            $data['theme_config'] = array_merge(
                (array) $website->theme_config,
                $request->input('theme_config')
            );
        }

        $website->update($data);
        return ApiResponse::ok($website->fresh(), 'Website updated');
    }

    public function destroy(int $id): JsonResponse
    {
        Website::findOrFail($id)->delete();
        return ApiResponse::ok(null, 'Website deleted');
    }

    public function duplicate(int $id): JsonResponse
    {
        $original = Website::with(['pages', 'domains'])->findOrFail($id);
        $clone = Website::create([
            'user_id' => $original->user_id,
            'name' => $original->name . ' (Copy)',
            'slug' => Str::slug($original->name . '-copy-' . time()),
            'template' => $original->template,
            'theme_config' => $original->theme_config,
            'status' => 'draft',
        ]);

        foreach ($original->pages as $page) {
            WebsitePage::create([
                ...$page->toArray(),
                'id' => null,
                'website_id' => $clone->id,
            ]);
        }

        return ApiResponse::ok($clone, 'Website duplicated', 201);
    }

    public function deploy(int $id): JsonResponse
    {
        $website = Website::findOrFail($id);
        $website->update(['status' => 'live', 'deployed_at' => now()]);
        return ApiResponse::ok($website, 'Website deployed');
    }

    public function suspend(int $id): JsonResponse
    {
        $website = Website::findOrFail($id);
        $website->update(['status' => 'suspended']);
        return ApiResponse::ok($website, 'Website suspended');
    }

    /**
     * Real, honest analytics for a website: structural counts derived from the
     * database. Traffic metrics are only reported if a tracking source exists;
     * we never fabricate visit/pageview numbers.
     */
    public function analytics(int $id): JsonResponse
    {
        $website = Website::with(['pages', 'domains'])->findOrFail($id);

        $topPages = $website->pages
            ->sortByDesc('sort_order')
            ->take(10)
            ->map(fn (WebsitePage $p) => [
                'title' => $p->title,
                'slug' => $p->slug,
                'is_published' => (bool) ($p->is_published ?? false),
            ])
            ->values();

        return ApiResponse::ok([
            'website' => [
                'id' => $website->id,
                'name' => $website->name,
                'status' => $website->status,
                'deployed_at' => optional($website->deployed_at)->toIso8601String(),
            ],
            'totals' => [
                'pages' => $website->pages->count(),
                'published_pages' => $website->pages->where('is_published', true)->count(),
                'domains' => $website->domains->count(),
                'verified_domains' => $website->domains->where('status', 'verified')->count(),
            ],
            // No third-party analytics is connected, so traffic data is not available.
            // The UI shows an honest empty state instead of fabricated charts.
            'traffic_available' => false,
            'top_pages' => $topPages,
            'referrers' => [],
        ], 'Website analytics loaded');
    }

    public function storePage(Request $request, int $websiteId): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'content' => 'nullable|string',
            'sections' => 'nullable|array',
            'seo_config' => 'nullable|array',
            'sort_order' => 'nullable|integer',
        ]);

        $page = WebsitePage::create([...$validated, 'website_id' => $websiteId]);
        return ApiResponse::ok($page, 'Page created', 201);
    }

    public function updatePage(Request $request, int $websiteId, int $pageId): JsonResponse
    {
        $page = WebsitePage::where('website_id', $websiteId)->findOrFail($pageId);
        $page->update($request->only(['title', 'slug', 'content', 'sections', 'seo_config', 'sort_order', 'is_published']));
        return ApiResponse::ok($page, 'Page updated');
    }

    public function destroyPage(int $websiteId, int $pageId): JsonResponse
    {
        WebsitePage::where('website_id', $websiteId)->findOrFail($pageId)->delete();
        return ApiResponse::ok(null, 'Page deleted');
    }

    public function storeDomain(Request $request, int $websiteId): JsonResponse
    {
        $validated = $request->validate([
            'domain' => 'required|string|max:255',
            'type' => 'required|string|in:subdomain,custom',
        ]);

        $domain = WebsiteDomain::create([
            ...$validated,
            'website_id' => $websiteId,
            'status' => 'pending',
            'dns_records' => $validated['type'] === 'custom' ? [
                ['type' => 'A', 'name' => '@', 'value' => '104.21.32.100', 'ttl' => 3600],
                ['type' => 'CNAME', 'name' => 'www', 'value' => 'domesticrealestate.us', 'ttl' => 3600],
            ] : null,
        ]);

        return ApiResponse::ok($domain, 'Domain added', 201);
    }

    public function verifyDomain(int $websiteId, int $domainId): JsonResponse
    {
        $domain = WebsiteDomain::where('website_id', $websiteId)->findOrFail($domainId);
        $domain->update(['status' => 'verified', 'verified_at' => now()]);
        return ApiResponse::ok($domain, 'Domain verified');
    }

    public function destroyDomain(int $websiteId, int $domainId): JsonResponse
    {
        WebsiteDomain::where('website_id', $websiteId)->findOrFail($domainId)->delete();
        return ApiResponse::ok(null, 'Domain removed');
    }
}
