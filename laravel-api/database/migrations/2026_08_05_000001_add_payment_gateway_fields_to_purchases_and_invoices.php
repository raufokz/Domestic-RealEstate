<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('marketplace_lead_purchases', function (Blueprint $table) {
            $table->string('payment_gateway')->nullable()->after('status');
            $table->string('gateway_checkout_id')->nullable()->after('payment_gateway');
            $table->text('gateway_checkout_url')->nullable()->after('gateway_checkout_id');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->string('payment_gateway')->nullable()->after('status');
            $table->string('gateway_transaction_id')->nullable()->after('payment_gateway');
            $table->json('gateway_status_raw')->nullable()->after('gateway_transaction_id');
        });
    }

    public function down(): void
    {
        Schema::table('marketplace_lead_purchases', function (Blueprint $table) {
            $table->dropColumn(['payment_gateway', 'gateway_checkout_id', 'gateway_checkout_url']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['payment_gateway', 'gateway_transaction_id', 'gateway_status_raw']);
        });
    }
};
