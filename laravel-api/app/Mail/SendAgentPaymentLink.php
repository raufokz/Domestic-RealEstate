<?php

namespace App\Mail;

use App\Models\AgentProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendAgentPaymentLink extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public AgentProfile $agentProfile) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Action Required: Finalize Your Preferred Agent Activation \u{1F680}",
            from: new Address(
                config('mail.from.address', 'info@domesticrealestate.us'),
                config('mail.from.name', 'Domestic Real Estate')
            ),
        );
    }

    public function content(): Content
    {
        $prefs = (array) ($this->agentProfile->lead_type_preferences ?? []);

        return new Content(
            markdown: 'emails.agent-payment-link',
            with: [
                'firstName' => trim(explode(' ', (string) ($this->agentProfile->user?->name ?? 'there'))[0]) ?: 'there',
                'planName' => $prefs['pricing_plan'] ?? 'Preferred Agent',
                'billingCycle' => str_contains((string) ($prefs['pricing_plan'] ?? ''), 'Free') ? 'N/A' : (($prefs['billing_cycle'] ?? null) === 'annual' ? 'Annual' : 'Monthly'),
                'services' => (array) ($this->agentProfile->specialties ?? []),
                'checkoutUrl' => $this->agentProfile->payoneer_checkout_url,
            ],
        );
    }
}
