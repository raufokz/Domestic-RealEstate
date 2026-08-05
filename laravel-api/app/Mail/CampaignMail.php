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
            htmlString: $this->rewriteLinks($this->htmlBody).$this->trackingPixel(),
            text: $this->textBody,
        );
    }

    protected function trackingPixel(): string
    {
        $trackingUrl = $this->trackingBase()."/api/email/track/{$this->trackingId}/open";

        return "<img src=\"{$trackingUrl}\" width=\"1\" height=\"1\" style=\"display:none\" alt=\"\" />";
    }

    protected function trackingBase(): string
    {
        return rtrim((string) config('app.url', 'http://localhost:8001'), '/');
    }

    /**
     * Rewrite absolute http(s) anchors so every click routes through
     * EmailTrackingController@trackClick, which records the click and then
     * redirects to the original URL.
     */
    protected function rewriteLinks(string $html): string
    {
        $base = $this->trackingBase();
        $index = 0;

        return (string) preg_replace_callback(
            '~<a\b([^>]*)>~i',
            function (array $match) use ($base, &$index): string {
                $attrs = $match[1];
                if (!preg_match('~href=["\']([^"\']+)["\']~i', $attrs, $href)) {
                    return $match[0];
                }

                $url = trim($href[1]);
                if ($url === ''
                    || str_starts_with($url, '/api/email/track/')
                    || str_starts_with($url, 'mailto:')
                    || str_starts_with($url, 'tel:')
                    || str_starts_with($url, '#')
                    || str_starts_with($url, '//')
                    || !preg_match('~^https?://~i', $url)) {
                    return $match[0];
                }

                $index++;
                $trackingUrl = "{$base}/api/email/track/{$this->trackingId}/click/{$index}?url=".rawurlencode($url);

                $newAttrs = preg_replace(
                    '~href=["\']([^"\']+)["\']~i',
                    'href="'.$trackingUrl.'"',
                    $attrs,
                    1
                );

                return '<a'.$newAttrs.'>';
            },
            $html
        );
    }
}
