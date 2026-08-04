<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The admin edit form already offers "Archived" but the enum never
        // included it — selecting it would fail the DB constraint outright.
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE blogs MODIFY status ENUM('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft'");
        }

        Schema::table('blogs', function (Blueprint $table) {
            // Authorship / taxonomy
            $table->foreignId('co_author_id')->nullable()->after('author_id')->constrained('users')->nullOnDelete();

            // Editorial flags
            $table->unsignedInteger('word_count')->default(0)->after('reading_time');
            $table->boolean('is_featured')->default(false)->after('word_count');
            $table->boolean('is_trending')->default(false)->after('is_featured');
            $table->boolean('is_popular')->default(false)->after('is_trending');
            $table->boolean('is_editors_choice')->default(false)->after('is_popular');

            // Engagement counters
            $table->unsignedInteger('view_count')->default(0)->after('is_editors_choice');
            $table->unsignedInteger('like_count')->default(0)->after('view_count');
            $table->unsignedInteger('share_count')->default(0)->after('like_count');

            // Featured image metadata (the image itself stays a URL string on `featured_image`)
            $table->string('featured_image_alt')->nullable()->after('featured_image');
            $table->string('featured_image_caption')->nullable()->after('featured_image_alt');
            $table->string('featured_image_credit')->nullable()->after('featured_image_caption');

            // SEO
            $table->string('focus_keyword')->nullable()->after('meta_description');
            $table->json('secondary_keywords')->nullable()->after('focus_keyword');
            $table->string('canonical_url')->nullable()->after('secondary_keywords');
            $table->boolean('robots_index')->default(true)->after('canonical_url');
            $table->string('og_title')->nullable()->after('robots_index');
            $table->text('og_description')->nullable()->after('og_title');
            $table->string('og_image')->nullable()->after('og_description');
            $table->string('twitter_title')->nullable()->after('og_image');
            $table->text('twitter_description')->nullable()->after('twitter_title');
            $table->string('twitter_image')->nullable()->after('twitter_description');
            $table->text('json_ld_override')->nullable()->after('twitter_image');
            $table->json('faq_schema')->nullable()->after('json_ld_override');
            $table->string('breadcrumb_title')->nullable()->after('faq_schema');

            // Scheduling
            $table->timestamp('scheduled_at')->nullable()->after('published_at');

            $table->index('is_featured');
            $table->index('is_trending');
            $table->index('is_popular');
            $table->index('is_editors_choice');
            $table->index('scheduled_at');
        });

        // Secondary categories (the existing `category_id` column stays the primary category).
        Schema::create('blog_category', function (Blueprint $table) {
            $table->foreignId('blog_id')->constrained('blogs')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('blog_categories')->cascadeOnDelete();
            $table->primary(['blog_id', 'category_id']);
        });

        // Gallery images, same shape as the already-proven property_images pattern.
        Schema::create('blog_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blog_id')->constrained('blogs')->cascadeOnDelete();
            $table->string('path');
            $table->string('webp_path')->nullable();
            $table->string('alt_text')->nullable();
            $table->string('caption')->nullable();
            $table->string('credit')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_images');
        Schema::dropIfExists('blog_category');

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE blogs MODIFY status ENUM('draft','published','scheduled') NOT NULL DEFAULT 'draft'");
        }

        Schema::table('blogs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('co_author_id');
            $table->dropColumn([
                'word_count', 'is_featured', 'is_trending', 'is_popular', 'is_editors_choice',
                'view_count', 'like_count', 'share_count',
                'featured_image_alt', 'featured_image_caption', 'featured_image_credit',
                'focus_keyword', 'secondary_keywords', 'canonical_url', 'robots_index',
                'og_title', 'og_description', 'og_image',
                'twitter_title', 'twitter_description', 'twitter_image',
                'json_ld_override', 'faq_schema', 'breadcrumb_title', 'scheduled_at',
            ]);
        });
    }
};
