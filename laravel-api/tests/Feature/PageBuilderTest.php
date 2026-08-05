<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageBuilderTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_create_update_and_delete_pages(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $create = $this->actingAs($admin)->postJson('/api/admin/pages', [
            'title' => 'About Us',
            'slug' => 'about-us',
            'status' => 'draft',
        ]);
        $create->assertStatus(201)->assertJsonPath('data.slug', 'about-us');

        $page = Page::where('slug', 'about-us')->firstOrFail();

        $this->actingAs($admin)->putJson("/api/admin/pages/{$page->id}", [
            'title' => 'About Domestic RE',
            'status' => 'published',
        ])->assertOk()->assertJsonPath('data.title', 'About Domestic RE');

        $this->actingAs($admin)->getJson('/api/admin/pages')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'published');

        $this->actingAs($admin)->deleteJson("/api/admin/pages/{$page->id}")->assertOk();
        $this->assertDatabaseMissing('pages', ['id' => $page->id]);
    }

    public function test_publish_endpoint_flips_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $page = Page::create(['slug' => 'privacy-policy', 'title' => 'Privacy Policy', 'status' => 'draft']);

        $this->actingAs($admin)->postJson("/api/admin/pages/{$page->id}/publish", ['status' => 'published'])
            ->assertOk()
            ->assertJsonPath('data.status', 'published');

        $this->assertSame('published', $page->fresh()->status);
    }

    public function test_duplicate_slug_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Page::create(['slug' => 'terms', 'title' => 'Terms']);

        $this->actingAs($admin)->postJson('/api/admin/pages', ['title' => 'Terms 2', 'slug' => 'terms'])
            ->assertStatus(422);
    }

    public function test_non_admin_cannot_manage_pages(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $page = Page::create(['slug' => 'about', 'title' => 'About']);

        $this->actingAs($buyer)->getJson('/api/admin/pages')->assertStatus(403);
        $this->actingAs($buyer)->postJson('/api/admin/pages', ['title' => 'X', 'slug' => 'x'])->assertStatus(403);
        $this->actingAs($buyer)->putJson("/api/admin/pages/{$page->id}", ['title' => 'Y'])->assertStatus(403);
        $this->actingAs($buyer)->deleteJson("/api/admin/pages/{$page->id}")->assertStatus(403);
    }
}
