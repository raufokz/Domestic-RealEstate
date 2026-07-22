<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('headline')->nullable();
            $table->text('bio')->nullable();
            $table->string('brokerage_name')->nullable();
            $table->string('broker_name')->nullable();
            $table->string('license_number')->nullable();
            $table->enum('license_status', ['active', 'inactive', 'pending', 'suspended'])->default('pending');
            $table->string('mls_board')->nullable();
            $table->unsignedInteger('years_experience')->default(0);
            $table->json('specialties')->nullable();
            $table->json('languages')->nullable();
            $table->json('service_areas')->nullable();
            $table->json('lead_type_preferences')->nullable();
            $table->enum('partnership_type', ['individual', 'team', 'partnership'])->nullable();
            $table->string('office_address')->nullable();
            $table->string('office_city')->nullable();
            $table->string('office_state')->nullable();
            $table->string('office_zip')->nullable();
            $table->string('office_country')->default('US');
            $table->string('office_phone')->nullable();
            $table->string('office_email')->nullable();
            $table->string('website')->nullable();
            $table->json('social_links')->nullable();
            $table->text('e_signature')->nullable();
            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedInteger('review_count')->default(0);
            $table->unsignedInteger('sales_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(true);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('slug');
            $table->index('status');
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_profiles');
    }
};
