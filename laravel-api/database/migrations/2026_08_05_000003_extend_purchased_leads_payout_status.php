<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds 'processing'/'failed' so the Pay-at-Closing payout lifecycle can
 * reflect the real async Payoneer payout flow (request -> processing ->
 * paid, confirmed by webhook) instead of only pending/paid/cancelled.
 * Uses Blueprint::change() (portable across MySQL/SQLite) rather than raw
 * SQL, which would only work on MySQL and break the sqlite test suite.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchased_leads', function (Blueprint $table) {
            $table->enum('payout_status', ['pending', 'processing', 'paid', 'failed', 'cancelled'])
                ->default('pending')
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('purchased_leads', function (Blueprint $table) {
            $table->enum('payout_status', ['pending', 'paid', 'cancelled'])
                ->default('pending')
                ->change();
        });
    }
};
