<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mail_settings', function (Blueprint $table) {
            $table->id();
            $table->string('smtp_host');
            $table->unsignedSmallInteger('smtp_port');
            $table->enum('smtp_encryption', ['ssl', 'tls'])->default('tls');
            $table->string('smtp_username');
            $table->text('smtp_password')->nullable();
            $table->string('from_name');
            $table->string('from_email');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mail_settings');
    }
};
