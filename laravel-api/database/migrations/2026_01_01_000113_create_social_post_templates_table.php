<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_post_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('content_template');
            $table->string('platform')->nullable(); // null = any platform
            $table->enum('category', ['listing', 'blog', 'testimonial', 'market_report', 'tip', 'event', 'open_house', 'general'])->default('general');
            $table->json('variables')->nullable(); // {property_price}, {property_city}, etc.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_post_templates');
    }
};
