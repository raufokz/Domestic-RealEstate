<?php

namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceSent extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(public Invoice $invoice, public string $checkoutUrl)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Invoice {$this->invoice->invoice_number} from " . config('app.name'),
            from: new Address(
                config('mail.from.address', 'info@domesticrealestate.us'),
                config('mail.from.name', 'Domestic Real Estate')
            ),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.invoice-sent',
            with: [
                'firstName' => trim(explode(' ', (string) ($this->invoice->user?->name ?? 'there'))[0]) ?: 'there',
                'invoiceNumber' => $this->invoice->invoice_number,
                'amount' => number_format($this->invoice->amount, 2),
                'currency' => $this->invoice->currency,
                'description' => $this->invoice->description,
                'checkoutUrl' => $this->checkoutUrl,
            ],
        );
    }
}
