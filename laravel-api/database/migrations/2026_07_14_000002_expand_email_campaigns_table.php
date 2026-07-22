<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_campaigns', function (Blueprint $table) {
            if (! Schema::hasColumn('email_campaigns', 'body')) {
                $table->longText('body')->nullable()->after('subject');
            }
            if (! Schema::hasColumn('email_campaigns', 'type')) {
                $table->string('type')->nullable()->after('name');
            }
            if (! Schema::hasColumn('email_campaigns', 'from_email')) {
                $table->string('from_email')->nullable()->after('body');
            }
            if (! Schema::hasColumn('email_campaigns', 'reply_to')) {
                $table->string('reply_to')->nullable()->after('from_email');
            }
            if (! Schema::hasColumn('email_campaigns', 'created_by')) {
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('email_campaigns', 'recipient_source')) {
                $table->string('recipient_source')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('email_campaigns', function (Blueprint $table) {
            $cols = ['body', 'type', 'from_email', 'reply_to', 'recipient_source'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('email_campaigns', $col)) {
                    $table->dropColumn($col);
                }
            }
            if (Schema::hasColumn('email_campaigns', 'created_by')) {
                $table->dropConstrainedForeignId('created_by');
            }
        });
    }
};
