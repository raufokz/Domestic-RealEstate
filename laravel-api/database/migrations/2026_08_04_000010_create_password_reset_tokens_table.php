<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Laravel's standard password-broker table (config/auth.php:98) — missing
 * entirely from this app's migration history, which meant forgot-password/
 * reset-password (and this phase's realtor-approval "set your password"
 * email) have never actually been able to work: Password::broker() throws
 * on any operation without this table.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
    }
};
