<?php

namespace Tests\Feature;

use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BlogControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $staff;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $this->staff = User::factory()->create([
            'role' => 'staff',
        ]);

        $this->regularUser = User::factory()->create([
            'role' => 'buyer',
        ]);
    }

    public function test_public_index_returns_published_blogs()
    {
        Blog::create([
            'title' => 'Published Post',
            'slug' => 'published-post',
            'content' => '<p>Content</p>',
            'status' => 'published',
            'published_at' => now(),
            'author_id' => $this->admin->id,
        ]);
        Blog::create([
            'title' => 'Draft Post',
            'slug' => 'draft-post',
            'content' => '<p>Draft</p>',
            'status' => 'draft',
            'author_id' => $this->admin->id,
        ]);

        $response = $this->getJson('/api/blogs');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_public_show_returns_single_published_blog_by_slug_or_id()
    {
        $category = BlogCategory::create(['name' => 'Tech', 'slug' => 'tech']);
        $blog = Blog::create([
            'title' => 'Test Post',
            'slug' => 'test-post',
            'content' => '<p>Hello world</p>',
            'status' => 'published',
            'published_at' => now(),
            'category_id' => $category->id,
            'author_id' => $this->admin->id,
        ]);

        // By slug
        $response = $this->getJson('/api/blogs/test-post');
        $response->assertStatus(200)
            ->assertJsonPath('slug', 'test-post')
            ->assertJsonPath('title', 'Test Post');

        // By ID
        $response2 = $this->getJson("/api/blogs/{$blog->id}");
        $response2->assertStatus(200)
            ->assertJsonPath('id', $blog->id);
    }

    public function test_public_show_fails_for_draft_blog()
    {
        Blog::create([
            'title' => 'Draft Post',
            'slug' => 'draft-post',
            'content' => '<p>Draft content</p>',
            'status' => 'draft',
            'author_id' => $this->admin->id,
        ]);

        $response = $this->getJson('/api/blogs/draft-post');

        $response->assertStatus(404);
    }

    public function test_admin_show_returns_blog_by_id_including_trashed()
    {
        $blog = Blog::create([
            'title' => 'Admin Edit Post',
            'slug' => 'admin-edit-post',
            'content' => '<p>Admin content</p>',
            'status' => 'draft',
            'author_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/admin/blog/posts/{$blog->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $blog->id)
            ->assertJsonPath('title', 'Admin Edit Post');

        // Soft delete the post
        $blog->delete();

        $responseTrashed = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/admin/blog/posts/{$blog->id}");

        $responseTrashed->assertStatus(200)
            ->assertJsonPath('id', $blog->id);
    }

    public function test_staff_role_can_access_and_update_blog()
    {
        $blog = Blog::create([
            'title' => 'Staff Post',
            'slug' => 'staff-post',
            'content' => '<p>Staff content</p>',
            'status' => 'draft',
            'author_id' => $this->staff->id,
        ]);

        $response = $this->actingAs($this->staff, 'sanctum')
            ->getJson("/api/admin/blog/posts/{$blog->id}");

        $response->assertStatus(200);

        $updateResponse = $this->actingAs($this->staff, 'sanctum')
            ->putJson("/api/admin/blog/posts/{$blog->id}", [
                'title' => 'Staff Post Updated',
                'content' => '<p>Updated content</p>',
            ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('title', 'Staff Post Updated');
    }

    public function test_admin_store_creates_blog()
    {
        $payload = [
            'title' => 'New Created Post',
            'content' => '<p>Created content</p>',
            'status' => 'published',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/blog/posts', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('title', 'New Created Post');

        $this->assertDatabaseHas('blogs', [
            'title' => 'New Created Post',
            'status' => 'published',
        ]);
    }

    public function test_admin_update_updates_blog_with_scheduled_date_and_schema()
    {
        $blog = Blog::create([
            'title' => 'Original Title',
            'slug' => 'original-title',
            'content' => '<p>Original content</p>',
            'status' => 'scheduled',
            'scheduled_at' => now()->subHour(), // past date
            'author_id' => $this->admin->id,
        ]);

        $payload = [
            'title' => 'Updated Title',
            'slug' => 'Updated Slug With Spaces',
            'content' => '<p>Updated content</p>',
            'status' => 'scheduled',
            'scheduled_at' => now()->subMinutes(30)->toISOString(), // past date
            'faq_schema' => [
                ['question' => 'Q1', 'answer' => 'A1'],
                ['question' => '', 'answer' => ''],
            ],
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/admin/blog/posts/{$blog->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('title', 'Updated Title');
    }
}
