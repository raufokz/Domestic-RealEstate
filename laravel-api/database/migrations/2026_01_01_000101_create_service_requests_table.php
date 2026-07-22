<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('service_type');
            $table->string('budget_range')->nullable();
            $table->string('timeline')->nullable();
            $table->text('message')->nullable();
            $table->string('how_did_you_hear')->nullable();
            $table->json('metadata')->nullable();
            $table->enum('status', ['new', 'reviewed', 'quoted', 'contract_sent', 'signed', 'activated', 'cancelled'])->default('new');
            $table->foreignId('assigned_admin')->nullable()->constrained('users')->nullOnDelete();
            $table->text('admin_notes')->nullable();
            $table->timestamp('quoted_at')->nullable();
            $table->timestamp('contract_sent_at')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_requests');
    }
};
