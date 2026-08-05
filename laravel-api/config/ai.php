<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cost per 1,000 tokens (USD), by provider
    |--------------------------------------------------------------------------
    | Rates for the default model each provider in AiService actually calls
    | (Gemini 2.0 Flash, GPT-4o-mini, Claude 3.5 Haiku) as of publishing —
    | these change over time, so treat cost_estimate as directional, not a
    | billing-grade figure. Update here when providers change pricing;
    | AiService::estimateCost() reads this at call time, no code change
    | needed to adjust rates.
    */
    'cost_per_1k_tokens' => [
        'gemini' => ['input' => 0.000075, 'output' => 0.0003],
        'openai' => ['input' => 0.00015, 'output' => 0.0006],
        'claude' => ['input' => 0.0008, 'output' => 0.004],
        'default' => ['input' => 0, 'output' => 0],
    ],
];
