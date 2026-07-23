<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('import_batches', function (Blueprint $table) {
            $table->id();
            $table->string('import_type')->default('leads');
            $table->string('file_name');
            $table->string('file_path')->nullable();
            $table->string('format', 20)->default('csv');
            $table->enum('status', ['pending', 'processing', 'completed', 'completed_with_errors', 'failed'])
                ->default('pending');

            // Detected/confirmed header -> field mapping, e.g. {"email": "Email Address"}
            $table->json('column_map')->nullable();
            $table->json('detected_headers')->nullable();

            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('rows_imported')->default(0);
            $table->unsignedInteger('rows_updated')->default(0);
            $table->unsignedInteger('rows_failed')->default(0);
            $table->unsignedInteger('rows_without_email')->default(0);

            $table->text('error_message')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['import_type', 'status']);
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('import_batches');
    }
};
