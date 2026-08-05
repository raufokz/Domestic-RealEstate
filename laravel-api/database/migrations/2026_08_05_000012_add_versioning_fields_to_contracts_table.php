<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->unsignedInteger('current_version')->default(1)->after('status');
            $table->foreignId('contract_template_id')->nullable()->after('template_name')->constrained('contract_templates')->nullOnDelete();
            $table->foreignId('renewed_from_contract_id')->nullable()->after('created_by')->constrained('contracts')->nullOnDelete();
            $table->timestamp('last_reminder_sent_at')->nullable()->after('expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('contract_template_id');
            $table->dropConstrainedForeignId('renewed_from_contract_id');
            $table->dropColumn(['current_version', 'last_reminder_sent_at']);
        });
    }
};
