<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integrations', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // google_maps, twilio, openai, facebook, etc.
            $table->string('name');
            $table->enum('category', ['social', 'email', 'ai', 'maps', 'calendar', 'storage', 'analytics', 'esign', 'automation', 'other'])->default('other');
            $table->string('logo_url')->nullable();
            $table->enum('status', ['not_configured', 'connected', 'error', 'disconnected'])->default('not_configured');
            $table->json('credentials')->nullable(); // encrypted
            $table->timestamp('last_tested_at')->nullable();
            $table->string('last_test_result')->nullable(); // success/failure
            $table->text('last_error_message')->nullable();
            $table->boolean('is_free_tier')->default(false);
            $table->string('docs_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integrations');
    }
};
