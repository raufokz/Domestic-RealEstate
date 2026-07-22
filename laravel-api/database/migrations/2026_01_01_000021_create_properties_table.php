<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('property_type_id')->nullable()->constrained()->nullOnDelete();
            $table->string('sub_type')->nullable();
            $table->enum('status', ['draft', 'active', 'pending', 'sold', 'expired', 'withdrawn'])->default('draft');
            $table->decimal('price', 12, 2);
            $table->enum('price_type', ['sale', 'rent', 'lease'])->default('sale');
            $table->unsignedSmallInteger('bedrooms')->nullable();
            $table->decimal('bathrooms', 3, 1)->nullable();
            $table->unsignedInteger('sqft')->nullable();
            $table->decimal('lot_size', 10, 2)->nullable();
            $table->unsignedSmallInteger('year_built')->nullable();
            $table->unsignedSmallInteger('parking_spaces')->default(0);
            $table->unsignedSmallInteger('floors')->default(1);
            $table->decimal('hoa_fees', 8, 2)->nullable();
            $table->string('address');
            $table->string('city');
            $table->string('state');
            $table->string('zip');
            $table->string('country')->default('US');
            $table->string('neighborhood')->nullable();
            $table->string('county')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('school_district')->nullable();
            $table->unsignedSmallInteger('walkscore')->nullable();
            $table->json('photos')->nullable();
            $table->json('gallery')->nullable();
            $table->string('video_url')->nullable();
            $table->string('virtual_tour_url')->nullable();
            $table->string('floor_plan_url')->nullable();
            $table->json('amenities')->nullable();
            $table->json('nearby_places')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('featured')->default(false);
            $table->boolean('premium')->default(false);
            $table->timestamp('open_house_date')->nullable();
            $table->timestamp('open_house_end')->nullable();
            $table->foreignId('realtor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('broker_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('listed_by_type', ['agent', 'broker', 'owner', 'system'])->default('agent');
            $table->enum('approval_status', ['draft', 'pending', 'approved', 'rejected'])->default('draft');
            $table->unsignedInteger('view_count')->default(0);
            $table->unsignedInteger('inquiry_count')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['city', 'state', 'zip']);
            $table->index('status');
            $table->index('price');
            $table->index('property_type_id');
            $table->index('featured');
            $table->index('premium');
            $table->index('realtor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
