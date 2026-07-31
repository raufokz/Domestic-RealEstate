<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // notifications.resolved_by -> users (missing FK)
        Schema::table('notifications', function (Blueprint $table) {
            $table->foreign('resolved_by', 'fk_notifications_resolved_by')
                  ->references('id')->on('users')->nullOnDelete();
        });

        // user_memberships.manually_activated_by -> users (missing FK)
        Schema::table('user_memberships', function (Blueprint $table) {
            $table->foreign('manually_activated_by', 'fk_user_memberships_manually_activated_by')
                  ->references('id')->on('users')->nullOnDelete();
        });

        // webhook_events.payload_hash: idempotency key, must be unique
        Schema::table('webhook_events', function (Blueprint $table) {
            $table->unique('payload_hash', 'uq_webhook_events_payload_hash');
        });

        // ad_placements.price: money precision consistency (was decimal(8,2), caps at ~999,999.99)
        DB::statement('ALTER TABLE ad_placements MODIFY price DECIMAL(12,2) NOT NULL');

        // leads.pre_approved / consent_given: nullable booleans are a tri-state bug magnet.
        // Existing NULLs (560/561 rows) mean "never answered" -> default to false (the safe,
        // conservative reading), not true.
        DB::statement("UPDATE leads SET pre_approved = 0 WHERE pre_approved IS NULL");
        DB::statement("UPDATE leads SET consent_given = 0 WHERE consent_given IS NULL");
        DB::statement('ALTER TABLE leads MODIFY pre_approved TINYINT(1) NOT NULL DEFAULT 0');
        DB::statement('ALTER TABLE leads MODIFY consent_given TINYINT(1) NOT NULL DEFAULT 0');
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign('fk_notifications_resolved_by');
        });
        Schema::table('user_memberships', function (Blueprint $table) {
            $table->dropForeign('fk_user_memberships_manually_activated_by');
        });
        Schema::table('webhook_events', function (Blueprint $table) {
            $table->dropUnique('uq_webhook_events_payload_hash');
        });
        DB::statement('ALTER TABLE ad_placements MODIFY price DECIMAL(8,2) NOT NULL');
        DB::statement('ALTER TABLE leads MODIFY pre_approved TINYINT(1) NULL DEFAULT NULL');
        DB::statement('ALTER TABLE leads MODIFY consent_given TINYINT(1) NULL DEFAULT NULL');
    }
};
