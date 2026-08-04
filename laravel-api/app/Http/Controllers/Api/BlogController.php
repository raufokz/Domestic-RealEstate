<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\BlogImage;
use App\Services\ImageProcessingService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function __construct(protected ImageProcessingService $imageProcessor)
    {
    }

    private function checkAdmin(): void
    {
        $user = Auth::user();
        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    // ---------------------------------------------------------------
    // Public
    // ---------------------------------------------------------------

    public function index() {
        return response()->json(
            Blog::where('status', 'published')->with(['category', 'categories', 'author'])
                ->orderBy('published_at', 'desc')->paginate(12)
        );
    }

    public function show($slug) {
        $blog = Blog::where('slug', $slug)
            ->where('status', 'published')
            ->with(['category', 'categories', 'author', 'coAuthor', 'images'])
            ->firstOrFail();
        return response()->json($blog);
    }

    public function incrementView($slug) {
        Blog::where('slug', $slug)->where('status', 'published')->increment('view_count');
        return response()->json(['message' => 'ok']);
    }

    public function like($id) {
        $blog = Blog::where('status', 'published')->findOrFail($id);
        $blog->increment('like_count');
        return response()->json(['like_count' => $blog->fresh()->like_count]);
    }

    // ---------------------------------------------------------------
    // Admin: CRUD
    // ---------------------------------------------------------------

    private function validationRules(bool $partial = false): array {
        $sometimes = $partial ? 'sometimes' : 'required';
        return [
            'title' => "{$sometimes}|string|max:255",
            'slug' => 'nullable|string|max:255|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            'content' => "{$sometimes}|string",
            'excerpt' => 'nullable|string|max:500',
            'category_id' => 'nullable|exists:blog_categories,id',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:blog_categories,id',
            'author_id' => 'nullable|exists:users,id',
            'co_author_id' => 'nullable|exists:users,id',
            'featured_image' => 'nullable|string',
            'featured_image_alt' => 'nullable|string|max:255',
            'featured_image_caption' => 'nullable|string|max:255',
            'featured_image_credit' => 'nullable|string|max:255',
            'status' => 'in:draft,review,published,archived,scheduled',
            'scheduled_at' => 'nullable|date|required_if:status,scheduled|after:now',
            'tags' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_trending' => 'boolean',
            'is_popular' => 'boolean',
            'is_editors_choice' => 'boolean',
            'seo_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'focus_keyword' => 'nullable|string|max:255',
            'secondary_keywords' => 'nullable|array',
            'canonical_url' => 'nullable|string|max:500',
            'robots_index' => 'boolean',
            'og_title' => 'nullable|string|max:255',
            'og_description' => 'nullable|string|max:500',
            'og_image' => 'nullable|string',
            'twitter_title' => 'nullable|string|max:255',
            'twitter_description' => 'nullable|string|max:500',
            'twitter_image' => 'nullable|string',
            'json_ld_override' => 'nullable|string',
            'faq_schema' => 'nullable|array',
            'faq_schema.*.question' => 'required_with:faq_schema|string',
            'faq_schema.*.answer' => 'required_with:faq_schema|string',
            'breadcrumb_title' => 'nullable|string|max:255',
        ];
    }

    private function uniqueSlug(string $base, ?int $exceptId = null): string {
        $slug = Str::slug($base) ?: 'post';
        $original = $slug;
        $i = 1;
        while (
            Blog::withTrashed()->where('slug', $slug)
                ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
                ->exists()
        ) {
            $slug = "{$original}-" . (++$i);
        }
        return $slug;
    }

    private function computeWordCount(?string $html): int {
        return str_word_count(strip_tags($html ?? ''));
    }

    private function syncSecondaryCategories(Blog $post, ?array $categoryIds): void {
        if ($categoryIds === null) {
            return;
        }
        // Never let the primary category also sit in the secondary pivot — avoids
        // a post double-counting itself in "posts in category X" listings.
        $post->categories()->sync(array_diff($categoryIds, [$post->category_id]));
    }

    public function adminIndex(Request $request) {
        $this->checkAdmin();

        $query = Blog::with(['category', 'author', 'coAuthor'])->withCount('images');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('focus_keyword', 'like', "%{$search}%");
            });
        }
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('category_id')) $query->where('category_id', $request->category_id);
        if ($request->boolean('featured_only')) $query->where('is_featured', true);

        $sortable = ['title', 'status', 'published_at', 'created_at', 'view_count', 'word_count'];
        $sort = in_array($request->get('sort'), $sortable) ? $request->get('sort') : 'created_at';
        $direction = $request->get('direction') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction);

        $posts = $query->paginate($request->get('per_page', 15));
        return response()->json($posts);
    }

    public function trashed(Request $request) {
        $this->checkAdmin();

        $query = Blog::onlyTrashed()->with(['category', 'author']);
        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }
        $posts = $query->orderBy('deleted_at', 'desc')->paginate($request->get('per_page', 15));
        return response()->json($posts);
    }

    public function store(Request $request) {
        $this->checkAdmin();
        $data = $request->validate($this->validationRules());

        Cache::forget('blog:tags');

        $slug = $data['slug'] ?? $this->uniqueSlug($data['title']);
        $slug = $this->uniqueSlug($slug);
        $content = $data['content'];
        $status = $data['status'] ?? 'draft';

        $post = Blog::create([
            'title' => $data['title'],
            'slug' => $slug,
            'content' => $content,
            'excerpt' => $data['excerpt'] ?? substr(strip_tags($content), 0, 200),
            'category_id' => $data['category_id'] ?? null,
            'author_id' => $data['author_id'] ?? $request->user()->id,
            'co_author_id' => $data['co_author_id'] ?? null,
            'featured_image' => $data['featured_image'] ?? null,
            'featured_image_alt' => $data['featured_image_alt'] ?? null,
            'featured_image_caption' => $data['featured_image_caption'] ?? null,
            'featured_image_credit' => $data['featured_image_credit'] ?? null,
            'status' => $status,
            'published_at' => $status === 'published' ? now() : null,
            'scheduled_at' => $status === 'scheduled' ? $data['scheduled_at'] : null,
            'seo_title' => $data['seo_title'] ?? $data['title'],
            'meta_description' => $data['meta_description'] ?? substr(strip_tags($content), 0, 160),
            'reading_time' => max(1, (int) ceil($this->computeWordCount($content) / 200)),
            'word_count' => $this->computeWordCount($content),
            'tags' => $data['tags'] ?? [],
            'is_featured' => $data['is_featured'] ?? false,
            'is_trending' => $data['is_trending'] ?? false,
            'is_popular' => $data['is_popular'] ?? false,
            'is_editors_choice' => $data['is_editors_choice'] ?? false,
            'focus_keyword' => $data['focus_keyword'] ?? null,
            'secondary_keywords' => $data['secondary_keywords'] ?? null,
            'canonical_url' => $data['canonical_url'] ?? null,
            'robots_index' => $data['robots_index'] ?? true,
            'og_title' => $data['og_title'] ?? null,
            'og_description' => $data['og_description'] ?? null,
            'og_image' => $data['og_image'] ?? null,
            'twitter_title' => $data['twitter_title'] ?? null,
            'twitter_description' => $data['twitter_description'] ?? null,
            'twitter_image' => $data['twitter_image'] ?? null,
            'json_ld_override' => $data['json_ld_override'] ?? null,
            'faq_schema' => $data['faq_schema'] ?? null,
            'breadcrumb_title' => $data['breadcrumb_title'] ?? null,
        ]);

        $this->syncSecondaryCategories($post, $data['category_ids'] ?? null);

        return response()->json($post->load(['category', 'categories', 'author']), 201);
    }

    public function showAdmin($id) {
        $this->checkAdmin();
        $post = Blog::with(['category', 'categories', 'author', 'coAuthor', 'images'])
            ->withCount('revisions')
            ->findOrFail($id);
        return response()->json($post);
    }

    public function update(Request $request, $id) {
        $this->checkAdmin();
        $post = Blog::findOrFail($id);
        $data = $request->validate($this->validationRules(partial: true));

        if (array_key_exists('slug', $data) && $data['slug']) {
            $data['slug'] = $this->uniqueSlug($data['slug'], $post->id);
        } elseif (isset($data['title']) && $data['title'] !== $post->title) {
            $data['slug'] = $this->uniqueSlug($data['title'], $post->id);
        }

        if (isset($data['content'])) {
            $data['word_count'] = $this->computeWordCount($data['content']);
            $data['reading_time'] = max(1, (int) ceil($data['word_count'] / 200));
        }

        if (isset($data['status'])) {
            if ($data['status'] === 'published' && !$post->published_at) {
                $data['published_at'] = now();
            }
            if ($data['status'] === 'scheduled') {
                $data['scheduled_at'] = $data['scheduled_at'] ?? $post->scheduled_at;
            } else {
                $data['scheduled_at'] = null;
            }
        }

        $categoryIds = $data['category_ids'] ?? null;
        unset($data['category_ids']);

        $post->update($data);
        $this->syncSecondaryCategories($post, $categoryIds);
        Cache::forget('blog:tags');

        return response()->json($post->fresh(['category', 'categories', 'author', 'coAuthor', 'images']));
    }

    public function duplicatePost($id) {
        $this->checkAdmin();
        $original = Blog::with('images')->findOrFail($id);

        $copy = $original->replicate(['view_count', 'like_count', 'share_count']);
        $copy->title = $original->title . ' (Copy)';
        $copy->slug = $this->uniqueSlug($copy->title);
        $copy->status = 'draft';
        $copy->published_at = null;
        $copy->scheduled_at = null;
        $copy->view_count = 0;
        $copy->like_count = 0;
        $copy->share_count = 0;
        $copy->save();

        foreach ($original->categories as $cat) {
            $copy->categories()->attach($cat->id);
        }
        foreach ($original->images as $image) {
            $copy->images()->create([
                'path' => $image->path,
                'webp_path' => $image->webp_path,
                'alt_text' => $image->alt_text,
                'caption' => $image->caption,
                'credit' => $image->credit,
                'sort_order' => $image->sort_order,
            ]);
        }

        return response()->json($copy->load(['category', 'categories', 'images']), 201);
    }

    public function destroy($id) {
        $this->checkAdmin();
        $post = Blog::findOrFail($id);
        $post->delete();
        Cache::forget('blog:tags');
        return response()->json(['message' => 'Post moved to trash']);
    }

    public function restore($id) {
        $this->checkAdmin();
        $post = Blog::onlyTrashed()->findOrFail($id);
        $post->restore();
        return response()->json($post);
    }

    public function forceDelete($id) {
        $this->checkAdmin();
        $post = Blog::onlyTrashed()->with('images')->findOrFail($id);

        foreach ($post->images as $image) {
            $this->deleteImageFiles($image);
        }
        $post->images()->delete();
        $post->forceDelete();

        return response()->json(['message' => 'Post permanently deleted']);
    }

    public function togglePublish($id) {
        $this->checkAdmin();
        $post = Blog::findOrFail($id);
        $post->status = $post->status === 'published' ? 'draft' : 'published';
        if ($post->status === 'published' && !$post->published_at) {
            $post->published_at = now();
        }
        $post->save();
        return response()->json($post);
    }

    // ---------------------------------------------------------------
    // Admin: bulk actions
    // ---------------------------------------------------------------

    private function bulkIds(Request $request): array {
        return $request->validate(['ids' => 'required|array|min:1', 'ids.*' => 'integer'])['ids'];
    }

    public function bulkDestroy(Request $request) {
        $this->checkAdmin();
        $ids = $this->bulkIds($request);
        $count = 0;
        DB::transaction(function () use ($ids, &$count) {
            foreach (Blog::whereIn('id', $ids)->get() as $post) {
                $post->delete();
                $count++;
            }
        });
        Cache::forget('blog:tags');
        return ApiResponse::ok(['count' => $count], "{$count} post(s) moved to trash");
    }

    public function bulkRestore(Request $request) {
        $this->checkAdmin();
        $ids = $this->bulkIds($request);
        $count = 0;
        foreach (Blog::onlyTrashed()->whereIn('id', $ids)->get() as $post) {
            $post->restore();
            $count++;
        }
        return ApiResponse::ok(['count' => $count], "{$count} post(s) restored");
    }

    public function bulkPublish(Request $request) {
        $this->checkAdmin();
        $ids = $this->bulkIds($request);
        $count = 0;
        foreach (Blog::whereIn('id', $ids)->get() as $post) {
            $post->status = 'published';
            if (!$post->published_at) $post->published_at = now();
            $post->scheduled_at = null;
            $post->save();
            $count++;
        }
        return ApiResponse::ok(['count' => $count], "{$count} post(s) published");
    }

    public function bulkDraft(Request $request) {
        $this->checkAdmin();
        $ids = $this->bulkIds($request);
        $count = 0;
        foreach (Blog::whereIn('id', $ids)->get() as $post) {
            $post->status = 'draft';
            $post->save();
            $count++;
        }
        return ApiResponse::ok(['count' => $count], "{$count} post(s) set to draft");
    }

    // ---------------------------------------------------------------
    // Admin: gallery images
    // ---------------------------------------------------------------

    private function deleteImageFiles(BlogImage $image): void {
        if (Storage::disk('public')->exists($image->path)) {
            Storage::disk('public')->delete($image->path);
        }
        if ($image->webp_path && Storage::disk('public')->exists($image->webp_path)) {
            Storage::disk('public')->delete($image->webp_path);
        }
    }

    public function storeImage(Request $request, $id) {
        $this->checkAdmin();
        $post = Blog::findOrFail($id);
        $request->validate(['image' => 'required|image|max:8192']);

        $file = $request->file('image');
        $maxSort = $post->images()->max('sort_order');

        if ($this->imageProcessor->isProcessableImage($file)) {
            $processed = $this->imageProcessor->process($file, 'public', 'blog-gallery');
            $image = $post->images()->create([
                'path' => $processed['path'],
                'webp_path' => $processed['webp_path'],
                'alt_text' => $request->get('alt_text'),
                'caption' => $request->get('caption'),
                'credit' => $request->get('credit'),
                'sort_order' => $maxSort === null ? 0 : $maxSort + 1,
            ]);
        } else {
            $image = $post->images()->create([
                'path' => $file->store('blog-gallery', 'public'),
                'alt_text' => $request->get('alt_text'),
                'caption' => $request->get('caption'),
                'credit' => $request->get('credit'),
                'sort_order' => $maxSort === null ? 0 : $maxSort + 1,
            ]);
        }

        return response()->json($image, 201);
    }

    public function updateImageMeta(Request $request, $id, $imageId) {
        $this->checkAdmin();
        $image = BlogImage::where('blog_id', $id)->findOrFail($imageId);
        $data = $request->validate([
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:255',
            'credit' => 'nullable|string|max:255',
        ]);
        $image->update($data);
        return response()->json($image);
    }

    public function destroyImage($id, $imageId) {
        $this->checkAdmin();
        $image = BlogImage::where('blog_id', $id)->findOrFail($imageId);
        $this->deleteImageFiles($image);
        $image->delete();
        return response()->json(['message' => 'Image deleted']);
    }

    public function reorderImages(Request $request, $id) {
        $this->checkAdmin();
        Blog::findOrFail($id);
        $order = $request->validate(['order' => 'required|array', 'order.*' => 'integer'])['order'];

        DB::transaction(function () use ($id, $order) {
            foreach ($order as $index => $imageId) {
                BlogImage::where('blog_id', $id)->where('id', $imageId)->update(['sort_order' => $index]);
            }
        });

        return response()->json(['message' => 'Order saved']);
    }

    // ---------------------------------------------------------------
    // Admin: revisions
    // ---------------------------------------------------------------

    public function revisions($id) {
        $this->checkAdmin();
        $post = Blog::findOrFail($id);
        return response()->json($post->revisions()->with('author:id,name')->get());
    }

    public function restoreRevision($id, $revisionId) {
        $this->checkAdmin();
        $post = Blog::findOrFail($id);
        $post->restoreRevision((int) $revisionId);
        return response()->json($post->fresh(['category', 'categories', 'author', 'images']));
    }

    // ---------------------------------------------------------------
    // Admin: categories & tags (unchanged from prior implementation)
    // ---------------------------------------------------------------

    public function categories() {
        $categories = BlogCategory::withCount('blogs')->orderBy('name')->get()
            ->map(fn (BlogCategory $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'description' => $c->description,
                'posts_count' => $c->blogs_count,
            ]);
        return ApiResponse::ok($categories, 'Categories loaded');
    }

    public function storeCategory(Request $request) {
        $request->validate(['name' => 'required|string|max:255']);
        $category = BlogCategory::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'sort_order' => BlogCategory::max('sort_order') + 1,
        ]);
        return response()->json($category, 201);
    }

    public function updateCategory(Request $request, $id) {
        $category = BlogCategory::findOrFail($id);
        $request->validate(['name' => 'required|string|max:255']);
        $category->update(['name' => $request->name, 'slug' => Str::slug($request->name)]);
        return response()->json($category);
    }

    public function destroyCategory($id) {
        BlogCategory::findOrFail($id)->delete();
        return response()->json(['message' => 'Category deleted']);
    }

    public function tags() {
        // Recomputes by scanning every post's tags column — cache briefly so it
        // isn't redone on every request; store()/update()/destroy()/destroyTag()
        // all forget this key so edits still show up immediately.
        $items = Cache::remember('blog:tags', 600, function () {
            $counts = [];
            Blog::whereNotNull('tags')->pluck('tags')->each(function ($tags) use (&$counts) {
                foreach ((is_array($tags) ? $tags : []) as $tag) {
                    $tag = trim((string) $tag);
                    if ($tag === '') {
                        continue;
                    }
                    $counts[$tag] = ($counts[$tag] ?? 0) + 1;
                }
            });

            $items = [];
            foreach ($counts as $name => $count) {
                $items[] = ['name' => $name, 'slug' => Str::slug($name), 'posts_count' => $count];
            }
            usort($items, fn ($a, $b) => strcmp($a['name'], $b['name']));

            return $items;
        });

        return ApiResponse::ok($items, 'Tags loaded');
    }

    public function storeTag(Request $request) {
        // Tags have no standalone table — they only exist as entries in a blog post's
        // `tags` JSON column (see tags()/destroyTag() above). A "created" tag with no
        // post attached would vanish on the very next tags() read, so faking success
        // here would mislead the admin into thinking it persisted. Fail honestly instead.
        $request->validate(['tag' => 'required|string|max:255']);
        return ApiResponse::fail(
            'Tags cannot be created on their own — they only exist once applied to a blog post.',
            'tags_not_standalone',
            422,
            'Blog Tags',
            'Tags are derived from the `tags` column on individual blog posts; there is no separate tags table to insert into.',
            'Open the blog post you want to tag and add it there — it will then appear on this list automatically.',
            '/admin/blog'
        );
    }

    public function destroyTag($id) {
        $tagStr = trim((string) $id);
        $posts = Blog::whereNotNull('tags')->get();
        foreach ($posts as $p) {
            $tags = is_array($p->tags) ? $p->tags : [];
            if (in_array($tagStr, $tags)) {
                $p->tags = array_values(array_filter($tags, fn ($t) => $t !== $tagStr));
                $p->save();
            }
        }
        Cache::forget('blog:tags');
        return ApiResponse::ok(null, 'Tag removed from posts');
    }
}
