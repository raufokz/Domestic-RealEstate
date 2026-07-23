<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('page_templates')) {
            Schema::create('page_templates', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('category')->default('general');
                $table->json('sections_config')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('content_blocks')) {
            Schema::create('content_blocks', function (Blueprint $table) {
                $table->id();
                $table->string('key_name')->unique();
                $table->string('title');
                $table->text('content')->nullable();
                $table->string('type')->default('text');
                $table->json('settings')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('content_blocks');
        Schema::dropIfExists('page_templates');
    }
};
