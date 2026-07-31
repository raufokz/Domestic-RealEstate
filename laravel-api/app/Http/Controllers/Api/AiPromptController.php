<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiPrompt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AiPromptController extends Controller
{
    public function index(): JsonResponse
    {
        $prompts = AiPrompt::orderBy('name')->get()->map(fn (AiPrompt $p) => [
            'id' => $p->id,
            'name' => $p->name,
            'prompt_key' => $p->prompt_key,
            'category' => $p->category,
            'model' => $p->model,
            'content' => $p->content,
            'tokens' => $p->tokens,
            'last_used' => $p->last_used_at?->toISOString(),
            'status' => $p->is_active ? 'active' : 'inactive',
            'is_active' => $p->is_active,
        ]);

        if ($prompts->isEmpty()) {
            $defaults = [
                ['name' => 'Chat Assistant', 'prompt_key' => 'chat_assistant', 'category' => 'chat', 'content' => 'You are Domestic AI for Domestic Real Estate (domesticrealestate.us), Your Key to Home. Help with buying, selling, investing. Ask for name and email once. Never use phone numbers — email info@domesticrealestate.us only.'],
                ['name' => 'Property Description', 'prompt_key' => 'property_description', 'category' => 'content', 'content' => 'Generate a compelling SEO property description. Never include phone numbers. CTA: email info@domesticrealestate.us.'],
                ['name' => 'Lead Qualification', 'prompt_key' => 'lead_qualification', 'category' => 'leads', 'content' => 'Qualify this lead and explain Hot/Warm/Cold with recommended next steps for Domestic Real Estate agents.'],
                ['name' => 'Email Writer', 'prompt_key' => 'email_writer', 'category' => 'marketing', 'content' => 'Write a professional Domestic Real Estate email. Contact only via info@domesticrealestate.us — never phone numbers.'],
                ['name' => 'Seller Valuation', 'prompt_key' => 'seller_agent', 'category' => 'sellers', 'content' => 'Provide home valuation guidance (not a licensed appraisal). Direct follow-up to info@domesticrealestate.us.'],
                ['name' => 'Investor Analysis', 'prompt_key' => 'investor_agent', 'category' => 'investors', 'content' => 'Analyze ROI, cap rate, cash flow, and risk for Domestic Real Estate investors. No phone numbers.'],
                ['name' => 'SEO Agent', 'prompt_key' => 'seo_agent', 'category' => 'marketing', 'content' => 'Analyze real estate page SEO with score, keywords, and meta recommendations for domesticrealestate.us.'],
                ['name' => 'Social Media', 'prompt_key' => 'social_media', 'category' => 'marketing', 'content' => 'Create engaging social posts for Domestic Real Estate. Hashtags welcome. Contact: info@domesticrealestate.us only.'],
            ];
            foreach ($defaults as $row) {
                AiPrompt::create(array_merge($row, [
                    'model' => 'gemini-1.5-flash',
                    'is_active' => true,
                ]));
            }
            return $this->index();
        }

        return response()->json(['data' => $prompts]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'prompt_key' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'content' => 'required|string',
            'prompt' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'status' => 'nullable|string',
        ]);

        $content = $validated['content'] ?? $validated['prompt'] ?? '';
        $prompt = AiPrompt::create([
            'name' => $validated['name'],
            'prompt_key' => $validated['prompt_key'] ?? Str::slug($validated['name']).'-'.Str::random(4),
            'category' => $validated['category'] ?? 'content',
            'model' => $validated['model'] ?? 'gemini-1.5-flash',
            'content' => $content,
            'is_active' => $validated['is_active'] ?? (($validated['status'] ?? 'active') === 'active'),
        ]);

        return response()->json(['message' => 'Prompt created', 'data' => $prompt], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $prompt = AiPrompt::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'prompt_key' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:100',
            'model' => 'sometimes|string|max:100',
            'content' => 'sometimes|string',
            'prompt' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'status' => 'nullable|string',
        ]);

        if (isset($validated['prompt']) && ! isset($validated['content'])) {
            $validated['content'] = $validated['prompt'];
        }
        if (isset($validated['status'])) {
            $validated['is_active'] = $validated['status'] === 'active';
        }
        unset($validated['prompt'], $validated['status']);
        $prompt->update($validated);

        return response()->json(['message' => 'Prompt updated', 'data' => $prompt->fresh()]);
    }

    public function destroy($id): JsonResponse
    {
        AiPrompt::findOrFail($id)->delete();
        return response()->json(['message' => 'Prompt deleted']);
    }
}
