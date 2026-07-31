<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // campaign_recipients.contact_id -> contacts (missing FK)
        Schema::table('campaign_recipients', function (Blueprint $table) {
            $table->foreign('contact_id', 'fk_campaign_recipients_contact_id')
                  ->references('id')->on('contacts')->nullOnDelete();
        });

        // page_views.user_id -> users (missing FK)
        Schema::table('page_views', function (Blueprint $table) {
            $table->foreign('user_id', 'fk_page_views_user_id')
                  ->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('campaign_recipients', function (Blueprint $table) {
            $table->dropForeign('fk_campaign_recipients_contact_id');
        });
        Schema::table('page_views', function (Blueprint $table) {
            $table->dropForeign('fk_page_views_user_id');
        });
    }
};
