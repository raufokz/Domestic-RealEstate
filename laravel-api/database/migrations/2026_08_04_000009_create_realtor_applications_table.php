<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('realtor_applications', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('license_number');
            $table->string('license_state', 2);
            $table->string('brokerage_name')->nullable();
            $table->string('brokerage_license_number')->nullable();
            $table->string('id_document_path')->nullable();
            $table->string('license_document_path')->nullable();
            $table->enum('status', ['pending', 'under_review', 'more_info_requested', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('review_notes')->nullable();
            $table->foreignId('created_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('submitted_at');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('realtor_applications');
    }
};
