<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_form_fields', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('user_id');
            $t->string('form_type', 50);       // buyer, seller, investor, contact, general
            $t->string('field_label', 255);
            $t->string('field_type', 30);       // text, textarea, dropdown, checkbox, date, file
            $t->json('options')->nullable();     // dropdown choices, validation rules
            $t->boolean('is_required')->default(false);
            $t->integer('sort_order')->default(0);
            $t->boolean('is_active')->default(true);
            $t->timestamps();

            $t->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $t->index(['user_id', 'form_type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_form_fields');
    }
};
