<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            if (!Schema::hasColumn('leads', 'state')) {
                $table->string('state')->nullable()->after('location');
            }
            if (!Schema::hasColumn('leads', 'city')) {
                $table->string('city')->nullable()->after('state');
            }
            if (!Schema::hasColumn('leads', 'attachments')) {
                $table->json('attachments')->nullable()->after('chat_metadata');
            }
            if (!Schema::hasColumn('leads', 'views_count')) {
                $table->unsignedInteger('views_count')->default(0)->after('attachments');
            }
            if (!Schema::hasColumn('leads', 'publish_at')) {
                $table->timestamp('publish_at')->nullable()->after('listed_at');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'ppl_eligible')) {
                $table->boolean('ppl_eligible')->default(true)->after('status');
            }
            if (!Schema::hasColumn('users', 'ppl_access_enabled')) {
                $table->boolean('ppl_access_enabled')->default(true)->after('ppl_eligible');
            }
        });

        if (!Schema::hasTable('marketplace_payment_logs')) {
            Schema::create('marketplace_payment_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('purchase_id')->nullable()->constrained('marketplace_lead_purchases')->nullOnDelete();
                $table->foreignId('lead_id')->constrained('leads')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('payment_gateway')->default('stripe');
                $table->string('gateway_transaction_id')->nullable();
                $table->decimal('amount', 8, 2);
                $table->string('currency', 10)->default('USD');
                $table->enum('status', ['pending', 'successful', 'failed', 'refunded'])->default('pending');
                $table->json('payload')->nullable();
                $table->text('error_message')->nullable();
                $table->timestamps();

                $table->index(['lead_id', 'user_id']);
                $table->index('gateway_transaction_id');
                $table->index('status');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_payment_logs');

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'ppl_access_enabled')) {
                $table->dropColumn('ppl_access_enabled');
            }
            if (Schema::hasColumn('users', 'ppl_eligible')) {
                $table->dropColumn('ppl_eligible');
            }
        });

        Schema::table('leads', function (Blueprint $table) {
            $cols = [];
            if (Schema::hasColumn('leads', 'state')) $cols[] = 'state';
            if (Schema::hasColumn('leads', 'city')) $cols[] = 'city';
            if (Schema::hasColumn('leads', 'attachments')) $cols[] = 'attachments';
            if (Schema::hasColumn('leads', 'views_count')) $cols[] = 'views_count';
            if (Schema::hasColumn('leads', 'publish_at')) $cols[] = 'publish_at';
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
