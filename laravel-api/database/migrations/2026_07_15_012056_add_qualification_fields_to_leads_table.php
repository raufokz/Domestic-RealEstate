<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('property_type')->nullable()->after('type');
            $table->string('bedrooms')->nullable()->after('property_type');
            $table->string('bathrooms')->nullable()->after('bedrooms');
            $table->string('location')->nullable()->after('bathrooms');
            $table->string('financing')->nullable()->after('location');
            $table->boolean('pre_approved')->nullable()->after('financing');
            $table->string('credit_score')->nullable()->after('pre_approved');
            $table->string('realtor_status')->nullable()->after('credit_score');
            $table->string('contact_time')->nullable()->after('realtor_status');
            $table->boolean('consent_given')->nullable()->after('contact_time');
            $table->json('chat_metadata')->nullable()->after('consent_given');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn([
                'property_type', 'bedrooms', 'bathrooms', 'location',
                'financing', 'pre_approved', 'credit_score',
                'realtor_status', 'contact_time', 'consent_given', 'chat_metadata',
            ]);
        });
    }
};
