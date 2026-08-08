<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use App\Models\RealtorApplication;
use App\Services\AutomationEngine;
use App\Services\LeadCaptureService;
use App\Models\CustomFormField;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

class FormSubmissionController extends Controller
{
    public function submitRealtorApplication(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'brokerage' => 'required|string|max:255',
            'license_number' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'city' => 'required|string|max:255',
            'zip' => 'nullable|string|max:20',
            'years_experience' => 'nullable|integer|min:0',
            'current_production' => 'nullable|string|max:500',
            'specialization' => 'nullable|string|max:500',
            'referral_areas' => 'nullable|string|max:500',
            'message' => 'nullable|string',
            'resume_url' => 'nullable|string|max:500',
            'agreement_accepted' => 'required|boolean',
            'id_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'license_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'profile_photo' => 'nullable|file|image|max:5120',
        ]);

        try {
            DB::beginTransaction();

            $lead = LeadCaptureService::upsert([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'type' => 'realtor',
                'source' => 'realtor_application',
                'notes' => $this->buildRealtorNotes($validated),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $lead->update([
                'chat_metadata' => json_encode([
                    'brokerage' => $validated['brokerage'],
                    'license_number' => $validated['license_number'],
                    'state' => $validated['state'],
                    'city' => $validated['city'],
                    'zip' => $validated['zip'] ?? null,
                    'years_experience' => $validated['years_experience'] ?? null,
                    'current_production' => $validated['current_production'] ?? null,
                    'specialization' => $validated['specialization'] ?? null,
                    'referral_areas' => $validated['referral_areas'] ?? null,
                    'resume_url' => $validated['resume_url'] ?? null,
                    'agreement_accepted' => $validated['agreement_accepted'],
                ]),
            ]);

            $this->assignToPipeline('realtor_applications', $lead);
            $this->createActivity($lead, 'realtor_application_submitted', 'Realtor application submitted');
            $this->triggerAutomation('realtor_application', $lead);
            $this->sendNotifications('realtor_application', $lead, $validated);
            \App\Services\LeadNotificationService::dispatch($lead, 'realtor');

            // Real verification queue entry — this is what actually gates
            // account creation (see AdminRealtorApplicationController).
            // Previously this endpoint only ever created a CRM Lead, which
            // no admin approval action could act on.
            $idDocPath = $request->hasFile('id_document')
                ? $request->file('id_document')->store('realtor-applications', 'public')
                : null;
            $licenseDocPath = $request->hasFile('license_document')
                ? $request->file('license_document')->store('realtor-applications', 'public')
                : null;
            $profilePhotoPath = $request->hasFile('profile_photo')
                ? $request->file('profile_photo')->store('realtor-applications', 'public')
                : null;

            $application = RealtorApplication::create([
                'reference' => 'RA-' . strtoupper(\Illuminate\Support\Str::random(8)),
                'full_name' => trim($validated['first_name'] . ' ' . $validated['last_name']),
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'license_number' => $validated['license_number'],
                'license_state' => strtoupper(substr($validated['state'], 0, 2)),
                'brokerage_name' => $validated['brokerage'],
                'id_document_path' => $idDocPath,
                'license_document_path' => $licenseDocPath,
                'profile_photo_path' => $profilePhotoPath,
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Your realtor application has been submitted successfully. Our team will review and contact you within 24-48 hours.',
                'lead_id' => $lead->id,
                'lead_number' => $lead->lead_number,
                'application_reference' => $application->reference,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Realtor application submission failed', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit application. Please try again or contact support.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function submitAgentApplication(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'license_number' => 'required|string|max:100',
            'brokerage' => 'required|string|max:255',
            'years_experience' => 'nullable|integer|min:0',
            'markets_served' => 'nullable|string|max:500',
            'languages' => 'nullable|string|max:500',
            'availability' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'social_links' => 'nullable|array',
            'documents' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            $lead = LeadCaptureService::upsert([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'type' => 'agent',
                'source' => 'agent_application',
                'notes' => $this->buildAgentNotes($validated),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $lead->update([
                'chat_metadata' => json_encode([
                    'license_number' => $validated['license_number'],
                    'brokerage' => $validated['brokerage'],
                    'years_experience' => $validated['years_experience'] ?? null,
                    'markets_served' => $validated['markets_served'] ?? null,
                    'languages' => $validated['languages'] ?? null,
                    'availability' => $validated['availability'] ?? null,
                    'bio' => $validated['bio'] ?? null,
                    'social_links' => $validated['social_links'] ?? [],
                    'documents' => $validated['documents'] ?? [],
                ]),
            ]);

            $this->assignToPipeline('agent_applications', $lead);
            $this->createActivity($lead, 'agent_application_submitted', 'Agent application submitted');
            $this->triggerAutomation('agent_application', $lead);
            $this->sendNotifications('agent_application', $lead, $validated);
            \App\Services\LeadNotificationService::dispatch($lead, 'agent');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Your agent application has been submitted successfully. We will review and contact you soon.',
                'lead_id' => $lead->id,
                'lead_number' => $lead->lead_number,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Agent application submission failed', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit application. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function submitInvestorInquiry(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'investment_type' => 'required|string|max:100',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'financing_type' => 'nullable|string|max:50',
            'exchange_1031' => 'nullable|boolean',
            'rental_goals' => 'nullable|string',
            'commercial_interest' => 'nullable|boolean',
            'preferred_locations' => 'nullable|string',
            'roi_expectation' => 'nullable|string|max:255',
            'message' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $lead = LeadCaptureService::upsert([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'type' => 'investor',
                'source' => 'investor_inquiry',
                'budget_min' => $validated['budget_min'] ?? null,
                'budget_max' => $validated['budget_max'] ?? null,
                'notes' => $this->buildInvestorNotes($validated),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $lead->update([
                'chat_metadata' => json_encode([
                    'investment_type' => $validated['investment_type'],
                    'financing_type' => $validated['financing_type'] ?? null,
                    'exchange_1031' => $validated['exchange_1031'] ?? false,
                    'rental_goals' => $validated['rental_goals'] ?? null,
                    'commercial_interest' => $validated['commercial_interest'] ?? false,
                    'preferred_locations' => $validated['preferred_locations'] ?? null,
                    'roi_expectation' => $validated['roi_expectation'] ?? null,
                ]),
            ]);

            $this->assignToPipeline('investor_inquiries', $lead);
            $this->createActivity($lead, 'investor_inquiry_submitted', 'Investor inquiry submitted');
            $this->triggerAutomation('investor_inquiry', $lead);
            $this->sendNotifications('investor_inquiry', $lead, $validated);
            \App\Services\LeadNotificationService::dispatch($lead, 'investor');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Your investment inquiry has been received. An investment specialist will contact you shortly.',
                'lead_id' => $lead->id,
                'lead_number' => $lead->lead_number,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Investor inquiry submission failed', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit inquiry. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function submitSellerRequest(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'property_address' => 'required|string|max:500',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:100',
            'zip' => 'nullable|string|max:20',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|numeric|min:0',
            'condition' => 'nullable|string|max:100',
            'reason_for_selling' => 'nullable|string|max:255',
            'timeline' => 'nullable|string|max:100',
            'mortgage_status' => 'nullable|string|max:100',
            'expected_price' => 'nullable|numeric|min:0',
            'photos' => 'nullable|array',
            'message' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $lead = LeadCaptureService::upsert([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'type' => 'seller',
                'source' => 'seller_request',
                'budget_min' => $validated['expected_price'] ?? null,
                'timeline' => $validated['timeline'] ?? null,
                'notes' => $this->buildSellerNotes($validated),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $lead->update([
                'chat_metadata' => json_encode([
                    'property_address' => $validated['property_address'],
                    'city' => $validated['city'],
                    'state' => $validated['state'],
                    'zip' => $validated['zip'] ?? null,
                    'bedrooms' => $validated['bedrooms'] ?? null,
                    'bathrooms' => $validated['bathrooms'] ?? null,
                    'condition' => $validated['condition'] ?? null,
                    'reason_for_selling' => $validated['reason_for_selling'] ?? null,
                    'mortgage_status' => $validated['mortgage_status'] ?? null,
                    'expected_price' => $validated['expected_price'] ?? null,
                    'photos' => $validated['photos'] ?? [],
                ]),
            ]);

            $this->assignToPipeline('seller_requests', $lead);
            $this->createActivity($lead, 'seller_request_submitted', 'Seller valuation request submitted');
            $this->triggerAutomation('seller_request', $lead);
            $this->sendNotifications('seller_request', $lead, $validated);
            \App\Services\LeadNotificationService::dispatch($lead, 'seller');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Your home valuation request has been submitted. A listing specialist will provide your valuation within 24 hours.',
                'lead_id' => $lead->id,
                'lead_number' => $lead->lead_number,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Seller request submission failed', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit request. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function submitBuyerRequest(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'mortgage_status' => 'nullable|string|max:100',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'preferred_cities' => 'nullable|string|max:500',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|numeric|min:0',
            'property_type' => 'nullable|string|max:100',
            'timeline' => 'nullable|string|max:100',
            'school_preference' => 'nullable|string|max:255',
            'hoa_preference' => 'nullable|string|max:255',
            'message' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $lead = LeadCaptureService::upsert([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'type' => 'buyer',
                'source' => 'buyer_request',
                'budget_min' => $validated['budget_min'] ?? null,
                'budget_max' => $validated['budget_max'] ?? null,
                'timeline' => $validated['timeline'] ?? null,
                'notes' => $this->buildBuyerNotes($validated),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $lead->update([
                'chat_metadata' => json_encode([
                    'mortgage_status' => $validated['mortgage_status'] ?? null,
                    'preferred_cities' => $validated['preferred_cities'] ?? null,
                    'bedrooms' => $validated['bedrooms'] ?? null,
                    'bathrooms' => $validated['bathrooms'] ?? null,
                    'property_type' => $validated['property_type'] ?? null,
                    'school_preference' => $validated['school_preference'] ?? null,
                    'hoa_preference' => $validated['hoa_preference'] ?? null,
                ]),
            ]);

            $this->assignToPipeline('buyer_requests', $lead);
            $this->createActivity($lead, 'buyer_request_submitted', 'Buyer request submitted');
            $this->triggerAutomation('buyer_request', $lead);
            $this->sendNotifications('buyer_request', $lead, $validated);
            \App\Services\LeadNotificationService::dispatch($lead, 'buyer');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Your buyer request has been submitted. A buyer specialist will match you with properties and contact you soon.',
                'lead_id' => $lead->id,
                'lead_number' => $lead->lead_number,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Buyer request submission failed', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit request. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function submitContactForm(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'inquiry_type' => 'required|string|max:100',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            $lead = LeadCaptureService::upsert([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'type' => 'contact',
                'source' => 'contact_form',
                'notes' => $validated['message'],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $lead->update([
                'chat_metadata' => json_encode([
                    'inquiry_type' => $validated['inquiry_type'],
                    'subject' => $validated['subject'],
                ]),
            ]);

            $this->assignToPipeline('contact_inquiries', $lead);
            $this->createActivity($lead, 'contact_form_submitted', 'Contact form submitted: ' . $validated['subject']);
            $this->triggerAutomation('contact_form', $lead);
            $this->sendNotifications('contact_form', $lead, $validated);
            \App\Services\LeadNotificationService::dispatch($lead, 'contact');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Your message has been sent. We will respond within 24 hours.',
                'lead_id' => $lead->id,
                'lead_number' => $lead->lead_number,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Contact form submission failed', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send message. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    private function buildRealtorNotes(array $data): string
    {
        $notes = "Realtor Application\n";
        $notes .= "Brokerage: {$data['brokerage']}\n";
        $notes .= "License: {$data['license_number']}\n";
        $notes .= "Location: {$data['city']}, {$data['state']}\n";
        if (!empty($data['years_experience'])) {
            $notes .= "Experience: {$data['years_experience']} years\n";
        }
        if (!empty($data['specialization'])) {
            $notes .= "Specialization: {$data['specialization']}\n";
        }
        if (!empty($data['message'])) {
            $notes .= "\nMessage: {$data['message']}\n";
        }
        return $notes;
    }

    private function buildAgentNotes(array $data): string
    {
        $notes = "Agent Application\n";
        $notes .= "Brokerage: {$data['brokerage']}\n";
        $notes .= "License: {$data['license_number']}\n";
        if (!empty($data['years_experience'])) {
            $notes .= "Experience: {$data['years_experience']} years\n";
        }
        if (!empty($data['markets_served'])) {
            $notes .= "Markets: {$data['markets_served']}\n";
        }
        if (!empty($data['bio'])) {
            $notes .= "\nBio: {$data['bio']}\n";
        }
        return $notes;
    }

    private function buildInvestorNotes(array $data): string
    {
        $notes = "Investor Inquiry\n";
        $notes .= "Investment Type: {$data['investment_type']}\n";
        if (!empty($data['financing_type'])) {
            $notes .= "Financing: {$data['financing_type']}\n";
        }
        if (!empty($data['preferred_locations'])) {
            $notes .= "Locations: {$data['preferred_locations']}\n";
        }
        if (!empty($data['roi_expectation'])) {
            $notes .= "ROI Expectation: {$data['roi_expectation']}\n";
        }
        if (!empty($data['message'])) {
            $notes .= "\nMessage: {$data['message']}\n";
        }
        return $notes;
    }

    private function buildSellerNotes(array $data): string
    {
        $notes = "Seller Valuation Request\n";
        $notes .= "Property: {$data['property_address']}, {$data['city']}, {$data['state']}\n";
        if (!empty($data['bedrooms'])) {
            $notes .= "Bedrooms: {$data['bedrooms']}\n";
        }
        if (!empty($data['bathrooms'])) {
            $notes .= "Bathrooms: {$data['bathrooms']}\n";
        }
        if (!empty($data['condition'])) {
            $notes .= "Condition: {$data['condition']}\n";
        }
        if (!empty($data['reason_for_selling'])) {
            $notes .= "Reason: {$data['reason_for_selling']}\n";
        }
        if (!empty($data['message'])) {
            $notes .= "\nMessage: {$data['message']}\n";
        }
        return $notes;
    }

    private function buildBuyerNotes(array $data): string
    {
        $notes = "Buyer Request\n";
        if (!empty($data['mortgage_status'])) {
            $notes .= "Mortgage Status: {$data['mortgage_status']}\n";
        }
        if (!empty($data['preferred_cities'])) {
            $notes .= "Preferred Cities: {$data['preferred_cities']}\n";
        }
        if (!empty($data['bedrooms'])) {
            $notes .= "Bedrooms: {$data['bedrooms']}\n";
        }
        if (!empty($data['bathrooms'])) {
            $notes .= "Bathrooms: {$data['bathrooms']}\n";
        }
        if (!empty($data['property_type'])) {
            $notes .= "Property Type: {$data['property_type']}\n";
        }
        if (!empty($data['message'])) {
            $notes .= "\nMessage: {$data['message']}\n";
        }
        return $notes;
    }

    private function assignToPipeline(string $pipelineType, Lead $lead): void
    {
        try {
            $pipeline = Pipeline::where('name', 'like', "%{$pipelineType}%")->first();
            if (!$pipeline) {
                $pipeline = Pipeline::first();
            }

            // No pipeline (or no stages) means the lead is saved but never lands
            // on the Kanban board. That used to fail silently; alert instead.
            if (!$pipeline) {
                Log::warning('Lead captured but no pipeline exists', ['lead_id' => $lead->id]);
                \App\Services\Notifier::pipelineMisconfigured();
                return;
            }

            $firstStage = PipelineStage::where('pipeline_id', $pipeline->id)
                ->orderBy('sort_order')
                ->first();

            if (!$firstStage) {
                Log::warning('Pipeline has no stages', ['pipeline_id' => $pipeline->id]);
                \App\Services\Notifier::pipelineMisconfigured();
                return;
            }

            // Pipelines run on Deals (leads carry no pipeline columns), so the
            // Kanban board only sees this lead once a deal exists for it.
            \App\Models\Deal::firstOrCreate(
                ['lead_id' => $lead->id],
                [
                    'pipeline_id' => $pipeline->id,
                    'stage_id' => $firstStage->id,
                    'title' => trim(($lead->first_name . ' ' . $lead->last_name)) ?: ($lead->email ?? 'Lead #' . $lead->id),
                    'status' => 'open',
                    'assigned_to' => $lead->assigned_to,
                    'value' => $lead->budget_max ?? $lead->budget_min ?? 0,
                ]
            );
        } catch (\Exception $e) {
            Log::warning('Failed to assign lead to pipeline', [
                'lead_id' => $lead->id,
                'pipeline_type' => $pipelineType,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function createActivity(Lead $lead, string $type, string $description): void
    {
        try {
            LeadActivity::create([
                'lead_id' => $lead->id,
                'type' => $type,
                'description' => $description,
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to create activity', [
                'lead_id' => $lead->id,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function triggerAutomation(string $event, Lead $lead): void
    {
        try {
            if (class_exists(AutomationEngine::class)) {
                $data = array_merge($lead->toArray(), [
                    'lead_id' => $lead->id,
                ]);
                AutomationEngine::trigger($event, $data);
            }
        } catch (\Exception $e) {
            Log::warning('Automation trigger failed', [
                'event' => $event,
                'lead_id' => $lead->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function sendNotifications(string $type, Lead $lead, array $data): void
    {
        try {
            $adminEmail = config('mail.from.address', 'admin@domesticrealestate.us');
            
            Mail::send([], [], function ($message) use ($adminEmail, $type, $lead, $data) {
                $message->to($adminEmail)
                    ->subject("New " . ucfirst(str_replace('_', ' ', $type)) . " - {$lead->first_name} {$lead->last_name}")
                    ->html($this->buildAdminEmail($type, $lead, $data));
            });

            if (!empty($data['email'])) {
                Mail::send([], [], function ($message) use ($data, $type) {
                    $message->to($data['email'])
                        ->subject("Thank you for your " . ucfirst(str_replace('_', ' ', $type)))
                        ->html($this->buildConfirmationEmail($type, $data));
                });
            }
        } catch (\Exception $e) {
            Log::warning('Email notification failed', [
                'type' => $type,
                'lead_id' => $lead->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function buildAdminEmail(string $type, Lead $lead, array $data): string
    {
        $html = "<h2>New " . ucfirst(str_replace('_', ' ', $type)) . "</h2>";
        $html .= "<p><strong>Name:</strong> {$lead->first_name} {$lead->last_name}</p>";
        $html .= "<p><strong>Email:</strong> {$lead->email}</p>";
        if ($lead->phone) {
            $html .= "<p><strong>Phone:</strong> {$lead->phone}</p>";
        }
        $html .= "<p><strong>Lead Number:</strong> {$lead->lead_number}</p>";
        $html .= "<p><strong>Source:</strong> {$lead->source}</p>";
        $html .= "<hr>";
        $html .= "<p><a href='" . config('app.url') . "/admin/leads/{$lead->id}'>View in Admin Dashboard</a></p>";
        return $html;
    }

    private function buildConfirmationEmail(string $type, array $data): string
    {
        $html = "<h2>Thank You, {$data['first_name']}!</h2>";
        $html .= "<p>We have received your " . strtolower(str_replace('_', ' ', $type)) . ".</p>";
        $html .= "<p>Our team will review and contact you within 24-48 hours.</p>";
        $html .= "<hr>";
        $html .= "<p><strong>Domestic Real Estate</strong><br>Your Key to Home</p>";
        return $html;
    }

    public function indexCustomFields(Request $request)
    {
        $formType = $request->query('form_type');
        $query = CustomFormField::query();
        if ($request->user()) {
            $query->where('user_id', $request->user()->id);
        }
        if ($formType) {
            $query->where('form_type', $formType);
        }
        $fields = $query->orderBy('sort_order')->get();
        return response()->json(['data' => $fields]);
    }

    public function storeCustomField(Request $request)
    {
        $validated = $request->validate([
            'form_type' => 'required|string|max:100',
            'field_label' => 'required|string|max:255',
            'field_type' => 'required|string|max:50',
            'options' => 'nullable|array',
            'is_required' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $field = CustomFormField::create([
            'user_id' => $request->user()?->id,
            'form_type' => $validated['form_type'],
            'field_label' => $validated['field_label'],
            'field_type' => $validated['field_type'],
            'options' => $validated['options'] ?? null,
            'is_required' => $validated['is_required'] ?? false,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        return response()->json($field, 201);
    }

    public function updateCustomField(Request $request, $id)
    {
        $field = CustomFormField::findOrFail($id);
        if ($request->user() && $field->user_id && $field->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'field_label' => 'sometimes|string|max:255',
            'field_type' => 'sometimes|string|max:50',
            'options' => 'nullable|array',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $field->update($validated);
        return response()->json($field);
    }

    public function toggleCustomField(Request $request, $id)
    {
        $field = CustomFormField::findOrFail($id);
        if ($request->user() && $field->user_id && $field->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $field->update(['is_active' => !$field->is_active]);
        return response()->json($field);
    }

    public function destroyCustomField(Request $request, $id)
    {
        $field = CustomFormField::findOrFail($id);
        if ($request->user() && $field->user_id && $field->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $field->delete();
        return response()->json(['message' => 'Field deleted']);
    }
}
