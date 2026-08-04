<?php

namespace App\Jobs;

use App\Models\Lead;
use App\Services\LeadNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Sends the admin alert + lead welcome email for a newly captured lead.
 *
 * Previously ran inline inside LeadNotificationService::dispatch(), which meant
 * every public lead-form submission blocked its HTTP response on two synchronous
 * SMTP sends. Moved onto the queue so form submits return immediately.
 */
class SendLeadNotificationEmails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 60;

    public function __construct(public int $leadId, public string $type)
    {
    }

    public function handle(): void
    {
        $lead = Lead::find($this->leadId);
        if (!$lead) {
            return;
        }

        LeadNotificationService::sendEmails($lead, $this->type);
    }
}
