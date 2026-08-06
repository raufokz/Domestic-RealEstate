<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wholesale_deals', function (Blueprint $table) {
            $table->id();
            $table->string('deal_number')->unique();
            $table->foreignId('wholesaler_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('address');
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->string('property_type')->nullable();
            $table->unsignedSmallInteger('bedrooms')->nullable();
            $table->decimal('bathrooms', 3, 1)->nullable();
            $table->unsignedInteger('sqft')->nullable();
            $table->unsignedSmallInteger('year_built')->nullable();
            $table->decimal('asking_price', 12, 2)->nullable();
            $table->decimal('arv', 12, 2)->nullable();
            $table->decimal('repair_estimate', 12, 2)->nullable();
            $table->decimal('assignment_fee', 12, 2)->nullable();
            $table->decimal('monthly_rent_estimate', 12, 2)->nullable();
            $table->string('deal_source')->nullable();
            $table->string('condition')->nullable();
            $table->text('description')->nullable();
            $table->text('repair_details')->nullable();
            $table->json('photos')->nullable();
            $table->enum('status', ['draft', 'new', 'under_contract', 'assigned', 'closed'])->default('draft');
            $table->foreignId('assigned_buyer_id')->nullable()->constrained('cash_buyers')->nullOnDelete();
            // Gates a future public showcase page — not wired to anything yet.
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['wholesaler_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wholesale_deals');
    }
};
