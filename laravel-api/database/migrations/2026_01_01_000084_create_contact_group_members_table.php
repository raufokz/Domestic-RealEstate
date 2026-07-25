<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('contact_groups')->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['group_id', 'contact_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_group_members');
    }
};
