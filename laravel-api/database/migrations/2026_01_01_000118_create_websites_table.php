<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('websites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('template')->default('default');
            $table->json('theme_config')->nullable(); // colors, fonts, logo
            $table->enum('status', ['draft', 'building', 'deploying', 'live', 'suspended'])->default('draft');
            $table->string('subdomain')->nullable()->unique(); // johnsmith.domesticrealestate.us
            $table->boolean('self_editing_enabled')->default(false);
            $table->json('analytics_config')->nullable();
            $table->timestamp('deployed_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('websites');
    }
};
