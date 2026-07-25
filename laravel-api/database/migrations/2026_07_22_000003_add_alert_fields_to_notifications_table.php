<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin alerts need more than title + message: an operator has to see how bad it
 * is, which subsystem broke, what to do about it, and whether it is resolved.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('severity', 20)->default('info')->after('type');
            $table->string('module', 60)->nullable()->after('severity');
            $table->text('fix')->nullable()->after('message');
            $table->string('action_url')->nullable()->after('fix');
            $table->string('action_label', 80)->nullable()->after('action_url');
            $table->timestamp('resolved_at')->nullable()->after('read_at');
            $table->foreignId('resolved_by')->nullable()->after('resolved_at');
            // Lets the notifier collapse a repeating failure instead of flooding
            // every admin's bell with the same alert every minute.
            $table->string('dedupe_key')->nullable()->after('resolved_by');
            $table->unsignedInteger('occurrences')->default(1)->after('dedupe_key');

            $table->index(['user_id', 'read_at']);
            $table->index(['severity', 'resolved_at']);
            $table->index('dedupe_key');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'read_at']);
            $table->dropIndex(['severity', 'resolved_at']);
            $table->dropIndex(['dedupe_key']);
            $table->dropColumn([
                'severity', 'module', 'fix', 'action_url', 'action_label',
                'resolved_at', 'resolved_by', 'dedupe_key', 'occurrences',
            ]);
        });
    }
};
