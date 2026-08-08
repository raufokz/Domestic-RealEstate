<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('deals', function (Blueprint $t) {
            $t->decimal('referral_fee_pct', 5, 2)->nullable()->after('metadata');
            $t->decimal('referral_fee_amount', 12, 2)->nullable()->after('referral_fee_pct');
            $t->unsignedBigInteger('referral_agent_id')->nullable()->after('referral_fee_amount');
            $t->timestamp('referral_paid_at')->nullable()->after('referral_agent_id');
            $t->string('referral_status', 30)->default('none')->after('referral_paid_at');

            $t->foreign('referral_agent_id')->references('id')->on('users')->nullOnDelete();
            $t->index('referral_agent_id');
            $t->index('referral_status');
        });
    }

    public function down(): void
    {
        Schema::table('deals', function (Blueprint $t) {
            $t->dropForeign(['referral_agent_id']);
            $t->dropIndex(['referral_agent_id']);
            $t->dropIndex(['referral_status']);
            $t->dropColumn(['referral_fee_pct', 'referral_fee_amount', 'referral_agent_id', 'referral_paid_at', 'referral_status']);
        });
    }
};
