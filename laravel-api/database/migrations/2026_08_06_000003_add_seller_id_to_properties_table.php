<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            // The homeowner (role=seller) listing this property themselves —
            // distinct from realtor_id/broker_id, which represent the agent/
            // broker managing the listing. Null for agent-listed properties
            // with no distinct self-service seller account.
            $table->foreignId('seller_id')->nullable()->after('broker_id')->constrained('users')->nullOnDelete();
            $table->index('seller_id');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropConstrainedForeignId('seller_id');
        });
    }
};
