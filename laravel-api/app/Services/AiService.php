<?php

namespace App\Services;

use App\Exceptions\FeatureUnavailableException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Invisible AI provider layer: Gemini (primary) → OpenAI → null/fallback.
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
    ): array {
        $fallback = 'I\'m currently connecting to our AI service. In the meantime, our team at info@domesticrealestate.us is ready to help you with buying, selling, or investing in real estate. Please share your contact details and what you\'re looking for!';

        try {
            $gemini = self::callGemini($messages, $model, $temperature, $maxTokens);
            if ($gemini) {
                return ['text' => $gemini, 'provider' => 'gemini'];
            }

            $openai = self::callOpenAI($messages, $temperature, $maxTokens);
            if ($openai) {
                return ['text' => $openai, 'provider' => 'openai'];
            }

            if ($softFail) {
                return ['text' => $fallback, 'provider' => 'fallback'];
            }

            throw new FeatureUnavailableException(
                feature: 'AI tools',
                reason: 'no AI provider is connected (Gemini and OpenAI unavailable)',
                fix: 'Go to Admin → Integrations, connect Google Gemini (free tier), save your API key, then click Test.',
                actionUrl: '/admin/integrations',
                codeKey: 'ai_not_connected',
            );
        } catch (FeatureUnavailableException $e) {
            if ($softFail) {
                return ['text' => $fallback, 'provider' => 'fallback'];
            }
            throw $e;
        } catch (\Throwable $e) {
            Log::warning('AiService generate failed: '.$e->getMessage());
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
     */
    protected static function callGemini(array $messages, ?string $model, float $temperature, int $maxTokens): ?string
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

                return $text;
            }
        } catch (\Throwable $e) {
            IntegrationGate::markError('google_gemini', $e->getMessage());
        }

        return null;
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    protected static function callOpenAI(array $messages, float $temperature, int $maxTokens): ?string
    {
        $apiKey = IntegrationGate::credentialOrEnv('openai', 'api_key', ['OPENAI_API_KEY'])
            ?: config('services.openai.key');
        if (! $apiKey) {
            return null;
        }

        try {
            $response = Http::timeout(30)->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
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

                return $text;
            }
        } catch (\Throwable $e) {
            IntegrationGate::markError('openai', $e->getMessage());
        }

        return null;
    }
}
