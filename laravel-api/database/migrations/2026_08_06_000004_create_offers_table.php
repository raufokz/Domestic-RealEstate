<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->string('offer_number')->unique();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->decimal('current_amount', 12, 2);
            $table->enum('financing_type', ['cash', 'conventional', 'fha', 'va', 'other'])->nullable();
            $table->json('contingencies')->nullable();
            $table->date('closing_date')->nullable();
            $table->timestamp('expiration_date')->nullable();
            $table->text('message')->nullable();
            $table->text('counter_message')->nullable();
            $table->enum('status', ['submitted', 'countered', 'accepted', 'rejected', 'withdrawn'])->default('submitted');
            $table->enum('last_action_by', ['buyer', 'seller'])->default('buyer');
            $table->timestamp('responded_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['property_id', 'status']);
            $table->index(['buyer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
