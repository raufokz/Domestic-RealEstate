<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            if (!Schema::hasColumn('leads', 'pricing_model')) {
                $table->enum('pricing_model', ['pay_per_lead', 'pay_at_closing'])->default('pay_per_lead')->after('marketplace_price');
            }
            if (!Schema::hasColumn('leads', 'commission_rate')) {
                $table->decimal('commission_rate', 5, 2)->nullable()->after('pricing_model');
            }
            if (!Schema::hasColumn('leads', 'payout_method')) {
                $table->string('payout_method')->nullable()->default('payoneer')->after('commission_rate');
            }
            if (!Schema::hasColumn('leads', 'payout_email')) {
                $table->string('payout_email')->nullable()->after('payout_method');
            }
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $cols = [];
            if (Schema::hasColumn('leads', 'pricing_model')) $cols[] = 'pricing_model';
            if (Schema::hasColumn('leads', 'commission_rate')) $cols[] = 'commission_rate';
            if (Schema::hasColumn('leads', 'payout_method')) $cols[] = 'payout_method';
            if (Schema::hasColumn('leads', 'payout_email')) $cols[] = 'payout_email';
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
