<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Editorial workflow needs Draft -> Review -> Scheduled -> Published, but the
 * enum only had draft/published/scheduled/archived — nowhere for a post to
 * sit while an editor reviews it before scheduling.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE blogs MODIFY status ENUM('draft','review','published','scheduled','archived') NOT NULL DEFAULT 'draft'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("UPDATE blogs SET status = 'draft' WHERE status = 'review'");
            DB::statement("ALTER TABLE blogs MODIFY status ENUM('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft'");
        }
    }
};
