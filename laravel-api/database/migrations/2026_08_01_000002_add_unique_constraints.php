<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // user_roles: prevent duplicate role assignments per user
        Schema::table('user_roles', function (Blueprint $table) {
            $table->unique(['user_id', 'role_name'], 'user_roles_user_id_role_name_unique');
        });

        // purchased_leads: prevent duplicate lead purchases
        Schema::table('purchased_leads', function (Blueprint $table) {
            $table->unique(['lead_id', 'user_id'], 'purchased_leads_lead_user_unique');
        });

        // featured_listings: prevent duplicate features per user
        Schema::table('featured_listings', function (Blueprint $table) {
            $table->unique(['user_id', 'property_id'], 'featured_listings_user_property_unique');
        });

        // campaign_recipients: prevent duplicate sends to same contact in a campaign
        Schema::table('campaign_recipients', function (Blueprint $table) {
            $table->unique(['campaign_id', 'contact_id'], 'campaign_recipients_campaign_contact_unique');
        });

        // email_unsubscribes: one unsubscribe record per email
        Schema::table('email_unsubscribes', function (Blueprint $table) {
            $table->unique('email', 'email_unsubscribes_email_unique');
        });

        // user_memberships: one membership plan entry per user
        Schema::table('user_memberships', function (Blueprint $table) {
            $table->unique(['user_id', 'plan_id'], 'user_memberships_user_plan_unique');
        });
    }

    public function down(): void
    {
        Schema::table('user_roles', function (Blueprint $table) {
            $table->dropUnique('user_roles_user_id_role_name_unique');
        });
        Schema::table('purchased_leads', function (Blueprint $table) {
            $table->dropUnique('purchased_leads_lead_user_unique');
        });
        Schema::table('featured_listings', function (Blueprint $table) {
            $table->dropUnique('featured_listings_user_property_unique');
        });
        Schema::table('campaign_recipients', function (Blueprint $table) {
            $table->dropUnique('campaign_recipients_campaign_contact_unique');
        });
        Schema::table('email_unsubscribes', function (Blueprint $table) {
            $table->dropUnique('email_unsubscribes_email_unique');
        });
        Schema::table('user_memberships', function (Blueprint $table) {
            $table->dropUnique('user_memberships_user_plan_unique');
        });
    }
};
