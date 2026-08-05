<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds 'pending' (ProcessEmailCampaign::sendOne() already writes this status
 * while a send is in flight, before updating to sent/failed — the original
 * enum never allowed it, so every campaign email history row failed to
 * insert with a CHECK/enum constraint violation) and 'complained' (for the
 * new bounce/complaint webhook). Uses Blueprint::change() (portable across
 * MySQL/SQLite) rather than raw SQL.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_history', function (Blueprint $table) {
            $table->enum('status', ['pending', 'sent', 'failed', 'bounced', 'complained'])
                ->default('sent')
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('email_history', function (Blueprint $table) {
            $table->enum('status', ['sent', 'failed', 'bounced'])
                ->default('sent')
                ->change();
        });
    }
};
