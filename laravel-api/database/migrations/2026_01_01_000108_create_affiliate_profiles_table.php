<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affiliate_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('unique_code', 32)->unique();
            $table->unsignedInteger('total_clicks')->default(0);
            $table->unsignedInteger('total_conversions')->default(0);
            $table->decimal('total_earnings', 12, 2)->default(0);
            $table->decimal('pending_payout', 12, 2)->default(0);
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->timestamps();
        });

        Schema::create('affiliate_referral_clicks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_id')->constrained('affiliate_profiles')->cascadeOnDelete();
            $table->string('ip_hash', 64);
            $table->string('user_agent_hash', 64);
            $table->string('landing_page')->nullable();
            $table->string('referrer_url')->nullable();
            $table->boolean('converted')->default(false);
            $table->foreignId('converted_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('converted_at')->nullable();
            $table->timestamps();
            $table->index(['affiliate_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliate_referral_clicks');
        Schema::dropIfExists('affiliate_profiles');
    }
};
