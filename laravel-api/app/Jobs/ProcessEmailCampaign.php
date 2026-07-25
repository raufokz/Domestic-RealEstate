<?php

namespace App\Jobs;

use App\Mail\CampaignMail;
use App\Models\CampaignRecipient;
use App\Models\EmailCampaign;
use App\Models\EmailHistory;
use App\Models\SentEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Sends one email campaign to its pending recipients.
 *
 * This previously ran inside the HTTP request, which meant a campaign with a
 * large recipient list would time out mid-send and leave recipients in an
 * inconsistent state. Recipients are now processed in chunks on the queue.
 */
class ProcessEmailCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 900;

    /** Recipients handled per chunk, to keep memory flat on large lists. */
    private const CHUNK = 100;

    public function __construct(public int $campaignId)
    {
    }

    public function handle(): void
    {
        $campaign = EmailCampaign::with('template')->find($this->campaignId);
        if (!$campaign) {
            return;
        }

        $subject = $campaign->subject ?? $campaign->name;
        $htmlBody = $campaign->template?->html_body
            ?: $campaign->template?->body
            ?: $campaign->body
            ?: '<p>'.e($campaign->subject ?? 'Message from Domestic Real Estate').'</p>';
        $textBody = strip_tags($htmlBody);
        $fromEmail = $campaign->from_email ?: config('mail.from.address', 'info@domesticrealestate.us');

        CampaignRecipient::where('campaign_id', $campaign->id)
            ->where('status', 'pending')
            ->chunkById(self::CHUNK, function ($recipients) use ($campaign, $subject, $htmlBody, $textBody, $fromEmail) {
                foreach ($recipients as $recipient) {
                    $this->sendOne($campaign, $recipient, $subject, $htmlBody, $textBody, $fromEmail);
                }
            });

        $stillPending = CampaignRecipient::where('campaign_id', $campaign->id)
            ->where('status', 'pending')
            ->count();

        $failed = CampaignRecipient::where('campaign_id', $campaign->id)
            ->where('status', 'failed')
            ->count();

        $campaign->update([
            'status' => match (true) {
                $stillPending > 0 => 'sending',
                $failed > 0 => 'sent_with_errors',
                default => 'sent',
            },
        ]);
    }

    public function failed(\Throwable $e): void
    {
        Log::error('Email campaign job failed', [
            'campaign_id' => $this->campaignId,
            'error' => $e->getMessage(),
        ]);

        EmailCampaign::where('id', $this->campaignId)->update(['status' => 'failed']);

        // Surface it to admins — a silently failed campaign is invisible otherwise.
        $campaign = EmailCampaign::find($this->campaignId);
        \App\Services\Notifier::campaignFailed(
            $this->campaignId,
            $campaign->name ?? "#{$this->campaignId}",
            $e->getMessage()
        );
    }

    private function sendOne(
        EmailCampaign $campaign,
        CampaignRecipient $recipient,
        string $subject,
        string $htmlBody,
        string $textBody,
        string $fromEmail
    ): void {
        // Never attempt delivery to an address that cannot receive mail.
        if (!$recipient->email || !filter_var($recipient->email, FILTER_VALIDATE_EMAIL)) {
            $recipient->update([
                'status' => 'failed',
                'error_message' => 'Recipient has no valid email address.',
            ]);

            return;
        }

        $trackingId = Str::uuid()->toString();

        $emailHistory = EmailHistory::create([
            'recipient' => $recipient->email,
            'subject' => $subject,
            'body' => $htmlBody,
            'status' => 'pending',
            'opens' => 0,
            'clicks' => 0,
            'sent_at' => now(),
        ]);

        $sentEmail = SentEmail::create([
            'user_id' => $campaign->created_by ?? null,
            'campaign_id' => $campaign->id,
            'to_email' => $recipient->email,
            'from_email' => $fromEmail,
            'subject' => $subject,
            'body' => $htmlBody,
            'status' => 'pending',
            'tracking_id' => $trackingId,
            'sent_at' => now(),
            'metadata' => ['email_history_id' => $emailHistory->id],
        ]);

        try {
            Mail::to($recipient->email)->send(new CampaignMail(
                emailSubject: $subject,
                htmlBody: $htmlBody,
                textBody: $textBody,
                trackingId: $trackingId,
            ));

            $sentEmail->update(['status' => 'sent']);
            $emailHistory->update(['status' => 'sent']);
            $recipient->update(['status' => 'sent', 'sent_at' => now()]);
        } catch (\Throwable $e) {
            $sentEmail->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
            $emailHistory->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
            $recipient->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
        }
    }
}
