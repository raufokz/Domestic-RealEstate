<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->unique()->index();
            $table->unsignedBigInteger('lead_id')->nullable()->index();
            $table->string('ai_type')->default('general'); // buyer, seller, investor, realtor, agent, general
            $table->string('user_name')->nullable();
            $table->string('user_email')->nullable();
            $table->string('user_phone')->nullable();
            $table->json('messages'); // full chat messages [{role, content, timestamp}]
            $table->text('summary')->nullable();
            $table->integer('qualification_score')->default(0);
            $table->string('status')->default('active'); // active, completed, archived
            $table->unsignedBigInteger('assigned_agent_id')->nullable()->index();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('set null');
            $table->foreign('assigned_agent_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_conversations');
    }
};
