<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SeoLandingPage;
use App\Models\Testimonial;
use App\Models\Faq;
use Illuminate\Http\Request;

class SeoController extends Controller
{
    public function landingPages() {
        return response()->json(SeoLandingPage::where('status', 'published')->paginate(12));
    }

    public function showLandingPage($slug) {
        $data = cache()->remember('seo_landing_page_' . $slug, 86400, function () use ($slug) {
            return SeoLandingPage::where('slug', $slug)->where('status', 'published')->firstOrFail();
        });
        return response()->json($data);
    }

    public function testimonials() {
        $data = cache()->remember('seo_testimonials', 86400, function () {
            return Testimonial::orderBy('sort_order')->get();
        });
        return response()->json($data);
    }

    public function faqs() {
        $data = cache()->remember('seo_faqs', 86400, function () {
            return Faq::where('is_active', true)->orderBy('sort_order')->get();
        });
        return response()->json($data);
    }

    public function adminIndex(Request $request)
    {
        $query = SeoLandingPage::query();
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('slug', 'like', "%{$request->search}%")
                  ->orWhere('city', 'like', "%{$request->search}%");
            });
        }
        if ($request->city) $query->where('city', $request->city);
        if ($request->status) $query->where('status', $request->status);
        $pages = $query->latest()->paginate($request->get('per_page', 15));
        return response()->json($pages);
    }

    public function storeLandingPage(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'body_content' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:500',
        ]);

        $slug = $request->slug ?: \Illuminate\Support\Str::slug($request->title);

        $page = SeoLandingPage::create([
            'title' => $request->title,
            'slug' => $slug,
            'city' => $request->city,
            'state' => $request->state,
            'hero' => $request->hero ?? $request->title,
            'body_content' => $request->body_content ?? '',
            'faqs' => $request->faqs ?? [],
            'seo_title' => $request->seo_title ?? $request->title,
            'meta_description' => $request->meta_description ?? '',
            'meta_keywords' => $request->meta_keywords ?? '',
            'status' => 'published',
        ]);

        return response()->json($page, 201);
    }

    public function showLandingPageAdmin($id)
    {
        $page = SeoLandingPage::findOrFail($id);
        return response()->json($page);
    }

    public function updateLandingPage(Request $request, $id)
    {
        $page = SeoLandingPage::findOrFail($id);
        $data = $request->only([
            'title', 'slug', 'city', 'state', 'hero', 'body_content', 'faqs',
            'seo_title', 'meta_description', 'meta_keywords', 'status',
        ]);
        $page->update($data);
        return response()->json($page);
    }

    public function destroyLandingPage($id)
    {
        SeoLandingPage::findOrFail($id)->delete();
        return response()->json(['message' => 'SEO page deleted']);
    }
}
