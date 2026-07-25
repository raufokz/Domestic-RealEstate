<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_test_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('integration_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('result', ['success', 'failure']);
            $table->text('response_summary')->nullable();
            $table->timestamps();

            $table->index('integration_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_test_logs');
    }
};
