<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->enum('marketplace_status', ['none', 'available', 'reserved', 'sold'])->default('none')->after('status');
            $table->string('marketplace_title')->nullable()->after('marketplace_status');
            $table->string('marketplace_category')->nullable()->after('marketplace_title');
            $table->text('marketplace_description')->nullable()->after('marketplace_category');
            $table->decimal('marketplace_price', 8, 2)->nullable()->after('marketplace_description');
            $table->foreignId('reserved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reservation_expires_at')->nullable()->after('reserved_by');
            $table->foreignId('sold_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('sold_at')->nullable()->after('sold_to');
            $table->timestamp('listed_at')->nullable()->after('sold_at');

            $table->index('marketplace_status');
        });

        Schema::create('marketplace_lead_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('amount', 8, 2);
            $table->enum('status', ['pending', 'paid', 'refunded', 'cancelled'])->default('pending');
            $table->string('reservation_token')->nullable();
            $table->timestamp('reserved_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('purchased_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['lead_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_lead_purchases');

        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['reserved_by']);
            $table->dropForeign(['sold_to']);
            $table->dropIndex(['marketplace_status']);
            $table->dropColumn([
                'marketplace_status',
                'marketplace_title',
                'marketplace_category',
                'marketplace_description',
                'marketplace_price',
                'reserved_by',
                'reservation_expires_at',
                'sold_to',
                'sold_at',
                'listed_at',
            ]);
        });
    }
};
