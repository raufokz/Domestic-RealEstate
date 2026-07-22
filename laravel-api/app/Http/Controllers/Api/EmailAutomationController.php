<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailAutomationRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailAutomationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $rules = EmailAutomationRule::with('emailTemplate')->latest()->get();
        return response()->json($rules);
    }

    public function show(int $id): JsonResponse
    {
        $rule = EmailAutomationRule::with('emailTemplate')->findOrFail($id);
        return response()->json($rule);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger_event' => 'required|string|max:255',
            'email_template_id' => 'nullable|integer|exists:email_templates,id',
            'conditions' => 'nullable|array',
            'delay_config' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $rule = EmailAutomationRule::create($validated);
        return response()->json($rule, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $rule = EmailAutomationRule::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'trigger_event' => 'sometimes|string|max:255',
            'email_template_id' => 'nullable|integer|exists:email_templates,id',
            'conditions' => 'nullable|array',
            'delay_config' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $rule->update($validated);
        return response()->json($rule);
    }

    public function destroy(int $id): JsonResponse
    {
        $rule = EmailAutomationRule::findOrFail($id);
        $rule->delete();
        return response()->json(['message' => 'Automation rule deleted']);
    }

    public function toggleActive(int $id): JsonResponse
    {
        $rule = EmailAutomationRule::findOrFail($id);
        $rule->update(['is_active' => !$rule->is_active]);
        return response()->json($rule);
    }

    public function getTriggers(): JsonResponse
    {
        $triggers = [
            ['event' => 'lead_created', 'label' => 'Lead Created', 'description' => 'When a new lead is added to the CRM'],
            ['event' => 'lead_status_changed', 'label' => 'Lead Status Changed', 'description' => 'When a lead status is updated'],
            ['event' => 'form_submitted', 'label' => 'Form Submitted', 'description' => 'When a website form is submitted'],
            ['event' => 'user_registered', 'label' => 'User Registered', 'description' => 'When a new user registers'],
            ['event' => 'property_created', 'label' => 'Property Listed', 'description' => 'When a new property is listed'],
            ['event' => 'appointment_booked', 'label' => 'Appointment Booked', 'description' => 'When an appointment is scheduled'],
            ['event' => 'contract_signed', 'label' => 'Contract Signed', 'description' => 'When a contract is signed'],
            ['event' => 'invoice_paid', 'label' => 'Invoice Paid', 'description' => 'When an invoice payment is received'],
        ];

        return response()->json($triggers);
    }
}
