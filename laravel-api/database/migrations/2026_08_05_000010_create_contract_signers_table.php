<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Multi-party/witness signing. Existing single-signature contracts are
 * untouched — they keep using contracts.signature_base64 directly. Only
 * contracts that explicitly get signer rows added route through here.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contract_signers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->enum('role', ['signer', 'witness'])->default('signer');
            $table->text('signature_base64')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->string('signed_ip')->nullable();
            $table->string('signed_user_agent')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->enum('status', ['pending', 'signed', 'declined'])->default('pending');
            $table->timestamps();

            $table->index(['contract_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contract_signers');
    }
};
