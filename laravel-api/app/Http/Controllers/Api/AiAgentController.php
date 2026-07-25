<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AiAgentController extends Controller
{
    protected $defaultAgents = [
        ['key' => 'chat_assistant', 'name' => 'AI Chat Assistant', 'description' => 'Conversational real estate expert that captures leads 24/7', 'model' => 'gemini-1.5-flash', 'endpoint' => '/ai/chat', 'is_active' => true],
        ['key' => 'lead_qualification', 'name' => 'Lead Qualification AI', 'description' => 'Scores and prioritizes incoming leads automatically', 'model' => 'gemini-1.5-flash', 'endpoint' => '/ai/lead-qualify', 'is_active' => true],
        ['key' => 'property_recommendation', 'name' => 'Property Recommendation AI', 'description' => 'Suggests top 5 listings based on buyer intent', 'model' => 'gemini-1.5-flash', 'endpoint' => '/ai/recommend-property', 'is_active' => true],
        ['key' => 'seller_agent', 'name' => 'Seller AI Agent', 'description' => 'Generates property valuations and market insights', 'model' => 'gemini-1.5-flash', 'endpoint' => '/ai/seller-agent', 'is_active' => true],
        ['key' => 'investor_agent', 'name' => 'Investor AI Agent', 'description' => 'ROI, cap rate, cash flow, and risk analysis', 'model' => 'gemini-1.5-flash', 'endpoint' => '/ai/investor-agent', 'is_active' => true],
        ['key' => 'email_writer', 'name' => 'Email Writer AI', 'description' => 'Writes follow-ups, newsletters, and listing emails', 'model' => 'gemini-1.5-flash', 'endpoint' => '/ai/email-writer', 'is_active' => true],
        ['key' => 'crm_assistant', 'name' => 'CRM Assistant AI', 'description' => 'Daily summaries, missed lead alerts, priority actions', 'model' => 'gemini-1.5-flash', 'endpoint' => '/ai/crm-assistant', 'is_active' => true],
        ['key' => 'realtor_assistant', 'name' => 'Realtor Assistant AI', 'description' => 'Helps agents with daily tasks and client management', 'model' => 'gemini-1.5-flash', 'endpoint' => '/ai/chat', 'is_active' => true],
        ['key' => 'seo_agent', 'name' => 'SEO Agent', 'description' => 'Analyzes pages and suggests SEO improvements', 'model' => 'gemini-1.5-flash', 'endpoint' => '/ai/seo-agent', 'is_active' => true],
        ['key' => 'social_media', 'name' => 'Social Media AI', 'description' => 'Generates posts for Facebook, Instagram, LinkedIn, X, TikTok', 'model' => 'gemini-1.5-flash', 'endpoint' => '/ai/social-agent', 'is_active' => true],
        ['key' => 'analytics_agent', 'name' => 'Analytics AI', 'description' => 'Conversion analysis and growth recommendations', 'model' => 'gemini-1.5-flash', 'endpoint' => '/ai/analytics-agent', 'is_active' => true],
        ['key' => 'property_description', 'name' => 'Property Description AI', 'description' => 'Auto-writes listing descriptions from property data', 'model' => 'gemini-1.5-flash', 'endpoint' => '/ai/property-description', 'is_active' => true],
        ['key' => 'voice_ai', 'name' => 'Voice AI Agent', 'description' => 'Handles voice interactions and books meetings', 'model' => 'gemini-1.5-flash', 'endpoint' => '/ai/voice', 'is_active' => false],
    ];

    public function index()
    {
        $agents = DB::table('ai_agent_configs')->get();
        if ($agents->isEmpty()) {
            DB::table('ai_agent_configs')->insert(
                collect($this->defaultAgents)->map(fn ($a) => array_merge($a, [
                    'custom_prompt' => null,
                    'temperature' => 0.7,
                    'max_tokens' => 1000,
                    'total_calls' => 0,
                    'total_tokens' => 0,
                    'avg_response_ms' => 0,
                    'last_tested_at' => null,
                    'last_test_result' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]))->toArray()
            );
            $agents = DB::table('ai_agent_configs')->get();
        }

        return response()->json($agents);
    }

    public function update(Request $request, $key)
    {
        $agent = DB::table('ai_agent_configs')->where('key', $key)->first();
        if (! $agent) {
            return response()->json(['error' => 'Agent not found'], 404);
        }

        $data = $request->only([
            'is_active', 'custom_prompt', 'model', 'temperature', 'max_tokens',
        ]);

        DB::table('ai_agent_configs')->where('key', $key)->update(
            array_merge($data, ['updated_at' => now()])
        );

        return response()->json(DB::table('ai_agent_configs')->where('key', $key)->first());
    }

    public function test(Request $request, $key)
    {
        $agent = DB::table('ai_agent_configs')->where('key', $key)->first();
        if (! $agent) {
            return response()->json([
                'success' => false,
                'code' => 'not_found',
                'feature' => 'AI agent',
                'message' => 'AI agent is not working because this agent was not found.',
                'reason' => 'the agent key does not exist',
                'fix' => 'Open Admin → AI Agents and refresh the list.',
            ], 404);
        }

        if (! $agent->is_active) {
            return response()->json([
                'success' => false,
                'code' => 'ai_agent_disabled',
                'feature' => $agent->name,
                'message' => $agent->name.' is not working because it is turned off.',
                'reason' => 'agent is_active=false',
                'fix' => 'Enable the agent toggle, then Test again.',
                'action_url' => '/admin/ai-agents',
            ], 503);
        }

        $testMessage = $request->get('message', 'Hello, this is a test message for Domestic Real Estate AI.');
        $start = microtime(true);

        try {
            $result = AiService::generateForAgent(
                $key,
                $testMessage,
                $agent->name ?? 'AI agent',
                softFail: false,
            );
            $response = $result['text'];
            $provider = $result['provider'];
            $elapsed = round((microtime(true) - $start) * 1000);
            $tokenCount = str_word_count($response);

            DB::table('ai_agent_configs')->where('key', $key)->update([
                'avg_response_ms' => $elapsed,
                'last_tested_at' => now(),
                'last_test_result' => json_encode([
                    'status' => 'success', 'provider' => $provider,
                    'response' => substr($response, 0, 500),
                    'elapsed_ms' => $elapsed, 'tokens' => $tokenCount,
                ]),
                'updated_at' => now(),
            ]);

            DB::table('ai_agent_test_logs')->insert([
                'agent_key' => $key,
                'test_message' => $testMessage,
                'response' => $response,
                'provider' => $provider,
                'elapsed_ms' => $elapsed,
                'tokens' => $tokenCount,
                'status' => 'success',
                'created_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'status' => 'success',
                'provider' => $provider === 'fallback' ? 'fallback' : 'domestic_ai',
                'response' => $response,
                'elapsed_ms' => $elapsed,
                'tokens' => $tokenCount,
                'message' => "{$agent->name} test passed.",
            ]);
        } catch (\App\Exceptions\FeatureUnavailableException $e) {
            DB::table('ai_agent_configs')->where('key', $key)->update([
                'last_tested_at' => now(),
                'last_test_result' => json_encode(['status' => 'error', 'message' => $e->getMessage()]),
                'updated_at' => now(),
            ]);
            throw $e;
        } catch (\Exception $e) {
            DB::table('ai_agent_configs')->where('key', $key)->update([
                'last_tested_at' => now(),
                'last_test_result' => json_encode(['status' => 'error', 'message' => $e->getMessage()]),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => false,
                'status' => 'error',
                'code' => 'ai_test_failed',
                'feature' => $agent->name ?? 'AI agent',
                'message' => ($agent->name ?? 'AI agent').' is not working because the test failed.',
                'reason' => $e->getMessage(),
                'fix' => 'Connect Gemini or OpenAI in Admin → Integrations, then test again.',
                'action_url' => '/admin/integrations',
            ], 500);
        }
    }

    public function logs(Request $request, $key)
    {
        $logs = DB::table('ai_agent_test_logs')
            ->where('agent_key', $key)
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 20));

        return response()->json($logs);
    }

    public function stats()
    {
        $agents = DB::table('ai_agent_configs')->get();

        return response()->json([
            'total_agents' => $agents->count(),
            'active_agents' => $agents->where('is_active', true)->count(),
            'total_calls' => $agents->sum('total_calls'),
            'total_tokens' => $agents->sum('total_tokens'),
            'avg_response_ms' => round($agents->avg('avg_response_ms') ?? 0),
            'agents' => $agents->map(fn ($a) => [
                'key' => $a->key, 'name' => $a->name, 'is_active' => $a->is_active,
                'total_calls' => $a->total_calls, 'avg_response_ms' => $a->avg_response_ms,
            ]),
        ]);
    }
}
