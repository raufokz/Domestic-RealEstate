<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * CampaignEmailController::bulkFollowUp() already builds a recipient name
 * from the contact's first/last name but had nowhere to store it, so every
 * campaign recipient's name was silently discarded on create() (not
 * $fillable, no column) — merge tags like {{first_name}} could never
 * resolve to a real name. This restores the column the controller already
 * expects.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaign_recipients', function (Blueprint $table) {
            $table->string('name')->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('campaign_recipients', function (Blueprint $table) {
            $table->dropColumn('name');
        });
    }
};
