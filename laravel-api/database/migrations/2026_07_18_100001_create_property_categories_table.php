<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Property Categories = use-class groupings (Residential, Commercial, Land, ...)
 * that sit ABOVE property types. Hierarchy: property_categories -> property_types -> properties.
 *
 * A dedicated table is used (rather than a self-referencing parent_id on property_types)
 * because existing property_types rows are already concrete types; grouping them under
 * categories via a FK avoids reclassifying existing data.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('is_active');
            $table->index('sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_categories');
    }
};
