<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A wallet top-up order — mirrors marketplace_lead_purchases' shape on
 * purpose (same payment_gateway/gateway_checkout_id fields, same
 * pending/confirmed/rejected lifecycle). Credits are added to the wallet
 * ONLY when status flips to 'confirmed' via a verified webhook or an
 * admin's manual bank-transfer confirmation — never from this row's
 * creation alone.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lead_package_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('credits');
            $table->decimal('amount_paid', 10, 2);
            $table->enum('status', ['pending', 'confirmed', 'rejected'])->default('pending');
            $table->string('payment_gateway')->nullable();
            $table->string('gateway_checkout_id')->nullable();
            $table->string('gateway_checkout_url')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_orders');
    }
};
