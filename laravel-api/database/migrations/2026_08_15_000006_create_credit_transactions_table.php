<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Immutable ledger — every credit/debit against an agent_wallets balance
 * gets one row here, written only by WalletService. Never updated after
 * insert; refunds/reversals are new rows, not edits.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['credit', 'debit']);
            $table->unsignedInteger('amount');
            $table->unsignedInteger('balance_after');
            $table->string('reason');
            // Written by trusted server code only — never accepted from a
            // request. No endpoint resolves this back to a model today; if
            // one is ever added, it must validate reference_type against a
            // fixed allow-list rather than blindly ::find()-ing it (IDOR).
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_transactions');
    }
};
