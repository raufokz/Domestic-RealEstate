<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\Notification;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\LeadNotificationService;
use App\Services\Notifier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_returns_all_event_toggles(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $data = $this->actingAs($admin)->getJson('/api/admin/settings/notifications')
            ->assertOk()
            ->json('data');

        $this->assertArrayHasKey('email_enabled', $data);
        $this->assertArrayHasKey('push_enabled', $data);
        $this->assertArrayHasKey('new_lead', $data);
        $this->assertArrayHasKey('new_enquiry', $data);
        $this->assertArrayHasKey('property_inquiry', $data);
        $this->assertArrayHasKey('offer_received', $data);
        $this->assertArrayHasKey('payment_received', $data);
        $this->assertArrayHasKey('contract_signed', $data);
        $this->assertArrayNotHasKey('lead_notifications', $data);
        $this->assertFalse($data['sms_enabled']);
    }

    public function test_update_persists_toggles(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->putJson('/api/admin/settings/notifications', [
            'new_lead' => false,
            'contract_signed' => false,
            'push_enabled' => false,
        ])->assertOk();

        $this->assertSame('false', SiteSetting::where('key_name', 'new_lead')->value('value'));
        $this->assertSame('false', SiteSetting::where('key_name', 'contract_signed')->value('value'));
        $this->assertSame('false', SiteSetting::where('key_name', 'push_enabled')->value('value'));
    }

    public function test_update_rejects_unknown_keys(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->putJson('/api/admin/settings/notifications', ['lead_notifications' => false])
            ->assertStatus(422);
    }

    public function test_non_admin_cannot_access(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);

        $this->actingAs($buyer)->getJson('/api/admin/settings/notifications')->assertStatus(403);
        $this->actingAs($buyer)->putJson('/api/admin/settings/notifications', ['new_lead' => false])->assertStatus(403);
    }

    public function test_notifier_honors_disabled_event_toggle(): void
    {
        User::factory()->create(['role' => 'admin']);
        SiteSetting::set('new_lead', false, 'notifications');

        Notifier::alert(title: 'Test', message: 'test', module: 'leads', event: 'new_lead');

        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_notifier_creates_alert_when_event_enabled_or_unspecified(): void
    {
        User::factory()->create(['role' => 'admin']);
        SiteSetting::set('new_lead', true, 'notifications');

        Notifier::alert(title: 'On', message: 'm', module: 'leads', event: 'new_lead');
        Notifier::alert(title: 'Unspecified', message: 'm', module: 'system');

        $this->assertSame(2, Notification::count());
    }

    public function test_lead_notification_service_respects_new_lead_toggle(): void
    {
        User::factory()->create(['role' => 'admin']);
        SiteSetting::set('new_lead', false, 'notifications');

        $lead = Lead::create(['email' => '', 'first_name' => 'X', 'type' => 'buyer']);
        LeadNotificationService::dispatch($lead, 'buyer');

        $this->assertDatabaseCount('notifications', 0);
    }
}
