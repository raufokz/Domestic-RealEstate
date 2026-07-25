<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('automation_workflow_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('automation_workflows')->cascadeOnDelete();
            $table->string('trigger_event'); // what triggered it
            $table->json('trigger_data')->nullable(); // context data
            $table->json('action_results'); // [{action_type, status, error_message, executed_at}]
            $table->enum('status', ['success', 'partial', 'failed'])->default('success');
            $table->timestamps();

            $table->index('workflow_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_workflow_logs');
    }
};
