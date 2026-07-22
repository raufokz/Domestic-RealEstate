<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('ghl_settings');
        Schema::dropIfExists('ghl_field_mappings');

        Schema::table('user_memberships', function (Blueprint $table) {
            $table->dropColumn('stripe_subscription_id');
            $table->foreignId('manually_activated_by')->nullable()->after('ends_at');
        });

        Schema::table('membership_plans', function (Blueprint $table) {
            $table->dropColumn(['price_monthly', 'price_yearly']);
        });

        Schema::table('lead_packages', function (Blueprint $table) {
            $table->dropColumn('price');
        });
    }

    public function down(): void
    {
        Schema::table('lead_packages', function (Blueprint $table) {
            $table->decimal('price', 8, 2);
        });

        Schema::table('membership_plans', function (Blueprint $table) {
            $table->decimal('price_monthly', 8, 2);
            $table->decimal('price_yearly', 8, 2);
        });

        Schema::table('user_memberships', function (Blueprint $table) {
            $table->string('stripe_subscription_id')->nullable();
            $table->dropColumn('manually_activated_by');
        });
    }
};
