<?php

namespace Tests\Feature;

use App\Mail\CampaignMail;
use App\Models\EmailHistory;
use App\Models\SentEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailTrackingTest extends TestCase
{
    use RefreshDatabase;

    public function test_campaign_mail_rewrites_absolute_links_for_click_tracking(): void
    {
        config(['app.url' => 'http://localhost:8000']);

        $body = <<<'HTML'
        <p><a href="https://example.com/properties/42">View listing</a></p>
        <a href="mailto:support@example.com">Email us</a>
        <a href="#top">Jump to top</a>
        <a href="/relative">Relative</a>
        HTML;

        Mail::fake();
        Mail::to('jane@example.com')->send(new CampaignMail('Subject', $body, 'Subject', 'track-123'));

        $mail = Mail::sent(CampaignMail::class)->first();
        $html = $mail->render();

        $this->assertStringContainsString(
            'http://localhost:8000/api/email/track/track-123/click/1?url=https%3A%2F%2Fexample.com%2Fproperties%2F42',
            $html
        );
        $this->assertStringContainsString('mailto:support@example.com', $html);
        $this->assertStringContainsString('href="#top"', $html);
        $this->assertStringContainsString('href="/relative"', $html);
        $this->assertStringContainsString('http://localhost:8000/api/email/track/track-123/open', $html);
    }

    public function test_campaign_mail_numbers_multiple_tracked_links(): void
    {
        config(['app.url' => 'http://localhost:8000']);

        $body = '<a href="https://a.com/1">One</a> <a href="https://b.com/2">Two</a>';

        Mail::fake();
        Mail::to('jane@example.com')->send(new CampaignMail('Subject', $body, 'Subject', 'track-456'));

        $mail = Mail::sent(CampaignMail::class)->first();
        $html = $mail->render();

        $this->assertStringContainsString('/click/1?url=https%3A%2F%2Fa.com%2F1', $html);
        $this->assertStringContainsString('/click/2?url=https%3A%2F%2Fb.com%2F2', $html);
    }

    public function test_open_tracking_records_and_returns_gif(): void
    {
        $history = EmailHistory::create([
            'recipient' => 'reader@example.com',
            'subject' => 'Test',
            'body' => '<p>Test</p>',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        SentEmail::create([
            'to_email' => 'reader@example.com',
            'from_email' => 'info@domesticrealestate.us',
            'subject' => 'Test',
            'body' => '<p>Test</p>',
            'status' => 'sent',
            'tracking_id' => 'tid-open-1',
            'sent_at' => now(),
            'metadata' => ['email_history_id' => $history->id],
        ]);

        $response = $this->get('/api/email/track/tid-open-1/open');

        $response->assertOk()->assertHeader('Content-Type', 'image/gif');
        $this->assertDatabaseHas('email_tracking', [
            'email_history_id' => $history->id,
            'type' => 'open',
        ]);
        $this->assertSame(1, $history->fresh()->opens);
    }

    public function test_click_tracking_records_click_and_redirects(): void
    {
        $history = EmailHistory::create([
            'recipient' => 'clicker@example.com',
            'subject' => 'Test',
            'body' => '<p>Test</p>',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        SentEmail::create([
            'to_email' => 'clicker@example.com',
            'from_email' => 'info@domesticrealestate.us',
            'subject' => 'Test',
            'body' => '<p>Test</p>',
            'status' => 'sent',
            'tracking_id' => 'tid-click-1',
            'sent_at' => now(),
            'metadata' => ['email_history_id' => $history->id],
        ]);

        $response = $this->get('/api/email/track/tid-click-1/click/2?url='.urlencode('https://example.com/listing'));

        $response->assertRedirect('https://example.com/listing');
        $this->assertDatabaseHas('email_tracking', [
            'email_history_id' => $history->id,
            'type' => 'click',
        ]);
        $this->assertSame(1, $history->fresh()->clicks);
        $this->assertNotNull(SentEmail::where('tracking_id', 'tid-click-1')->first()->clicked_at);
    }
}
