<?php

namespace Tests\Feature;

use App\Models\AiUsageLog;
use App\Models\User;
use App\Services\AiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_falls_through_to_claude_when_gemini_and_openai_unavailable(): void
    {
        config([
            'services.gemini.key' => null,
            'services.openai.key' => null,
            'services.anthropic.key' => 'sk-ant-test-key',
        ]);

        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'content' => [['text' => 'Hello from Claude']],
                'usage' => ['input_tokens' => 12, 'output_tokens' => 5],
            ], 200),
        ]);

        $result = AiService::generate([
            ['role' => 'user', 'content' => 'hi'],
        ]);

        $this->assertSame('claude', $result['provider']);
        $this->assertSame('Hello from Claude', $result['text']);
    }

    public function test_real_usage_is_logged_with_cost_estimate(): void
    {
        config([
            'services.gemini.key' => 'test-gemini-key',
            'services.openai.key' => null,
            'services.anthropic.key' => null,
        ]);

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [['content' => ['parts' => [['text' => 'Hi there']]]]],
                'usageMetadata' => ['promptTokenCount' => 10, 'candidatesTokenCount' => 20],
            ], 200),
        ]);

        AiService::generate([['role' => 'user', 'content' => 'hi']], agentKey: 'chat_assistant');

        $this->assertDatabaseHas('ai_usage_logs', [
            'provider' => 'gemini',
            'agent_key' => 'chat_assistant',
            'input_tokens' => 10,
            'output_tokens' => 20,
        ]);

        $log = AiUsageLog::first();
        $this->assertGreaterThan(0, (float) $log->cost_estimate);
    }

    public function test_soft_fail_returns_canned_fallback_when_nothing_configured(): void
    {
        config(['services.gemini.key' => null, 'services.openai.key' => null, 'services.anthropic.key' => null]);

        $result = AiService::generate([['role' => 'user', 'content' => 'hi']], softFail: true);

        $this->assertSame('fallback', $result['provider']);
        $this->assertDatabaseHas('ai_usage_logs', [
            'provider' => 'fallback',
            'status' => 'error',
            'prompt_preview' => 'hi',
        ]);
    }

    public function test_usage_log_records_prompt_preview_and_status(): void
    {
        config([
            'services.gemini.key' => 'test-gemini-key',
            'services.openai.key' => null,
            'services.anthropic.key' => null,
        ]);

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [['content' => ['parts' => [['text' => 'Hi there']]]]],
                'usageMetadata' => ['promptTokenCount' => 10, 'candidatesTokenCount' => 20],
            ], 200),
        ]);

        AiService::generate([
            ['role' => 'system', 'content' => 'You are a helper.'],
            ['role' => 'user', 'content' => 'Describe this home'],
        ], agentKey: 'property_desc');

        $this->assertDatabaseHas('ai_usage_logs', [
            'provider' => 'gemini',
            'agent_key' => 'property_desc',
            'prompt_preview' => 'Describe this home',
            'status' => 'success',
        ]);
    }

    public function test_admin_can_view_ai_chat_logs(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'name' => 'Ada Admin']);
        $user = User::factory()->create(['role' => 'agent', 'name' => 'Ada Agent']);

        $gemini = AiUsageLog::create([
            'provider' => 'gemini', 'model' => 'gemini-2.0-flash', 'agent_key' => 'chat_assistant',
            'user_id' => $user->id, 'input_tokens' => 10, 'output_tokens' => 20,
            'prompt_preview' => 'Looking for a 3 bed in Austin', 'status' => 'success',
        ]);

        AiUsageLog::create([
            'provider' => 'fallback', 'agent_key' => 'chat_assistant',
            'prompt_preview' => 'Where are you located?', 'status' => 'error',
        ]);

        $response = $this->actingAs($admin)->getJson('/api/admin/ai-chat-logs');

        $response->assertOk()->assertJsonCount(2, 'data');

        $data = collect($response->json('data'));

        $success = $data->firstWhere('status', 'success');
        $this->assertArrayHasKey('timestamp', $success);
        $this->assertSame('Ada Agent', $success['user']);
        $this->assertSame('Chat Assistant', $success['agent']);
        $this->assertSame('Looking for a 3 bed in Austin', $success['message']);
        $this->assertSame(30, $success['tokens_used']);
        $this->assertSame('success', $success['status']);

        $error = $data->firstWhere('status', 'error');
        $this->assertSame('System', $error['user']);
        $this->assertSame('error', $error['status']);
        $this->assertSame(0, $error['tokens_used']);
    }

    public function test_non_admin_cannot_view_ai_chat_logs(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);

        $this->actingAs($agent)->getJson('/api/admin/ai-chat-logs')->assertStatus(403);
    }

    public function test_provider_order_respects_admin_settings(): void
    {
        \App\Models\SiteSetting::set('provider_priority', ['claude', 'gemini', 'openai'], 'ai');
        \App\Models\SiteSetting::set('disabled_providers', ['openai'], 'ai');

        $order = AiService::providerOrder();

        $this->assertSame(['claude', 'gemini'], $order);
    }

    public function test_non_admin_cannot_access_ai_settings(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);

        $this->actingAs($agent)->getJson('/api/admin/settings/ai')->assertStatus(403);
        $this->actingAs($agent)->putJson('/api/admin/settings/ai', ['provider_priority' => ['claude']])->assertStatus(403);
        $this->actingAs($agent)->getJson('/api/admin/ai/usage-analytics')->assertStatus(403);
    }

    public function test_admin_can_read_and_update_provider_priority(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $default = $this->actingAs($admin)->getJson('/api/admin/settings/ai');
        $default->assertOk()->assertJsonPath('data.provider_priority', ['gemini', 'openai', 'claude']);

        $update = $this->actingAs($admin)->putJson('/api/admin/settings/ai', [
            'provider_priority' => ['claude', 'gemini', 'openai'],
            'disabled_providers' => ['openai'],
        ]);

        $update->assertOk()
            ->assertJsonPath('data.provider_priority', ['claude', 'gemini', 'openai'])
            ->assertJsonPath('data.disabled_providers', ['openai']);

        $this->assertSame(['claude', 'gemini'], AiService::providerOrder());
    }

    public function test_admin_can_read_usage_analytics(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        AiUsageLog::create(['provider' => 'gemini', 'model' => 'gemini-2.0-flash', 'input_tokens' => 10, 'output_tokens' => 20, 'cost_estimate' => 0.001]);
        AiUsageLog::create(['provider' => 'claude', 'model' => 'claude-3-5-haiku-latest', 'input_tokens' => 5, 'output_tokens' => 15, 'cost_estimate' => 0.002]);

        $response = $this->actingAs($admin)->getJson('/api/admin/ai/usage-analytics');

        $response->assertOk()
            ->assertJsonPath('data.totals.calls', 2)
            ->assertJsonCount(2, 'data.by_provider');
    }
}
