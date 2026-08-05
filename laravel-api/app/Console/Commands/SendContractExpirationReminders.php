<?php

namespace App\Console\Commands;

use App\Mail\ContractExpiringReminder;
use App\Models\Contract;
use App\Models\ContractActivityLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendContractExpirationReminders extends Command
{
    protected $signature = 'contracts:send-expiration-reminders {--days=3 : Send a reminder when a contract expires within this many days}';

    protected $description = 'Email a reminder to sign contracts that are still "sent" and expiring soon, without duplicating reminders already sent today.';

    public function handle(): int
    {
        $days = (int) $this->option('days');

        $contracts = Contract::with('user')
            ->where('status', 'sent')
            ->whereNotNull('expires_at')
            ->where('expires_at', '>', now())
            ->where('expires_at', '<=', now()->addDays($days))
            ->where(function ($q) {
                $q->whereNull('last_reminder_sent_at')
                    ->orWhere('last_reminder_sent_at', '<', now()->subDay());
            })
            ->get();

        if ($contracts->isEmpty()) {
            $this->info('No contracts due for an expiration reminder.');

            return self::SUCCESS;
        }

        foreach ($contracts as $contract) {
            if (!$contract->user?->email) {
                continue;
            }

            Mail::to($contract->user->email)->queue(new ContractExpiringReminder($contract));

            $contract->update(['last_reminder_sent_at' => now()]);
            ContractActivityLog::log($contract->id, 'reminder_sent');

            $this->info("Reminder queued for {$contract->contract_number} ({$contract->user->email}).");
        }

        return self::SUCCESS;
    }
}
