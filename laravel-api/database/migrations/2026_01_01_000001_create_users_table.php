<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['super_admin', 'admin', 'staff', 'agent', 'broker', 'buyer', 'seller', 'lender', 'title_company', 'investor', 'vendor'])->default('buyer');
            $table->enum('status', ['active', 'inactive', 'suspended', 'pending'])->default('active');
            $table->string('phone')->nullable();
            $table->boolean('phone_verified')->default(false);
            $table->string('normalized_phone')->nullable();
            $table->string('avatar')->nullable();
            $table->string('timezone')->default('America/New_York');
            $table->string('locale')->default('en');
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
