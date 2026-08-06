<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->json('items')->nullable()->after('description');
            $table->decimal('subtotal', 12, 2)->nullable()->after('amount');
            $table->decimal('tax_rate', 5, 2)->nullable()->after('subtotal');
            $table->decimal('tax_amount', 12, 2)->nullable()->after('tax_rate');
            $table->string('description')->nullable()->change();
        });

        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE invoices MODIFY status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled', 'voided') NOT NULL DEFAULT 'draft'");
        }
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE invoices MODIFY status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'draft'");
        }

        Schema::table('invoices', function (Blueprint $table) {
            $table->string('description')->nullable(false)->change();
            $table->dropColumn(['items', 'subtotal', 'tax_rate', 'tax_amount']);
        });
    }
};
