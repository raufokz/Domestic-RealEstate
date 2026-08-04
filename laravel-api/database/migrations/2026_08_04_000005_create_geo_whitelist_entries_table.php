<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geo_whitelist_entries', function (Blueprint $table) {
            $table->id();
            $table->string('value', 100)->unique();
            $table->boolean('is_cidr')->default(false);
            $table->string('note')->nullable();
            $table->string('country_code', 2)->nullable();
            $table->enum('status', ['active', 'disabled'])->default('active');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geo_whitelist_entries');
    }
};
