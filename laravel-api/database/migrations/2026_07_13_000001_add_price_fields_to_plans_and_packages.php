<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membership_plans', function (Blueprint $table) {
            $table->decimal('price_monthly', 8, 2)->default(0)->after('name');
            $table->decimal('price_yearly', 8, 2)->default(0)->after('price_monthly');
            $table->boolean('is_popular')->default(false)->after('status');
            $table->string('badge')->nullable()->after('is_popular');
        });

        Schema::table('lead_packages', function (Blueprint $table) {
            $table->decimal('price', 8, 2)->default(0)->after('name');
            $table->decimal('price_per_lead', 8, 2)->default(0)->after('price');
            $table->boolean('is_popular')->default(false)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('membership_plans', function (Blueprint $table) {
            $table->dropColumn(['price_monthly', 'price_yearly', 'is_popular', 'badge']);
        });
        Schema::table('lead_packages', function (Blueprint $table) {
            $table->dropColumn(['price', 'price_per_lead', 'is_popular']);
        });
    }
};
