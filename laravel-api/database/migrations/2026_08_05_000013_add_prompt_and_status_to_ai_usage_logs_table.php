<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_usage_logs', function (Blueprint $table) {
            $table->text('prompt_preview')->nullable()->after('agent_key');
            $table->string('status')->default('success')->after('cost_estimate');

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('ai_usage_logs', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn(['prompt_preview', 'status']);
        });
    }
};
