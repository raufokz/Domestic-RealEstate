<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buyer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('min_budget', 12, 2)->nullable();
            $table->decimal('max_budget', 12, 2)->nullable();
            $table->unsignedSmallInteger('min_beds')->nullable();
            $table->unsignedSmallInteger('max_beds')->nullable();
            $table->unsignedSmallInteger('min_baths')->nullable();
            $table->string('property_type_pref')->nullable();
            $table->json('preferred_cities')->nullable();
            $table->json('preferred_states')->nullable();
            $table->json('preferred_neighborhoods')->nullable();
            $table->json('must_have_features')->nullable();
            $table->json('deal_breakers')->nullable();
            $table->string('timeline')->nullable();
            $table->boolean('pre_approved')->default(false);
            $table->decimal('pre_approval_amount', 12, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('seller_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('property_address');
            $table->string('property_city');
            $table->string('property_state');
            $table->string('property_zip');
            $table->decimal('estimated_value', 12, 2)->nullable();
            $table->decimal('asking_price', 12, 2)->nullable();
            $table->unsignedSmallInteger('beds')->nullable();
            $table->unsignedSmallInteger('baths')->nullable();
            $table->unsignedInteger('sqft')->nullable();
            $table->unsignedSmallInteger('year_built')->nullable();
            $table->string('property_condition')->nullable();
            $table->string('timeline')->nullable();
            $table->boolean('has_tenants')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_profiles');
        Schema::dropIfExists('buyer_profiles');
    }
};
