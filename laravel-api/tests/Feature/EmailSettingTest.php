<?php

namespace Tests\Feature;

use App\Models\EmailSetting;
use App\Models\EmailTemplate;
use App\Models\User;
use App\Services\EmailMailConfigurator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailSettingTest extends TestCase
{
    use RefreshDatabase;

    private function seedSettings(): void
    {
        EmailSetting::create([
            'setting_key' => 'from_name',
            'value' => 'Domestic Real Estate',
            'setting_group' => 'general',
        ]);
        EmailSetting::create([
            'setting_key' => 'from_email',
            'value' => 'info@domesticrealestate.us',
            'setting_group' => 'general',
        ]);
        EmailSetting::create([
            'setting_key' => 'smtp_host',
            'value' => '',
            'setting_group' => 'smtp',
        ]);
        EmailSetting::create([
            'setting_key' => 'smtp_port',
            'value' => '587',
            'setting_group' => 'smtp',
        ]);
        EmailSetting::create([
            'setting_key' => 'smtp_username',
            'value' => '',
            'setting_group' => 'smtp',
        ]);
        EmailSetting::create([
            'setting_key' => 'smtp_password',
            'value' => '',
            'setting_group' => 'smtp',
        ]);
        EmailSetting::create([
            'setting_key' => 'campaign_daily_limit',
            'value' => '500',
            'setting_group' => 'templates',
        ]);
    }

    public function test_index_returns_flat_setting_map(): void
    {
        $this->seedSettings();
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->getJson('/api/admin/email-settings')
            ->assertOk()
            ->assertJsonPath('data.from_name', 'Domestic Real Estate')
            ->assertJsonPath('data.campaign_daily_limit', '500');
    }

    public function test_non_admin_cannot_access_email_settings(): void
    {
        $this->seedSettings();
        $buyer = User::factory()->create(['role' => 'buyer']);

        $this->actingAs($buyer)->getJson('/api/admin/email-settings')->assertStatus(403);
        $this->actingAs($buyer)->putJson('/api/admin/email-settings', ['from_name' => 'x'])->assertStatus(403);
        $this->actingAs($buyer)->postJson('/api/admin/email-settings/test', ['email' => 'a@b.com'])->assertStatus(403);
    }

    public function test_update_accepts_flat_map_and_persists(): void
    {
        $this->seedSettings();
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->putJson('/api/admin/email-settings', [
            'from_name' => 'Acme Homes',
            'smtp_host' => 'mail.example.com',
            'smtp_port' => '465',
        ])->assertOk();

        $this->assertSame('Acme Homes', EmailSetting::where('setting_key', 'from_name')->value('value'));
        $this->assertSame('mail.example.com', EmailSetting::where('setting_key', 'smtp_host')->value('value'));
        $this->assertSame('465', EmailSetting::where('setting_key', 'smtp_port')->value('value'));
    }

    public function test_update_maps_daily_limit_to_campaign_daily_limit(): void
    {
        $this->seedSettings();
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->putJson('/api/admin/email-settings', ['daily_limit' => '250'])->assertOk();

        $this->assertSame('250', EmailSetting::where('setting_key', 'campaign_daily_limit')->value('value'));
    }

    public function test_update_rejects_unknown_setting_key(): void
    {
        $this->seedSettings();
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->putJson('/api/admin/email-settings', ['not_a_real_setting' => 'x'])
            ->assertStatus(422);
    }

    public function test_test_email_accepts_email_field_when_smtp_configured(): void
    {
        Mail::fake();
        $this->seedSettings();
        EmailSetting::where('setting_key', 'smtp_host')->update(['value' => 'mail.example.com']);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson('/api/admin/email-settings/test', ['email' => 'dev@example.com'])
            ->assertOk()
            ->assertJsonPath('sent', true);
    }

    public function test_test_email_reports_not_configured_when_smtp_missing(): void
    {
        $this->seedSettings();
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson('/api/admin/email-settings/test', ['to' => 'dev@example.com'])
            ->assertOk()
            ->assertJsonPath('sent', false);
    }

    public function test_configurator_applies_db_smtp_to_mail_config(): void
    {
        $this->seedSettings();
        EmailSetting::where('setting_key', 'smtp_host')->update(['value' => 'smtp.example.com']);
        EmailSetting::where('setting_key', 'smtp_port')->update(['value' => '2525']);
        EmailSetting::where('setting_key', 'smtp_username')->update(['value' => 'user']);

        EmailMailConfigurator::apply();

        $this->assertSame('smtp.example.com', config('mail.mailers.smtp.host'));
        $this->assertSame(2525, config('mail.mailers.smtp.port'));
        $this->assertSame('user', config('mail.mailers.smtp.username'));
        $this->assertSame('smtp', config('mail.default'));
        $this->assertSame('info@domesticrealestate.us', config('mail.from.address'));
    }

    public function test_configurator_noops_when_smtp_not_set(): void
    {
        $this->seedSettings();
        config(['mail.default' => 'log']);

        EmailMailConfigurator::apply();

        $this->assertSame('log', config('mail.default'));
    }

    public function test_preview_endpoint_renders_template_without_sending(): void
    {
        $this->seedSettings();
        $admin = User::factory()->create(['role' => 'admin']);
        $template = EmailTemplate::create([
            'name' => 'Welcome',
            'slug' => 'welcome',
            'type' => 'marketing',
            'subject' => 'Hi {{first_name}}',
            'html_body' => '<h1>Welcome {{first_name}} {{last_name}}</h1>',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->postJson('/api/email-templates/preview', ['id' => $template->id]);

        $response->assertOk()
            ->assertJsonPath('data.subject', 'Hi {{first_name}}')
            ->assertJsonPath('data.html', '<h1>Welcome Alex Morgan</h1>');
    }

    public function test_preview_endpoint_accepts_raw_html_with_overrides(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/email-templates/preview', [
            'html_body' => '<p>Hello {{name}}, your home is {{property_title}}</p>',
            'variables' => ['name' => 'Casey', 'property_title' => 'Beach House'],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.html', '<p>Hello Casey, your home is Beach House</p>');
    }
}
