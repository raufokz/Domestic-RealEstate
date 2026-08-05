<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contract_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('version_number');
            $table->longText('template_html')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('change_note')->nullable();
            $table->timestamps();

            $table->unique(['contract_id', 'version_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contract_versions');
    }
};
