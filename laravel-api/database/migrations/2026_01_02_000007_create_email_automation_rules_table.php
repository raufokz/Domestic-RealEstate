<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_automation_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('trigger_event');
            $table->unsignedBigInteger('email_template_id')->nullable();
            $table->foreign('email_template_id')->references('id')->on('email_templates')->nullOnDelete();
            $table->json('conditions')->nullable();
            $table->json('delay_config')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('execution_count')->default(0);
            $table->timestamp('last_executed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_automation_rules');
    }
};
