<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ghl_field_mappings', function (Blueprint $table) {
            $table->id();
            $table->string('local_field');
            $table->string('ghl_field');
            $table->enum('entity_type', ['contact', 'lead', 'deal']);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ghl_field_mappings');
    }
};
