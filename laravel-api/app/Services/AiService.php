<?php

namespace App\Services;

use App\Exceptions\FeatureUnavailableException;
use App\Models\AiUsageLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Invisible AI provider layer: Gemini (primary) → OpenAI → Claude → soft fallback.
 * Callers never expose which vendor served the response.
 */
class AiService
{
    public const DEFAULT_SYSTEM = 'You are Domestic AI for Domestic Real Estate (domesticrealestate.us), tagline "Your Key to Home". Help with buying, selling, investing, mortgages, and neighborhoods. Be professional, warm, and concise. Never display phone numbers — direct users to email info@domesticrealestate.us only.';

    /**
     * Generate text via free/primary API chain.
     * Returns ['text' => string, 'provider' => string] or throws FeatureUnavailableException.
     *
     * @param  array<int, array{role: string, content: string}>  $messages  OpenAI-style messages
     * @return array{text: string, provider: string}
     */
    public static function generate(
        array $messages,
        ?string $model = null,
        float $temperature = 0.7,
        int $maxTokens = 1000,
        bool $softFail = false,
        ?string $agentKey = null,
    ): array {
        $fallback = 'I\'m currently connecting to our AI service. In the meantime, our team at info@domesticrealestate.us is ready to help you with buying, selling, or investing in real estate. Please share your contact details and what you\'re looking for!';

        $promptPreview = self::promptPreview($messages);

        try {
            foreach (self::providerOrder() as $provider) {
                $result = match ($provider) {
                    'gemini' => self::callGemini($messages, $model, $temperature, $maxTokens),
                    'openai' => self::callOpenAI($messages, $temperature, $maxTokens),
                    'claude' => self::callClaude($messages, $model, $temperature, $maxTokens),
                    default => null,
                };

                if ($result) {
                    self::logUsage($provider, $result['model'] ?? null, $result['input_tokens'] ?? null, $result['output_tokens'] ?? null, $agentKey, $promptPreview, 'success');

                    return ['text' => $result['text'], 'provider' => $provider];
                }
            }

            if ($softFail) {
                self::logUsage('fallback', null, null, null, $agentKey, $promptPreview, 'error');

                return ['text' => $fallback, 'provider' => 'fallback'];
            }

            throw new FeatureUnavailableException(
                feature: 'AI tools',
                reason: 'no AI provider is connected (Gemini, OpenAI, and Claude unavailable)',
                fix: 'Go to Admin → Integrations, connect Google Gemini (free tier), save your API key, then click Test.',
                actionUrl: '/admin/integrations',
                codeKey: 'ai_not_connected',
            );
        } catch (FeatureUnavailableException $e) {
            self::logUsage('fallback', null, null, null, $agentKey, $promptPreview, 'error');

            if ($softFail) {
                return ['text' => $fallback, 'provider' => 'fallback'];
            }
            throw $e;
        } catch (\Throwable $e) {
            Log::warning('AiService generate failed: '.$e->getMessage());
            self::logUsage('error', null, null, null, $agentKey, $promptPreview, 'error');

            if ($softFail) {
                return ['text' => $fallback, 'provider' => 'fallback'];
            }
            throw new FeatureUnavailableException(
                feature: 'AI tools',
                reason: 'the AI provider could not be reached',
                fix: 'Check your internet connection and AI API keys in Admin → Integrations.',
                actionUrl: '/admin/integrations',
                codeKey: 'ai_unreachable',
            );
        }
    }

    /**
     * Admin-configurable provider order + on/off toggles, stored in
     * SiteSetting group 'ai' (same pattern as 'geo_access'/'security').
     * Falls back to the original gemini→openai→claude order when unset.
     *
     * @return array<int, string>
     */
    public static function providerOrder(): array
    {
        $default = ['gemini', 'openai', 'claude'];

        try {
            $raw = \App\Models\SiteSetting::get('provider_priority', null);
            $order = is_string($raw) ? json_decode($raw, true) : $raw;
            $order = is_array($order) && count($order) ? array_values(array_intersect($order, $default)) : $default;

            $disabled = \App\Models\SiteSetting::get('disabled_providers', null);
            $disabled = is_string($disabled) ? (json_decode($disabled, true) ?: []) : (array) ($disabled ?: []);

            return array_values(array_diff($order, $disabled)) ?: $default;
        } catch (\Throwable) {
            return $default;
        }
    }

    protected static function logUsage(string $provider, ?string $model, ?int $inputTokens, ?int $outputTokens, ?string $agentKey, ?string $promptPreview = null, string $status = 'success'): void
    {
        try {
            $cost = self::estimateCost($provider, $model, $inputTokens ?? 0, $outputTokens ?? 0);
            AiUsageLog::create([
                'provider' => $provider,
                'model' => $model,
                'agent_key' => $agentKey,
                'user_id' => auth()->id(),
                'input_tokens' => $inputTokens,
                'output_tokens' => $outputTokens,
                'cost_estimate' => $cost,
                'prompt_preview' => $promptPreview,
                'status' => $status,
            ]);
        } catch (\Throwable $e) {
            Log::debug('AiUsageLog write failed: '.$e->getMessage());
        }
    }

