<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            // Personal Information
            if (!Schema::hasColumn('agent_profiles', 'middle_name')) $table->string('middle_name')->nullable()->after('slug');
            if (!Schema::hasColumn('agent_profiles', 'preferred_name')) $table->string('preferred_name')->nullable()->after('middle_name');
            if (!Schema::hasColumn('agent_profiles', 'dob')) $table->date('dob')->nullable()->after('preferred_name');
            if (!Schema::hasColumn('agent_profiles', 'gender')) $table->string('gender')->nullable()->after('dob');
            if (!Schema::hasColumn('agent_profiles', 'ethnicity')) $table->string('ethnicity')->nullable()->after('gender');
            if (!Schema::hasColumn('agent_profiles', 'nationality')) $table->string('nationality')->nullable()->after('ethnicity');
            if (!Schema::hasColumn('agent_profiles', 'timezone')) $table->string('timezone')->default('America/New_York')->after('nationality');

            // Media Files
            if (!Schema::hasColumn('agent_profiles', 'profile_photo')) $table->string('profile_photo')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'cover_photo')) $table->string('cover_photo')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'company_logo')) $table->string('company_logo')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'intro_video_url')) $table->string('intro_video_url')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'office_photos')) $table->json('office_photos')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'team_photos')) $table->json('team_photos')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'property_portfolio_images')) $table->json('property_portfolio_images')->nullable();

            // Contact Info
            if (!Schema::hasColumn('agent_profiles', 'secondary_email')) $table->string('secondary_email')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'mobile_number')) $table->string('mobile_number')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'office_number')) $table->string('office_number')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'whatsapp_number')) $table->string('whatsapp_number')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'fax')) $table->string('fax')->nullable();

            // Professional Info
            if (!Schema::hasColumn('agent_profiles', 'license_state')) $table->string('license_state')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'license_expiry_date')) $table->date('license_expiry_date')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'brokerage_address')) $table->string('brokerage_address')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'brokerage_website')) $table->string('brokerage_website')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'brokerage_contact')) $table->string('brokerage_contact')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'mls_number')) $table->string('mls_number')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'nar_membership')) $table->boolean('nar_membership')->default(false);
            if (!Schema::hasColumn('agent_profiles', 'realtor_membership')) $table->boolean('realtor_membership')->default(false);
            if (!Schema::hasColumn('agent_profiles', 'certifications')) $table->json('certifications')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'awards')) $table->json('awards')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'designations')) $table->json('designations')->nullable();

            // Business & Team Information
            if (!Schema::hasColumn('agent_profiles', 'business_name')) $table->string('business_name')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'business_email')) $table->string('business_email')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'business_phone')) $table->string('business_phone')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'office_hours')) $table->json('office_hours')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'team_name')) $table->string('team_name')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'team_members')) $table->json('team_members')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'assistant_info')) $table->json('assistant_info')->nullable();

            // Expertise
            if (!Schema::hasColumn('agent_profiles', 'property_types')) $table->json('property_types')->nullable();

            // Preferences
            if (!Schema::hasColumn('agent_profiles', 'notification_preferences')) $table->json('notification_preferences')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'privacy_settings')) $table->json('privacy_settings')->nullable();

            // Verification Details
            if (!Schema::hasColumn('agent_profiles', 'rejection_reason')) $table->text('rejection_reason')->nullable();
            if (!Schema::hasColumn('agent_profiles', 'verified_by')) $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            if (!Schema::hasColumn('agent_profiles', 'verified_at')) $table->timestamp('verified_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'middle_name', 'preferred_name', 'dob', 'gender', 'ethnicity', 'nationality', 'timezone',
                'profile_photo', 'cover_photo', 'company_logo', 'intro_video_url', 'office_photos', 'team_photos', 'property_portfolio_images',
                'secondary_email', 'mobile_number', 'office_number', 'whatsapp_number', 'fax',
                'license_state', 'license_expiry_date', 'brokerage_address', 'brokerage_website', 'brokerage_contact', 'mls_number', 'nar_membership', 'realtor_membership', 'certifications', 'awards', 'designations',
                'business_name', 'business_email', 'business_phone', 'office_hours', 'team_name', 'team_members', 'assistant_info',
                'property_types', 'notification_preferences', 'privacy_settings', 'rejection_reason', 'verified_by', 'verified_at'
            ]);
        });
    }
};
