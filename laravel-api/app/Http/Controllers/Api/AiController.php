<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\FeatureUnavailableException;
use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Property;
use App\Services\AiService;
use App\Services\IntegrationGate;
use Illuminate\Http\Request;

class AiController extends Controller
{
    /**
     * Homepage / public chat — Gemini primary, soft fallback, optional lead capture.
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'type' => 'nullable|string|in:buyer,seller,investor,realtor,vendor,general,agent',
            'property_type' => 'nullable|string|max:255',
            'bedrooms' => 'nullable|string|max:50',
            'bathrooms' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:255',
            'budget_min' => 'nullable|numeric',
            'budget_max' => 'nullable|numeric',
            'financing' => 'nullable|string|max:50',
            'pre_approved' => 'nullable|boolean',
            'credit_score' => 'nullable|string|max:50',
            'timeline' => 'nullable|string|max:255',
            'realtor_status' => 'nullable|string|max:255',
            'contact_time' => 'nullable|string|max:255',
            'consent_given' => 'nullable|boolean',
            'history' => 'nullable|array|max:20',
            'history.*.role' => 'nullable|string|in:user,assistant',
            'history.*.content' => 'nullable|string|max:2000',
            'property_id' => 'nullable|integer',
            'context' => 'nullable|string|max:255',
            'page_url' => 'nullable|string|max:2000',
            'page_title' => 'nullable|string|max:255',
        ]);

        $leadId = null;
        $email = $request->input('email') ?: ($request->user()?->email);
        $name = $request->input('name') ?: ($request->user()?->name);
        
        $type = $request->input('type');
        if ($type === 'general' || !$type) {
            $type = 'buyer';
        } elseif ($type === 'agent') {
            $type = 'realtor';
        }

        if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $lead = \App\Services\LeadCaptureService::upsert([
                'name' => $name ?: 'Chat Visitor',
                'email' => $email,
                'phone' => $request->input('phone'),
                'source' => 'ai_chat',
                'type' => $type,
                'notes' => 'Captured from homepage AI chat: '.\Illuminate\Support\Str::limit($request->message, 300),
                'property_type' => $request->input('property_type'),
                'bedrooms' => $request->input('bedrooms'),
                'bathrooms' => $request->input('bathrooms'),
                'location' => $request->input('location'),
                'budget_min' => $request->input('budget_min'),
                'budget_max' => $request->input('budget_max'),
                'financing' => $request->input('financing'),
                'pre_approved' => $request->input('pre_approved'),
                'credit_score' => $request->input('credit_score'),
                'timeline' => $request->input('timeline'),
                'realtor_status' => $request->input('realtor_status'),
                'contact_time' => $request->input('contact_time'),
                'consent_given' => $request->input('consent_given'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'page_url' => $request->input('page_url') ?: $request->header('referer', ''),
                'performed_by' => $request->user()?->id,
            ]);
            $leadId = $lead->id;
        }

        $extraSystem = "You are multilingual and must respond fluently in the language the user speaks or requests. Explicitly support English, Spanish, Urdu, and Hindi. If the user initiates conversation or greets you in Spanish, Urdu, or Hindi, respond appropriately in that same language.";
        
        $contextDesc = [];
        if ($request->filled('context')) {
            $contextDesc[] = "User is on a " . $request->input('context') . " page/context.";
        }
        if ($request->filled('page_url')) {
            $contextDesc[] = "Current Page URL: " . $request->input('page_url');
        }
        if ($request->filled('page_title')) {
            $contextDesc[] = "Current Page Title: " . $request->input('page_title');
        }
        
        if ($request->filled('property_id')) {
            $property = \App\Models\Property::find($request->input('property_id'));
            if ($property) {
                $contextDesc[] = "The user is looking at property listing ID #{$property->id}: '{$property->title}', Price: \${$property->price}, Address: {$property->address}, {$property->city}, {$property->state} {$property->zip}, Type: " . ($property->propertyType?->name ?? 'N/A') . ", Beds: {$property->bedrooms}, Baths: {$property->bathrooms}, SqFt: {$property->sqft}. Description: '" . \Illuminate\Support\Str::limit($property->description, 300) . "'. Refer to these details if they ask questions about the property.";
            }
        }
        
        if (!empty($contextDesc)) {
            $extraSystem .= "\n\n[Current Session Context]\n" . implode("\n", $contextDesc);
        }

        $systemPrompt = AiService::systemForAgent('chat_assistant', $extraSystem);

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($request->input('history', []) as $turn) {
            if (! empty($turn['content'])) {
                $messages[] = [
                    'role' => ($turn['role'] ?? 'user') === 'assistant' ? 'assistant' : 'user',
                    'content' => $turn['content'],
                ];
            }
        }
        $messages[] = ['role' => 'user', 'content' => $request->message];

        try {
            AiService::ensureAgentActive('chat_assistant', 'AI Chat Assistant');
            $agent = AiService::agentConfig('chat_assistant');
            $result = AiService::generate(
                $messages,
                $agent->model ?? null,
                (float) ($agent->temperature ?? 0.7),
                (int) ($agent->max_tokens ?? 1000),
                softFail: true,
            );
        } catch (FeatureUnavailableException $e) {
            $result = [
                'text' => 'AI is temporarily unavailable.',
                'provider' => 'fallback',
            ];
        } catch (\Exception $e) {
            $result = [
                'text' => 'AI is temporarily unavailable.',
                'provider' => 'fallback',
            ];
        }

        if (($result['provider'] ?? '') === 'fallback') {
            $result['text'] = 'AI is temporarily unavailable.';
            
            \App\Models\AuditLog::log(
                action: 'ai_chat_failed',
                entityType: 'AiConversation',
                entityId: null,
                oldValues: null,
                newValues: ['error' => 'AI assistant call failed, served safe fallback message to visitor.']
            );

            $cacheKey = 'ai_fallback_notification_sent';
            if (!\Illuminate\Support\Facades\Cache::has($cacheKey)) {
                \Illuminate\Support\Facades\Cache::put($cacheKey, true, now()->addMinutes(15));
                \App\Services\Notifier::aiProviderFailed(
                    'A visitor used the chat assistant and received the safe fallback reply instead of a real AI answer.'
                );
            }
        }

        return response()->json([
            'response' => $result['text'],
            'provider' => $result['provider'] === 'fallback' ? 'fallback' : 'domestic_ai',
            'lead_id' => $leadId,
            'lead_captured' => (bool) $leadId,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function leadQualify(Request $request)
    {
        IntegrationGate::requireAi('Lead Qualification AI');
        AiService::ensureAgentActive('lead_qualification', 'Lead Qualification AI');
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'location' => 'nullable|string',
            'timeline' => 'nullable|string',
            'motivation' => 'nullable|string',
            'property_type' => 'nullable|string',
            'source' => 'nullable|string',
            'previous_inquiries' => 'nullable|integer',
        ]);

        $prompt = 'Qualify this real estate lead and return a short analysis with recommended next steps. Lead: Name: '.$request->name
            .', Budget: '.($request->budget ? '$'.$request->budget : 'N/A')
            .', Location: '.($request->location ?: 'N/A')
            .', Timeline: '.($request->timeline ?: 'N/A')
            .', Motivation: '.($request->motivation ?: 'N/A')
            .', Property type: '.($request->property_type ?: 'N/A')
            .', Source: '.($request->source ?: 'N/A');

        $result = AiService::generateForAgent('lead_qualification', $prompt, 'Lead Qualification AI');

        $score = 0;
        if ($request->budget && $request->budget > 0) {
            $score += 10;
            if ($request->budget >= 500000) {
                $score += 15;
            } elseif ($request->budget >= 200000) {
                $score += 10;
            } else {
                $score += 5;
            }
        }
        if ($request->timeline) {
            $tl = strtolower($request->timeline);
            if (str_contains($tl, 'immediate') || str_contains($tl, 'asap') || str_contains($tl, 'now') || str_contains($tl, '1 month') || str_contains($tl, '30 day')) {
                $score += 20;
            } elseif (str_contains($tl, '3 month') || str_contains($tl, '6 month') || str_contains($tl, 'soon')) {
                $score += 12;
            } else {
                $score += 8;
            }
        }
        $hasEmail = ! empty($request->email);
        $hasPhone = ! empty($request->phone);
        if ($hasEmail && $hasPhone) {
            $score += 10;
        } elseif ($hasEmail || $hasPhone) {
            $score += 5;
        }
        $sourceScores = [
            'referral' => 15, 'organic' => 12, 'direct' => 10, 'ai_chat' => 12,
            'website' => 8, 'website_form' => 10, 'social' => 7, 'paid' => 5,
        ];
        $score += $sourceScores[strtolower($request->source ?? '')] ?? 5;
        $prevInquiries = $request->previous_inquiries ?? 0;
        if ($prevInquiries >= 3) {
            $score += 15;
        } elseif ($prevInquiries >= 2) {
            $score += 10;
        } elseif ($prevInquiries >= 1) {
            $score += 5;
        }
        if ($request->motivation) {
            $mot = strtolower($request->motivation);
            $score += (str_contains($mot, 'urgent') || str_contains($mot, 'must') || str_contains($mot, 'relocat') || str_contains($mot, 'need')) ? 10 : 6;
        }
        $score = min($score, 100);
        $grade = $score >= 70 ? 'Hot' : ($score >= 40 ? 'Warm' : 'Cold');
        $urgency = $score >= 70 ? 'high' : ($score >= 40 ? 'medium' : 'low');

        // Persist score if lead exists
        $lead = Lead::where('normalized_email', strtolower($request->email))->first();
        if ($lead) {
            $priority = $grade === 'Hot' ? 'high' : ($grade === 'Warm' ? 'normal' : 'low');
            $lead->update(['score' => $score, 'priority' => $priority]);
        }

        return response()->json([
            'score' => $score,
            'grade' => $grade,
            'analysis' => $result['text'],
            'recommended_actions' => $grade === 'Hot'
                ? ['Contact within 1 hour', 'Send matching listings', 'Schedule consultation', 'Assign top agent']
                : ($grade === 'Warm'
                    ? ['Follow up within 24 hours', 'Send curated selection', 'Add to nurture sequence']
                    : ['Add to long-term nurture', 'Send market newsletter', 'Re-qualify in 30 days']),
            'urgency' => $urgency,
            'source' => $request->source,
            'timeline' => $request->timeline,
        ]);
    }

    public function recommendProperty(Request $request)
    {
        IntegrationGate::requireAi('Property Recommendation AI');
        AiService::ensureAgentActive('property_recommendation', 'Property Recommendation AI');
        $request->validate([
            'budget' => 'required|numeric',
            'bedrooms' => 'nullable|integer',
            'location' => 'required|string',
            'type' => 'nullable|string',
        ]);

        $query = Property::where('approval_status', 'approved')->where('status', 'active')
            ->where('price', '<=', $request->budget);
        if ($request->bedrooms) {
            $query->where('bedrooms', '>=', $request->bedrooms);
        }
        if ($request->location) {
            $query->where(function ($q) use ($request) {
                $q->where('city', 'like', "%{$request->location}%")
                    ->orWhere('state', 'like', "%{$request->location}%")
                    ->orWhere('neighborhood', 'like', "%{$request->location}%");
            });
        }
        if ($request->type) {
            $query->where('property_type_id', $request->type);
        }

        $properties = $query->with(['propertyType', 'realtor'])->limit(5)->get();
        $prompt = "Buyer wants budget \${$request->budget}, bedrooms ".($request->bedrooms ?? 'any').", location {$request->location}. We found {$properties->count()} matching listings. Recommend the best matches and why.";
        $aiAnalysis = AiService::generateForAgent('property_recommendation', $prompt, 'Property Recommendation AI')['text'];

        return response()->json([
            'properties' => $properties,
            'ai_analysis' => $aiAnalysis,
            'total_matches' => $properties->count(),
        ]);
    }

    public function sellerAgent(Request $request)
    {
        IntegrationGate::requireAi('Seller AI Agent');
        AiService::ensureAgentActive('seller_agent', 'Seller AI Agent');
        $request->validate(['address' => 'required|string']);
        $prompt = "Provide a home valuation analysis for: {$request->address}. Include estimated value range, market trends, comps, and value factors. State this is not a licensed appraisal. Direct follow-up to info@domesticrealestate.us — no phone numbers.";
        $analysis = AiService::generateForAgent('seller_agent', $prompt, 'Seller AI Agent')['text'];

        return response()->json(['address' => $request->address, 'analysis' => $analysis, 'report_url' => null]);
    }

    public function investorAgent(Request $request)
    {
        IntegrationGate::requireAi('Investor AI Agent');
        AiService::ensureAgentActive('investor_agent', 'Investor AI Agent');
        $request->validate(['budget' => 'required|numeric', 'strategy' => 'required|string', 'location' => 'required|string']);
        $prompt = "Investment analysis: budget \${$request->budget}, strategy {$request->strategy}, location {$request->location}. Cover ROI, cap rate, cash flow, and risk. No phone numbers.";
        $analysis = AiService::generateForAgent('investor_agent', $prompt, 'Investor AI Agent')['text'];

        return response()->json(['analysis' => $analysis]);
    }

    public function emailWriter(Request $request)
    {
        IntegrationGate::requireAi('Email Writer AI');
        AiService::ensureAgentActive('email_writer', 'Email Writer AI');

        // Accept both composer shape {body, subject} and writer shape {type, details}
        $type = $request->input('type', 'general');
        $details = $request->input('details');
        if (! $details && ($request->filled('body') || $request->filled('subject'))) {
            $details = 'Subject: '.($request->input('subject', ''))."\n\nImprove or rewrite this email body:\n".$request->input('body', '');
            $type = 'improve';
        }
        $request->merge(['type' => $type, 'details' => $details]);
        $request->validate(['type' => 'required|string', 'details' => 'required|string']);

        $prompt = "Write a professional real estate email. Type: {$type}. Details: {$details}. Polished, conversion-focused, Domestic Real Estate branding. Contact only via info@domesticrealestate.us — no phone numbers.";
        $email = AiService::generateForAgent('email_writer', $prompt, 'Email Writer AI')['text'];

        return response()->json(['email' => $email]);
    }

    public function socialAgent(Request $request)
    {
        IntegrationGate::requireAi('Social Media AI');
        AiService::ensureAgentActive('social_media', 'Social Media AI');
        $request->validate(['platform' => 'required|string', 'topic' => 'required|string']);
        $prompt = "Create a {$request->platform} post about: {$request->topic}. Include hashtags. Brand: Domestic Real Estate. Contact: info@domesticrealestate.us only.";
        $post = AiService::generateForAgent('social_media', $prompt, 'Social Media AI')['text'];

        return response()->json(['post' => $post]);
    }

    public function seoAgent(Request $request)
    {
        IntegrationGate::requireAi('SEO AI Agent');
        AiService::ensureAgentActive('seo_agent', 'SEO Agent');
        $request->validate(['url' => 'required|url', 'content' => 'required|string']);
        $prompt = 'Analyze this real estate page for SEO. URL: '.$request->input('url').'. Content: '.substr($request->input('content'), 0, 3000).'. Give score /100, keywords, meta suggestions, improvements.';
        $analysis = AiService::generateForAgent('seo_agent', $prompt, 'SEO Agent')['text'];

        return response()->json(['analysis' => $analysis]);
    }

    public function crmAssistant(Request $request)
    {
        IntegrationGate::requireAi('CRM Assistant AI');
        AiService::ensureAgentActive('crm_assistant', 'CRM Assistant AI');
        $user = $request->user();
        $pendingLeads = Lead::where('assigned_to', $user->id)->where('status', 'new')->count();
        $hotLeads = Lead::where('assigned_to', $user->id)->where('priority', 'high')->count();
        $tasksDue = \App\Models\LeadTask::where('assigned_to', $user->id)->where('status', 'pending')->where('due_date', '<=', now())->count();

        $prompt = "Daily CRM briefing for a realtor. Pending leads: {$pendingLeads}, Hot leads: {$hotLeads}, Tasks due: {$tasksDue}. Prioritized actions and follow-ups.";
        $briefing = AiService::generateForAgent('crm_assistant', $prompt, 'CRM Assistant AI')['text'];

        return response()->json([
            'briefing' => $briefing,
            'stats' => ['pending_leads' => $pendingLeads, 'hot_leads' => $hotLeads, 'tasks_due' => $tasksDue],
        ]);
    }

    public function analyticsAgent(Request $request)
    {
        IntegrationGate::requireAi('Analytics AI Agent');
        AiService::ensureAgentActive('analytics_agent', 'Analytics AI');
        $user = $request->user();
        $totalLeads = Lead::where('realtor_id', $user->id)->orWhere('assigned_to', $user->id)->count();
        $convertedLeads = Lead::where(function ($q) use ($user) {
            $q->where('realtor_id', $user->id)->orWhere('assigned_to', $user->id);
        })->where('status', 'converted')->count();
        $properties = Property::where('realtor_id', $user->id)->count();

        $prompt = "Performance analysis: Total leads {$totalLeads}, Converted {$convertedLeads}, Listings {$properties}. Growth and conversion recommendations.";
        $analysis = AiService::generateForAgent('analytics_agent', $prompt, 'Analytics AI')['text'];

        return response()->json([
            'analysis' => $analysis,
            'metrics' => [
                'total_leads' => $totalLeads,
                'conversion_rate' => $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 1).'%' : '0%',
                'properties' => $properties,
            ],
        ]);
    }

    public function propertyDescription(Request $request)
    {
        IntegrationGate::requireAi('Property Description AI');
        AiService::ensureAgentActive('property_description', 'Property Description AI');
        $request->validate(['title' => 'required|string', 'details' => 'required|string']);
        $prompt = "Write an SEO-optimized listing description for: {$request->title}. Details: {$request->details}. Persuasive CTA. Contact info@domesticrealestate.us only — no phones.";
        $description = AiService::generateForAgent('property_description', $prompt, 'Property Description AI')['text'];

        return response()->json(['description' => $description]);
    }

    public function voice(Request $request)
    {
        IntegrationGate::requireAi('Voice AI Agent');
        AiService::ensureAgentActive('voice_ai', 'Voice AI Agent');
        $request->validate(['transcript' => 'required|string']);
        $prompt = "User said: \"{$request->transcript}\". Respond as a real estate assistant. Extract intent if viewing, search, or valuation. Email-only contact.";
        $response = AiService::generateForAgent('voice_ai', $prompt, 'Voice AI Agent')['text'];

        return response()->json(['response' => $response, 'intent' => 'general']);
    }

    public function saveProgress(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string|max:255',
            'ai_type' => 'required|string|in:buyer,seller,investor,realtor',
            'messages' => 'required|array',
            'lead_data' => 'nullable|array',
            'completed' => 'nullable|boolean',
        ]);

        $sessionId = $request->input('session_id');
        $aiType = $request->input('ai_type');
        $messages = $request->input('messages');
        $leadData = $request->input('lead_data', []);
        $completed = $request->input('completed', false);

        // Extract user data from lead_data if available
        $email = $leadData['email'] ?? null;
        $name = $leadData['name'] ?? null;
        $phone = $leadData['phone'] ?? null;

        // If not directly in leadData, try to extract from email match in messages
        if (!$email) {
            foreach ($messages as $msg) {
                if (($msg['role'] ?? '') === 'user') {
                    $emailMatch = [];
                    if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $msg['content'], $emailMatch)) {
                        $email = $emailMatch[0];
                        break;
                    }
                }
            }
        }

        $leadId = null;
        if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            // Setup source and pipeline inputs
            $source = 'ai_chat_' . $aiType;
            
            // Map leadData parameters to LeadCaptureService format
            $upsertData = array_merge([
                'name' => $name ?: 'AI Chat Visitor',
                'email' => $email,
                'phone' => $phone ?: ($leadData['phone'] ?? null),
                'source' => $source,
                'type' => $aiType,
                'notes' => 'Captured via dynamic AI questionnaire step-by-step.',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'page_url' => $request->header('referer', ''),
            ], $leadData);

            // Trigger LeadCaptureService
            $lead = \App\Services\LeadCaptureService::upsert($upsertData);
            if ($lead) {
                $leadId = $lead->id;

                // Sync with Pipeline and Stage automatically if it is a new lead
                if ($lead->wasRecentlyCreated) {
                    $pipeline = \App\Models\Pipeline::where('slug', $aiType)->first() 
                        ?: \App\Models\Pipeline::first();
                    if ($pipeline) {
                        $stage = $pipeline->stages()->orderBy('sort_order')->first();
                        if ($stage) {
                            \App\Models\Deal::create([
                                'lead_id' => $lead->id,
                                'pipeline_id' => $pipeline->id,
                                'stage_id' => $stage->id,
                                'title' => $lead->first_name . ' ' . $lead->last_name . ' - ' . ucfirst($aiType) . ' Deal',
                                'value' => $leadData['budget_max'] ?? ($leadData['asking_price'] ?? 0),
                                'status' => 'active',
                            ]);
                        }
                    }
                }
            }
        }

        // Calculate a basic qualification score based on how many fields were filled
        $filledFields = 0;
        foreach ($leadData as $k => $v) {
            if ($v !== null && $v !== '') {
                $filledFields++;
            }
        }
        $qualificationScore = min(100, $filledFields * 10);

        // Find or create AiConversation safely
        $conversation = \App\Models\AiConversation::where('session_id', $sessionId)->first();
        if (!$conversation) {
            $conversation = new \App\Models\AiConversation();
            $conversation->session_id = $sessionId;
        }

        if ($leadId) $conversation->lead_id = $leadId;
        $conversation->ai_type = $aiType;
        if ($name) $conversation->user_name = $name;
        if ($email) $conversation->user_email = $email;
        if ($phone) $conversation->user_phone = $phone;
        $conversation->messages = $messages;
        $conversation->qualification_score = $qualificationScore;
        $conversation->status = $completed ? 'completed' : 'active';
        $conversation->save();

        // If completed, trigger AI summarization and notifications
        if ($completed) {
            if ($leadId) {
                $lead = \App\Models\Lead::find($leadId);
                if ($lead) {
                    // Update layout values
                    $lead->update(['score' => $qualificationScore]);
                    \App\Services\LeadNotificationService::dispatch($lead, $aiType);
                }
            }

            try {
                // Generate quick summary from the chat history
                $chatText = "";
                foreach ($messages as $m) {
                    $chatText .= (($m['role'] ?? '') === 'user' ? "User: " : "Assistant: ") . ($m['content'] ?? '') . "\n";
                }
                
                $summaryPrompt = "Summarize the following real estate conversation. Highlight key needs, timeline, and qualification status: \n\n" . $chatText;
                
                \App\Services\AiService::ensureAgentActive('chat_assistant', 'AI Chat Assistant');
                $agent = \App\Services\AiService::agentConfig('chat_assistant');
                $summaryResult = \App\Services\AiService::generate(
                    [
                        ['role' => 'system', 'content' => 'You are an assistant that summarizes real estate leads into clear bullet points.'],
                        ['role' => 'user', 'content' => $summaryPrompt]
                    ], 
                    $agent->model ?? null,
                    0.3,
                    300,
                    softFail: true
                );

                if (!empty($summaryResult['text'])) {
                    $conversation->update([
                        'summary' => $summaryResult['text']
                    ]);

                    // Append summary to lead notes if lead exists
                    if ($leadId) {
                        $lead = \App\Models\Lead::find($leadId);
                        if ($lead) {
                            $lead->update([
                                'notes' => trim($lead->notes . "\n\nAI Conversation Summary:\n" . $summaryResult['text'])
                            ]);
                        }
                    }
                }
            } catch (\Exception $e) {
                // Soft fail on summary generation
            }
        }

        return response()->json([
            'success' => true,
            'lead_id' => $leadId,
            'conversation_id' => $conversation->id,
            'qualification_score' => $qualificationScore,
        ]);
    }
}
