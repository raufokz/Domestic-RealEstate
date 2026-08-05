<?php

namespace Tests\Feature;

use App\Models\AutomationWorkflow;
use App\Models\AutomationWorkflowLog;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutomationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_update_normalizes_alias_trigger_values(): void
    {
        $admin = $this->admin();
        $workflow = AutomationWorkflow::create([
            'name' => 'Welcome flow',
            'trigger_type' => 'new_lead',
            'actions' => [],
            'is_active' => true,
        ]);

        // The admin detail page used to send old aliases verbatim, so the
        // stored trigger could never match anything the engine fires.
        $this->actingAs($admin)->putJson("/api/admin/automation/workflows/{$workflow->id}", [
            'name' => 'Welcome flow',
            'trigger_type' => 'lead_updated',
        ])->assertOk();

        $this->assertDatabaseHas('automation_workflows', [
            'id' => $workflow->id,
            'trigger_type' => 'status_changed',
        ]);
    }

    public function test_notification_action_creates_real_notification_rows(): void
    {
        $admin = $this->admin();

        $workflow = AutomationWorkflow::create([
            'name' => 'Alert on new lead',
            'trigger_type' => 'new_lead',
            'actions' => [[
                'type' => 'notification',
                'config' => ['title' => 'New lead captured', 'message' => 'A lead just came in.'],
            ]],
            'is_active' => true,
        ]);

        \App\Services\AutomationEngine::trigger('new_lead', ['lead_id' => 99]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $admin->id,
            'module' => 'automation',
            'title' => 'New lead captured',
        ]);

        $this->assertDatabaseHas('automation_workflow_logs', [
            'workflow_id' => $workflow->id,
            'status' => 'success',
        ]);
    }

    public function test_newsletter_subscribe_fires_workflow(): void
    {
        $admin = $this->admin();

        AutomationWorkflow::create([
            'name' => 'Newsletter welcome',
            'trigger_type' => 'newsletter_subscribed',
            'actions' => [[
                'type' => 'notification',
                'config' => ['title' => 'New subscriber', 'message' => 'Someone subscribed.'],
            ]],
            'is_active' => true,
        ]);

        $this->postJson('/api/marketing/newsletter', [
            'email' => 'fresh-subscriber@example.com',
            'name' => 'Sam Subscriber',
        ])->assertStatus(201);

        $this->assertDatabaseHas('newsletter_subscribers', ['email' => 'fresh-subscriber@example.com']);
        $this->assertDatabaseHas('notifications', ['title' => 'New subscriber']);
        $this->assertDatabaseCount('automation_workflow_logs', 1);
    }

    public function test_scheduled_command_runs_scheduled_time_workflows(): void
    {
        $admin = $this->admin();

        AutomationWorkflow::create([
            'name' => 'Daily digest',
            'trigger_type' => 'scheduled_time',
            'actions' => [[
                'type' => 'notification',
                'config' => ['title' => 'Daily digest', 'message' => 'Ran on schedule.'],
            ]],
            'is_active' => true,
        ]);

        $this->artisan('automation:run-scheduled --cadence=hourly')->assertSuccessful();

        $this->assertDatabaseHas('notifications', ['title' => 'Daily digest']);
        $this->assertDatabaseCount('automation_workflow_logs', 1);
    }
}
