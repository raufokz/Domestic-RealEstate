<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The integration catalogue includes Payoneer (category "payments") and SMS
 * providers, but the original enum omitted both — inserting Payoneer failed
 * with "Data truncated for column 'category'".
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE integrations MODIFY category ENUM('social','email','ai','maps','calendar','storage','analytics','esign','automation','payments','sms','other') NOT NULL DEFAULT 'other'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE integrations MODIFY category ENUM('social','email','ai','maps','calendar','storage','analytics','esign','automation','other') NOT NULL DEFAULT 'other'");
    }
};
