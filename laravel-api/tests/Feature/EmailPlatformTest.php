<?php

namespace Tests\Feature;

use App\Jobs\ProcessEmailCampaign;
use App\Mail\CampaignMail;
use App\Models\CampaignRecipient;
use App\Models\EmailCampaign;
use App\Models\EmailHistory;
use App\Models\SentEmail;
use App\Models\User;
use App\Services\MergeTagService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailPlatformTest extends TestCase
{
    use RefreshDatabase;

    public function test_merge_tag_service_substitutes_known_tags(): void
    {
        $result = MergeTagService::apply(
            'Hi {{first_name}} {{last_name}} ({{email}}), welcome {{name}}!',
            ['name' => 'Jane Doe', 'email' => 'jane@example.com']
        );

        $this->assertSame('Hi Jane Doe (jane@example.com), welcome Jane Doe!', $result);
    }

    public function test_merge_tag_service_falls_back_gracefully_without_a_name(): void
    {
        $result = MergeTagService::apply('Hi {{first_name}}, {{unknown_tag}} stays untouched.', ['email' => 'a@b.com']);

        $this->assertSame('Hi there, {{unknown_tag}} stays untouched.', $result);
    }

    public function test_bounce_webhook_fails_closed_when_secret_not_configured(): void
    {
        config(['services.email_bounce_webhook.secret' => null]);

        $response = $this->postJson('/api/webhooks/email/bounce', [
            'email' => 'bounced@example.com',
            'event_type' => 'bounce',
        ]);

        $response->assertStatus(501);
    }

    public function test_bounce_webhook_rejects_invalid_secret(): void
    {
        config(['services.email_bounce_webhook.secret' => 'correct-secret']);

        $response = $this->postJson('/api/webhooks/email/bounce', [
            'email' => 'bounced@example.com',
            'event_type' => 'bounce',
        ], ['X-Webhook-Secret' => 'wrong-secret']);

        $response->assertStatus(401);
    }

    public function test_bounce_webhook_updates_sent_email_status_by_tracking_id(): void
    {
        config(['services.email_bounce_webhook.secret' => 'correct-secret']);

        $history = EmailHistory::create([
            'recipient' => 'bounced@example.com',
            'subject' => 'Test',
            'body' => '<p>Test</p>',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $sentEmail = SentEmail::create([
            'to_email' => 'bounced@example.com',
            'from_email' => 'info@domesticrealestate.us',
            'subject' => 'Test',
            'body' => '<p>Test</p>',
            'status' => 'sent',
            'tracking_id' => 'tid-123',
            'sent_at' => now(),
            'metadata' => ['email_history_id' => $history->id],
        ]);

        $response = $this->postJson('/api/webhooks/email/bounce', [
            'email' => 'bounced@example.com',
            'event_type' => 'complaint',
            'message_id' => 'tid-123',
            'reason' => 'Spam complaint',
        ], ['X-Webhook-Secret' => 'correct-secret']);

        $response->assertOk()->assertJsonPath('data.matched', true)->assertJsonPath('data.status', 'complained');

        $this->assertSame('complained', $sentEmail->fresh()->status);
        $this->assertSame('complained', $history->fresh()->status);
    }

    public function test_process_email_campaign_personalizes_and_records_history_per_recipient(): void
    {
        Mail::fake();

        $campaign = EmailCampaign::create([
            'name' => 'Welcome Batch',
            'subject' => 'Hi {{first_name}}!',
            'status' => 'sending',
            'recipient_count' => 1,
        ]);

        $recipient = CampaignRecipient::create([
            'campaign_id' => $campaign->id,
            'email' => 'lead@example.com',
            'name' => 'Jane Doe',
            'status' => 'pending',
        ]);

        (new ProcessEmailCampaign($campaign->id))->handle();

        Mail::assertSent(CampaignMail::class, fn ($mail) => $mail->emailSubject === 'Hi Jane!');

        $this->assertSame('sent', $recipient->fresh()->status);
        $this->assertSame('sent', $campaign->fresh()->status);

        $this->assertDatabaseHas('email_history', [
            'recipient' => 'lead@example.com',
            'subject' => 'Hi Jane!',
            'status' => 'sent',
        ]);
        $this->assertDatabaseHas('sent_emails', [
            'to_email' => 'lead@example.com',
            'subject' => 'Hi Jane!',
            'status' => 'sent',
        ]);
    }

    public function test_smtp_test_reports_not_configured_when_password_is_a_placeholder(): void
    {
        config(['mail.mailers.smtp.password' => 'your_smtp_password']);
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/admin/testing/email/smtp-test');

        $response->assertStatus(400)->assertJsonPath('code', 'smtp_not_configured');
    }

    public function test_dns_check_returns_real_lookup_shape(): void
    {
        config(['mail.from.address' => 'info@domesticrealestate.us']);
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/admin/testing/email/dns-check');

        $response->assertOk()
            ->assertJsonPath('domain', 'domesticrealestate.us')
            ->assertJsonStructure(['mx' => ['status', 'records'], 'spf' => ['status', 'record'], 'dkim' => ['status', 'record'], 'dmarc' => ['status', 'record']]);
    }

    public function test_agent_can_send_direct_email(): void
    {
        Mail::fake();
        config([
            'mail.mailers.smtp.host' => 'smtp.example.com',
            'mail.mailers.smtp.username' => 'user',
            'mail.mailers.smtp.password' => 'pass',
        ]);
        $agent = User::factory()->create(['role' => 'agent', 'email' => 'agent@example.com', 'status' => 'active']);

        $response = $this->actingAs($agent)->postJson('/api/agent/emails/send', [
            'to_email' => 'client@example.com',
            'subject' => 'Hello from your agent',
            'body' => '<p>Hi there!</p>',
        ]);

        $response->assertOk()->assertJsonPath('success', true);
        Mail::assertSent(CampaignMail::class, fn ($mail) => $mail->emailSubject === 'Hello from your agent');

        $this->assertDatabaseHas('sent_emails', [
            'to_email' => 'client@example.com',
            'user_id' => $agent->id,
            'status' => 'sent',
        ]);
        $this->assertDatabaseHas('email_history', ['recipient' => 'client@example.com']);
    }

    public function test_non_agent_cannot_send_direct_email(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);

        $this->actingAs($buyer)->postJson('/api/agent/emails/send', [
            'to_email' => 'client@example.com',
            'subject' => 'Hello',
            'body' => '<p>Hi</p>',
        ])->assertStatus(403);
    }

    public function test_spam_score_reframes_as_deliverability_check(): void
    {
        config(['mail.from.address' => 'info@domesticrealestate.us']);
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/admin/testing/email/spam-score');

        $response->assertOk()->assertJsonStructure(['score', 'max', 'status', 'details', 'checks']);
        $this->assertStringContainsString('Deliverability', $response->json('details'));
    }
}
