<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('automation_workflows', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('trigger_type'); // new_lead, form_submitted, status_changed, property_approved, appointment_booked, contract_signed, newsletter_subscribed, contact_imported, scheduled_time
            $table->json('trigger_conditions')->nullable(); // field=value conditions
            $table->json('actions'); // array of {type, config} - send_email, notification, create_task, assign_agent, update_status, post_social, add_tag, add_to_campaign
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('run_count')->default(0);
            $table->timestamp('last_run_at')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'trigger_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_workflows');
    }
};
