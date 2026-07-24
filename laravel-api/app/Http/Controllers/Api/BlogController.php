<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogCategory;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index() {
        return response()->json(
            Blog::where('status', 'published')->with(['category', 'author'])
                ->orderBy('published_at', 'desc')->paginate(12)
        );
    }

    public function show($slug) {
        $blog = Blog::where('slug', $slug)->with(['category', 'author'])->firstOrFail();
        return response()->json($blog);
    }

    public function adminIndex(Request $request) {
        $query = Blog::with(['category', 'author']);
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('slug', 'like', "%{$request->search}%");
            });
        }
        if ($request->status) $query->where('status', $request->status);
        if ($request->category_id) $query->where('category_id', $request->category_id);
        $posts = $query->latest()->paginate($request->get('per_page', 15));
        return response()->json($posts);
    }

    public function store(Request $request) {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'category_id' => 'nullable|exists:blog_categories,id',
            'featured_image' => 'nullable|string',
            'status' => 'in:draft,published,archived,scheduled',
            'seo_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'tags' => 'nullable|array',
        ]);

        $slug = Str::slug($request->title);
        $existing = Blog::where('slug', $slug)->count();
        if ($existing > 0) $slug .= '-' . time();

        $post = Blog::create([
            'title' => $request->title,
            'slug' => $slug,
            'content' => $request->content,
            'excerpt' => $request->excerpt ?? substr(strip_tags($request->content), 0, 200),
            'category_id' => $request->category_id,
            'author_id' => $request->user()->id,
            'featured_image' => $request->featured_image,
            'status' => $request->get('status', 'draft'),
            'published_at' => $request->status === 'published' ? now() : null,
            'seo_title' => $request->seo_title ?? $request->title,
            'meta_description' => $request->meta_description ?? substr(strip_tags($request->content), 0, 160),
            'reading_time' => max(1, ceil(str_word_count(strip_tags($request->content)) / 200)),
            'tags' => $request->tags ?? [],
        ]);

        return response()->json($post, 201);
    }

    public function showAdmin($id) {
        $post = Blog::with(['category', 'author'])->findOrFail($id);
        return response()->json($post);
    }

    public function update(Request $request, $id) {
        $post = Blog::findOrFail($id);
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'excerpt' => 'nullable|string',
            'category_id' => 'nullable|exists:blog_categories,id',
            'featured_image' => 'nullable|string',
            'status' => 'in:draft,published,archived,scheduled',
            'seo_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'tags' => 'nullable|array',
        ]);

        $data = $request->only(['title', 'content', 'excerpt', 'category_id', 'featured_image', 'status', 'seo_title', 'meta_description', 'tags']);
        
        if (isset($data['title']) && !isset($data['slug'])) {
            $slug = Str::slug($data['title']);
            $existing = Blog::where('slug', $slug)->where('id', '!=', $post->id)->count();
            if ($existing > 0) $slug .= '-' . time();
            $data['slug'] = $slug;
        }
        if (isset($data['content']) && !isset($data['reading_time'])) {
            $data['reading_time'] = max(1, ceil(str_word_count(strip_tags($data['content'])) / 200));
        }
        if (isset($data['status']) && $data['status'] === 'published' && !$post->published_at) {
            $data['published_at'] = now();
        }

        $post->update($data);
        return response()->json($post);
    }

    public function destroy($id) {
        $post = Blog::findOrFail($id);
        $post->delete();
        return response()->json(['message' => 'Post deleted']);
    }

    public function togglePublish($id) {
        $post = Blog::findOrFail($id);
        $post->status = $post->status === 'published' ? 'draft' : 'published';
        if ($post->status === 'published' && !$post->published_at) {
            $post->published_at = now();
        }
        $post->save();
        return response()->json($post);
    }

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
        return ApiResponse::ok(null, 'Tag removed from posts');
    }
}
