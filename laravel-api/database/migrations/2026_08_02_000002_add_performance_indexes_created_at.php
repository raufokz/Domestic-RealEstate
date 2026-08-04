<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * page_views/leads are range-filtered on created_at (and leads grouped/filtered
 * by priority) on every admin dashboard + analytics request, but neither column
 * was indexed — those queries were full table scans. Additive only.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->index('created_at');
        });

        Schema::table('leads', function (Blueprint $table) {
            $table->index('created_at');
            $table->index('priority');
        });
    }

    public function down(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });

        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['priority']);
        });
    }
};
