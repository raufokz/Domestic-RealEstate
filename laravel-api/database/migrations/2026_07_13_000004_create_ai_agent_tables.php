<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_agent_configs', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('model')->default('gemini-1.5-flash');
            $table->string('endpoint')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('custom_prompt')->nullable();
            $table->decimal('temperature', 3, 2)->default(0.70);
            $table->integer('max_tokens')->default(1000);
            $table->integer('total_calls')->default(0);
            $table->integer('total_tokens')->default(0);
            $table->integer('avg_response_ms')->default(0);
            $table->timestamp('last_tested_at')->nullable();
            $table->json('last_test_result')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_agent_test_logs', function (Blueprint $table) {
            $table->id();
            $table->string('agent_key')->index();
            $table->text('test_message');
            $table->text('response')->nullable();
            $table->string('provider')->nullable();
            $table->integer('elapsed_ms')->default(0);
            $table->integer('tokens')->default(0);
            $table->string('status')->default('success');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_agent_test_logs');
        Schema::dropIfExists('ai_agent_configs');
    }
};
