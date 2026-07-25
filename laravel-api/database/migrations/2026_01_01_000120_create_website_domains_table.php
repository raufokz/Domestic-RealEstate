<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('website_domains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->cascadeOnDelete();
            $table->string('domain'); // johnrealtor.com or johnsmith.domesticrealestate.us
            $table->enum('type', ['subdomain', 'custom'])->default('subdomain');
            $table->enum('status', ['pending', 'verifying', 'verified', 'active', 'failed', 'expired'])->default('pending');
            $table->json('dns_records')->nullable(); // A/CNAME records needed
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('ssl_issued_at')->nullable();
            $table->text('last_error_message')->nullable();
            $table->timestamps();

            $table->unique('domain');
            $table->index('website_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('website_domains');
    }
};
