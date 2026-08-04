<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchased_leads', function (Blueprint $table) {
            if (!Schema::hasColumn('purchased_leads', 'commission_amount')) {
                $table->decimal('commission_amount', 12, 2)->nullable()->after('amount');
            }
            if (!Schema::hasColumn('purchased_leads', 'payout_method')) {
                $table->string('payout_method')->nullable()->default('payoneer')->after('commission_amount');
            }
            if (!Schema::hasColumn('purchased_leads', 'payout_email')) {
                $table->string('payout_email')->nullable()->after('payout_method');
            }
            if (!Schema::hasColumn('purchased_leads', 'payout_status')) {
                $table->enum('payout_status', ['pending', 'paid', 'cancelled'])->default('pending')->after('payout_email');
            }
            if (!Schema::hasColumn('purchased_leads', 'closing_date')) {
                $table->date('closing_date')->nullable()->after('payout_status');
            }
            if (!Schema::hasColumn('purchased_leads', 'claimed_at')) {
                $table->timestamp('claimed_at')->nullable()->after('closing_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('purchased_leads', function (Blueprint $table) {
            $cols = [];
            if (Schema::hasColumn('purchased_leads', 'commission_amount')) $cols[] = 'commission_amount';
            if (Schema::hasColumn('purchased_leads', 'payout_method')) $cols[] = 'payout_method';
            if (Schema::hasColumn('purchased_leads', 'payout_email')) $cols[] = 'payout_email';
            if (Schema::hasColumn('purchased_leads', 'payout_status')) $cols[] = 'payout_status';
            if (Schema::hasColumn('purchased_leads', 'closing_date')) $cols[] = 'closing_date';
            if (Schema::hasColumn('purchased_leads', 'claimed_at')) $cols[] = 'claimed_at';
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
