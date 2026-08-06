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

        DB::statement("ALTER TABLE leads MODIFY status ENUM('new', 'contacted', 'qualified', 'scheduled', 'negotiation', 'converted', 'lost', 'archived', 'closed') NOT NULL DEFAULT 'new'");
        DB::statement("ALTER TABLE campaign_recipients MODIFY status ENUM('pending', 'sent', 'opened', 'clicked', 'bounced', 'unsubscribed', 'delivered', 'failed') NOT NULL DEFAULT 'pending'");
        DB::statement("ALTER TABLE email_campaigns MODIFY status ENUM('draft', 'scheduled', 'sending', 'sent', 'paused', 'failed', 'sent_with_errors', 'cancelled') NOT NULL DEFAULT 'draft'");
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE leads MODIFY status ENUM('new', 'contacted', 'qualified', 'scheduled', 'negotiation', 'converted', 'lost', 'archived') NOT NULL DEFAULT 'new'");
        DB::statement("ALTER TABLE campaign_recipients MODIFY status ENUM('pending', 'sent', 'opened', 'clicked', 'bounced', 'unsubscribed') NOT NULL DEFAULT 'pending'");
        DB::statement("ALTER TABLE email_campaigns MODIFY status ENUM('draft', 'scheduled', 'sending', 'sent', 'paused') NOT NULL DEFAULT 'draft'");
    }
};
