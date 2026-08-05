<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Real production-traffic AI usage logging — every AiService::generate()
 * call, not just admin "Test" button calls (those stay in the existing
 * ai_agent_test_logs table, which this does not replace).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->string('provider');
            $table->string('model')->nullable();
            $table->string('agent_key')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('input_tokens')->nullable();
            $table->unsignedInteger('output_tokens')->nullable();
            $table->decimal('cost_estimate', 10, 6)->default(0);
            $table->timestamps();

            $table->index('provider');
            $table->index('agent_key');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_usage_logs');
    }
};
