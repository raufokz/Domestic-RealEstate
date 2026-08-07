<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mortgage_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('lender_name');
            $table->unsignedInteger('amount');
            $table->decimal('rate', 5, 3)->nullable();
            $table->unsignedTinyInteger('term_years')->default(30);
            $table->decimal('monthly_payment', 10, 2)->nullable();
            $table->enum('status', ['applied', 'pre_approved', 'approved', 'denied', 'withdrawn'])->default('applied');
            $table->text('notes')->nullable();
            $table->timestamp('applied_at')->useCurrent();
            $table->timestamps();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mortgage_applications');
    }
};
