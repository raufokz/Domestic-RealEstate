<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geo_tor_exit_nodes', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 45)->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geo_tor_exit_nodes');
    }
};
