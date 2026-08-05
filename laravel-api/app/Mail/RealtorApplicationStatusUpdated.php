<?php

namespace App\Mail;

use App\Models\RealtorApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RealtorApplicationStatusUpdated extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(public RealtorApplication $application)
    {
    }

    public function envelope(): Envelope
    {
        $subject = match ($this->application->status) {
            'rejected' => 'Update on Your Realtor Application',
            'more_info_requested' => 'Action Needed: Your Realtor Application',
            default => 'Your Realtor Application Status Has Changed',
        };

        return new Envelope(
            subject: $subject,
            from: new Address(
                config('mail.from.address', 'info@domesticrealestate.us'),
                config('mail.from.name', 'Domestic Real Estate')
            ),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.realtor-application-status',
            with: [
                'firstName' => trim(explode(' ', $this->application->full_name)[0]) ?: 'there',
                'status' => $this->application->status,
                'reviewNotes' => $this->application->review_notes,
                'reference' => $this->application->reference,
                'statusUrl' => rtrim(config('app.frontend_url', config('app.url')), '/') . '/realtors/application-status?ref=' . $this->application->reference,
            ],
        );
    }
}
