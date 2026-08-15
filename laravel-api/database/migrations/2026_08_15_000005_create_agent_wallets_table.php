<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Prepaid credit balance per agent, spent instantly to unlock marketplace
 * leads (see MarketplaceController::purchase()'s 'wallet' payment_method
 * branch) instead of a per-item Payoneer checkout. Balance is only ever
 * mutated through WalletService — never written to directly.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('balance_credits')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_wallets');
    }
};
