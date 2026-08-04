<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geo_access_logs', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 45);
            $table->string('country_code', 2)->nullable();
            $table->string('country_name')->nullable();
            $table->string('city')->nullable();
            $table->unsignedInteger('asn')->nullable();
            $table->string('isp')->nullable();
            $table->boolean('is_vpn')->default(false);
            $table->boolean('is_tor')->default(false);
            $table->boolean('is_datacenter')->default(false);
            $table->string('reason');
            $table->text('url')->nullable();
            $table->string('method', 10)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index('ip_address');
            $table->index('country_code');
            $table->index('reason');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geo_access_logs');
    }
};
