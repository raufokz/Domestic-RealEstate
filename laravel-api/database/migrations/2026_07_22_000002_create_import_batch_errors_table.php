<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('import_batch_errors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('import_batch_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('row_number');

            // Machine-readable reason so the UI can group/filter failures.
            $table->string('reason_code', 60);
            $table->string('reason');

            // The original row, so the admin can download and correct it.
            $table->json('row_data')->nullable();
            $table->timestamps();

            $table->index(['import_batch_id', 'reason_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('import_batch_errors');
    }
};
