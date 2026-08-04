<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_profile_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_profile_id')->constrained('agent_profiles')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // profile_update, verification_change, document_upload, document_delete, license_change
            $table->string('field_name')->nullable();
            $table->text('previous_value')->nullable();
            $table->text('new_value')->nullable();
            $table->json('changes')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index('agent_profile_id');
            $table->index('user_id');
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_profile_audits');
    }
};
