<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CampaignMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $emailSubject,
        public string $htmlBody,
        public string $textBody,
        public string $trackingId,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->emailSubject,
            from: new Address(
                config('mail.from.address', 'info@domesticrealestate.us'),
                config('mail.from.name', 'Domestic Real Estate')
            ),
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->htmlBody.$this->trackingPixel(),
            textString: $this->textBody,
        );
    }

    protected function trackingPixel(): string
    {
        $trackingUrl = config('app.url', 'http://localhost:8001')."/api/email/track/{$this->trackingId}/open";

        return "<img src=\"{$trackingUrl}\" width=\"1\" height=\"1\" style=\"display:none\" alt=\"\" />";
    }
}
