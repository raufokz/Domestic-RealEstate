<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE users MODIFY role ENUM('super_admin', 'admin', 'staff', 'agent', 'broker', 'buyer', 'seller', 'lender', 'title_company', 'investor', 'vendor', 'wholesaler') NOT NULL DEFAULT 'buyer'");
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE users MODIFY role ENUM('super_admin', 'admin', 'staff', 'agent', 'broker', 'buyer', 'seller', 'lender', 'title_company', 'investor', 'vendor') NOT NULL DEFAULT 'buyer'");
    }
};
