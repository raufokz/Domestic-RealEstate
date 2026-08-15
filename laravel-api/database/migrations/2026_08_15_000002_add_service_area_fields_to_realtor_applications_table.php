<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('realtor_applications', function (Blueprint $table) {
            $table->json('zip_codes')->nullable()->after('license_state');
            $table->unsignedInteger('radius_miles')->nullable()->after('zip_codes');
            $table->json('lead_type_preferences')->nullable()->after('radius_miles');
            $table->json('languages_spoken')->nullable()->after('lead_type_preferences');
            $table->boolean('email_verified')->default(false)->after('languages_spoken');
        });
    }

    public function down(): void
    {
        Schema::table('realtor_applications', function (Blueprint $table) {
            $table->dropColumn(['zip_codes', 'radius_miles', 'lead_type_preferences', 'languages_spoken', 'email_verified']);
        });
    }
};
