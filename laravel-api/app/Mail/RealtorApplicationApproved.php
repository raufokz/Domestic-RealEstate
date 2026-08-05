<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RealtorApplicationApproved extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(public User $user, public string $setPasswordUrl)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Realtor Application Has Been Approved',
            from: new Address(
                config('mail.from.address', 'info@domesticrealestate.us'),
                config('mail.from.name', 'Domestic Real Estate')
            ),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.realtor-application-approved',
            with: [
                'firstName' => trim(explode(' ', $this->user->name)[0]) ?: 'there',
                'setPasswordUrl' => $this->setPasswordUrl,
            ],
        );
    }
}
