<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_landing_pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->enum('status', ['draft', 'published', 'scheduled'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->softDeletes();
            $table->string('hero_heading')->nullable();
            $table->text('hero_subtitle')->nullable();
            $table->text('hero_subtext')->nullable();
            $table->string('hero_image')->nullable();
            $table->string('hero_image_alt')->nullable();
            $table->string('hero_video_url')->nullable();
            $table->string('cta_button_1_text')->nullable();
            $table->string('cta_button_1_url')->nullable();
            $table->string('cta_button_2_text')->nullable();
            $table->string('cta_button_2_url')->nullable();
            $table->string('realtor_name')->nullable();
            $table->string('realtor_title')->nullable();
            $table->string('realtor_photo')->nullable();
            $table->string('realtor_phone')->nullable();
            $table->string('realtor_email')->nullable();
            $table->string('website')->nullable();
            $table->json('social_links')->nullable();
            $table->longText('body_content')->nullable();
            $table->json('faqs')->nullable();
            $table->json('related_agents')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->string('focus_keyword')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('og_title')->nullable();
            $table->string('og_description')->nullable();
            $table->string('og_image')->nullable();
            $table->string('twitter_title')->nullable();
            $table->string('twitter_description')->nullable();
            $table->string('twitter_image')->nullable();
            $table->json('schema_markup')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_landing_pages');
    }
};
