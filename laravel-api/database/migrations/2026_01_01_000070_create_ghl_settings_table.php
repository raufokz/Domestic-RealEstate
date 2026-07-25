<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ghl_settings', function (Blueprint $table) {
            $table->id();
            $table->text('api_key')->nullable();
            $table->string('location_id')->nullable();
            $table->string('sms_from_number')->nullable();
            $table->string('payment_url')->nullable();
            $table->json('pipeline_ids')->nullable();
            $table->json('workflow_ids')->nullable();
            $table->text('webhook_secret')->nullable();
            $table->boolean('sync_enabled')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ghl_settings');
    }
};