    protected static function promptPreview(array $messages): string
    {
        foreach (array_reverse($messages) as $message) {
            $content = is_array($message) ? ($message['content'] ?? null) : null;
            if (is_string($content) && trim($content) !== '') {
                return Str::limit(trim($content), 500);
            }
        }

        return '';
    }

    protected static function estimateCost(string $provider, ?string $model, int $inputTokens, int $outputTokens): float
    {
        $rates = config("ai.cost_per_1k_tokens.{$provider}", config('ai.cost_per_1k_tokens.default', ['input' => 0, 'output' => 0]));

        return round(($inputTokens / 1000) * $rates['input'] + ($outputTokens / 1000) * $rates['output'], 6);
    }

    /**
     * Simple single-prompt helper used by agent endpoints.
     */
    public static function prompt(
        string $userPrompt,
        ?string $systemPrompt = null,
        ?string $model = null,
        float $temperature = 0.7,
        int $maxTokens = 1000,
        bool $softFail = false,
    ): string {
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt ?: self::DEFAULT_SYSTEM],
            ['role' => 'user', 'content' => $userPrompt],
        ];

        return self::generate($messages, $model, $temperature, $maxTokens, $softFail)['text'];
    }

    /**
     * Load agent config + optional AiPrompt library row; enforce is_active.
     *
     * @return object{config_key: string, name: string, is_active: bool, custom_prompt: ?string, model: ?string, temperature: float, max_tokens: int}|null
     */
    public static function agentConfig(string $key): ?object
    {
        $row = DB::table('ai_agent_configs')->where('config_key', $key)->first();
        if (! $row) {
            return null;
        }

        // Prefer dedicated prompt library if an active prompt matches agent key
        $library = DB::table('ai_prompts')
            ->where('is_active', true)
            ->where(function ($q) use ($key) {
                $q->where('prompt_key', $key)->orWhere('prompt_key', str_replace('_', '-', $key));
            })
            ->first();

        if ($library && filled($library->content)) {
            $row->custom_prompt = $library->content;
            if (filled($library->model)) {
                $row->model = $library->model;
            }
        }

        return $row;
    }

    public static function ensureAgentActive(string $key, string $featureLabel): void
    {
        $agent = self::agentConfig($key);
        if ($agent && ! $agent->is_active) {
            throw new FeatureUnavailableException(
                feature: $featureLabel,
                reason: 'this AI agent is turned off in Admin',
                fix: 'Go to Admin → AI Agents and enable "'.$featureLabel.'".',
                actionUrl: '/admin/ai-agents',
                codeKey: 'ai_agent_disabled',
            );
        }
    }

    /**
     * Resolve system prompt: agent custom_prompt → library → default.
     */
    public static function systemForAgent(string $key, ?string $extra = null): string
    {
        $agent = self::agentConfig($key);
        $base = ($agent && filled($agent->custom_prompt))
            ? (string) $agent->custom_prompt
            : self::DEFAULT_SYSTEM;

        return $extra ? $base."\n\n".$extra : $base;
    }

    public static function generateForAgent(
        string $key,
        string $userPrompt,
        string $featureLabel,
        bool $softFail = false,
        ?string $extraSystem = null,
    ): array {
        self::ensureAgentActive($key, $featureLabel);
        if (! $softFail) {
            IntegrationGate::requireAi($featureLabel);
        }

        $agent = self::agentConfig($key);
        $system = self::systemForAgent($key, $extraSystem);
        $temp = (float) ($agent->temperature ?? 0.7);
        $max = (int) ($agent->max_tokens ?? 1000);
        $model = $agent->model ?? null;

        $result = self::generate(
            [
                ['role' => 'system', 'content' => $system],
                ['role' => 'user', 'content' => $userPrompt],
            ],
            $model,
            $temp,
            $max,
            $softFail,
            $key,
        );

        self::bumpAgentStats($key, $result);

        return $result;
    }

    protected static function bumpAgentStats(string $key, array $result): void
    {
        try {
            $tokens = str_word_count($result['text'] ?? '');
            DB::table('ai_agent_configs')->where('config_key', $key)->update([
                'total_calls' => DB::raw('total_calls + 1'),
                'total_tokens' => DB::raw('total_tokens + '.$tokens),
                'updated_at' => now(),
            ]);
        } catch (\Throwable) {
            // Non-fatal
        }
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    protected static function flattenMessages(array $messages): string
    {
        $parts = [];
        foreach ($messages as $m) {
            $role = strtoupper($m['role'] ?? 'user');
            $parts[] = "{$role}: ".($m['content'] ?? '');
        }

        return implode("\n\n", $parts);
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{text: string, model: string, input_tokens: ?int, output_tokens: ?int}|null
     */
    protected static function callGemini(array $messages, ?string $model, float $temperature, int $maxTokens): ?array
    {
        $apiKey = IntegrationGate::credentialOrEnv('google_gemini', 'api_key', ['GEMINI_API_KEY', 'GOOGLE_GEMINI_API_KEY'])
            ?: config('services.gemini.key');
        if (! $apiKey) {
            return null;
        }

        $modelName = $model && str_contains($model, 'gemini') ? $model : 'gemini-2.0-flash';
        $system = '';
        $contents = [];
        foreach ($messages as $m) {
            if (($m['role'] ?? '') === 'system') {
                $system .= ($m['content'] ?? '')."\n";
                continue;
            }
            $contents[] = [
                'role' => ($m['role'] ?? 'user') === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $m['content'] ?? '']],
            ];
        }

        $payload = [
            'contents' => $contents ?: [['parts' => [['text' => self::flattenMessages($messages)]]]],
            'generationConfig' => [
                'temperature' => $temperature,
                'maxOutputTokens' => $maxTokens,
            ],
        ];
        if (trim($system) !== '') {
            $payload['systemInstruction'] = ['parts' => [['text' => trim($system)]]];
        }

        try {
            $response = Http::timeout(30)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$modelName}:generateContent?key={$apiKey}",
                $payload
            );
            if (! $response->successful()) {
                IntegrationGate::markError('google_gemini', 'Gemini API returned HTTP '.$response->status());

                return null;
            }
            $text = $response->json('candidates.0.content.parts.0.text');
            if ($text) {
                IntegrationGate::markConnected('google_gemini');

                return [
                    'text' => $text,
                    'model' => $modelName,
                    'input_tokens' => $response->json('usageMetadata.promptTokenCount'),
                    'output_tokens' => $response->json('usageMetadata.candidatesTokenCount'),
                ];
            }
        } catch (\Throwable $e) {
            IntegrationGate::markError('google_gemini', $e->getMessage());
        }

        return null;
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{text: string, model: string, input_tokens: ?int, output_tokens: ?int}|null
     */
    protected static function callOpenAI(array $messages, float $temperature, int $maxTokens): ?array
    {
        $apiKey = IntegrationGate::credentialOrEnv('openai', 'api_key', ['OPENAI_API_KEY'])
            ?: config('services.openai.key');
        if (! $apiKey) {
            return null;
        }

        $modelName = 'gpt-4o-mini';

        try {
            $response = Http::timeout(30)->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => $modelName,
                'messages' => $messages,
                'max_tokens' => $maxTokens,
                'temperature' => $temperature,
            ]);
            if (! $response->successful()) {
                IntegrationGate::markError('openai', 'OpenAI returned HTTP '.$response->status());

                return null;
            }
            $text = $response->json('choices.0.message.content');
            if ($text) {
                IntegrationGate::markConnected('openai');

                return [
                    'text' => $text,
                    'model' => $modelName,
                    'input_tokens' => $response->json('usage.prompt_tokens'),
                    'output_tokens' => $response->json('usage.completion_tokens'),
                ];
            }
        } catch (\Throwable $e) {
            IntegrationGate::markError('openai', $e->getMessage());
        }

        return null;
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{text: string, model: string, input_tokens: ?int, output_tokens: ?int}|null
     */
    protected static function callClaude(array $messages, ?string $model, float $temperature, int $maxTokens): ?array
    {
        $apiKey = IntegrationGate::credentialOrEnv('anthropic', 'api_key', ['ANTHROPIC_API_KEY'])
            ?: config('services.anthropic.key');
        if (! $apiKey) {
            return null;
        }

        $modelName = $model && str_contains($model, 'claude') ? $model : 'claude-3-5-haiku-latest';

        $system = '';
        $chatMessages = [];
        foreach ($messages as $m) {
            if (($m['role'] ?? '') === 'system') {
                $system .= ($m['content'] ?? '')."\n";
                continue;
            }
            $chatMessages[] = [
                'role' => ($m['role'] ?? 'user') === 'assistant' ? 'assistant' : 'user',
                'content' => $m['content'] ?? '',
            ];
        }

        $payload = [
            'model' => $modelName,
            'max_tokens' => $maxTokens,
            'temperature' => $temperature,
            'messages' => $chatMessages ?: [['role' => 'user', 'content' => self::flattenMessages($messages)]],
        ];
        if (trim($system) !== '') {
            $payload['system'] = trim($system);
        }

        try {
            $response = Http::timeout(30)->withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', $payload);

            if (! $response->successful()) {
                IntegrationGate::markError('anthropic', 'Anthropic API returned HTTP '.$response->status());

                return null;
            }
            $text = $response->json('content.0.text');
            if ($text) {
                IntegrationGate::markConnected('anthropic');

                return [
                    'text' => $text,
                    'model' => $modelName,
                    'input_tokens' => $response->json('usage.input_tokens'),
                    'output_tokens' => $response->json('usage.output_tokens'),
                ];
            }
        } catch (\Throwable $e) {
            IntegrationGate::markError('anthropic', $e->getMessage());
        }

        return null;
    }
}
