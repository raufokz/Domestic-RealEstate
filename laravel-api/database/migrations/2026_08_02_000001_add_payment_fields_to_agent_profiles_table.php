<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->enum('payment_status', ['unpaid', 'paid', 'renewed', 'refunded'])->default('unpaid')->after('status');
            $table->text('payoneer_checkout_url')->nullable()->after('payment_status');
            $table->timestamp('payment_link_sent_at')->nullable()->after('payoneer_checkout_url');
        });
    }

    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'payoneer_checkout_url', 'payment_link_sent_at']);
        });
    }
};
