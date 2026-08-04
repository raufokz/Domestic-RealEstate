<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
            $table->index('status');
        });

        Schema::table('properties', function (Blueprint $table) {
            $table->index('approval_status');
        });

        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->index('is_published');
        });

        Schema::table('enquiries', function (Blueprint $table) {
            $table->index('status');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enquiries', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['type']);
        });

        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropIndex(['is_published']);
        });

        Schema::table('properties', function (Blueprint $table) {
            $table->dropIndex(['approval_status']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['status']);
        });
    }
};
