<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('website_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->text('content')->nullable(); // HTML or JSON sections
            $table->json('sections')->nullable(); // structured sections
            $table->json('seo_config')->nullable(); // meta title, description, og image
            $table->integer('sort_order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->unique(['website_id', 'slug']);
            $table->index('website_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('website_pages');
    }
};
