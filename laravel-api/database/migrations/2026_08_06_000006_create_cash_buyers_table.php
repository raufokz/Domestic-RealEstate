<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_buyers', function (Blueprint $table) {
            $table->id();
            // Null wholesaler_id = shared pool, visible to every wholesaler
            // (public buyer-list signups land here). Set = privately added
            // by that wholesaler, visible only to them.
            $table->foreignId('wholesaler_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->decimal('budget_min', 12, 2)->nullable();
            $table->decimal('budget_max', 12, 2)->nullable();
            $table->json('preferred_areas')->nullable();
            $table->json('property_types')->nullable();
            $table->text('criteria')->nullable();
            $table->unsignedInteger('deals_closed')->default(0);
            $table->timestamp('last_active_at')->nullable();
            $table->enum('source', ['public_signup', 'manual'])->default('manual');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_buyers');
    }
};
