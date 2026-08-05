<?php

namespace App\Mail;

use App\Models\Contract;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContractExpiringReminder extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(public Contract $contract)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Action Needed: Contract {$this->contract->contract_number} Expires Soon",
            from: new Address(
                config('mail.from.address', 'info@domesticrealestate.us'),
                config('mail.from.name', 'Domestic Real Estate')
            ),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.contract-expiring-reminder',
            with: [
                'firstName' => trim(explode(' ', (string) ($this->contract->user?->name ?? 'there'))[0]) ?: 'there',
                'contractNumber' => $this->contract->contract_number,
                'templateName' => $this->contract->template_name,
                'expiresAt' => $this->contract->expires_at?->format('F j, Y'),
                'signUrl' => rtrim(config('app.frontend_url', config('app.url')), '/').'/contracts/'.$this->contract->contract_number,
            ],
        );
    }
}
