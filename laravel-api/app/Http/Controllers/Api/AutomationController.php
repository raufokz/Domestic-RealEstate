<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutomationWorkflow;
use App\Models\AutomationWorkflowLog;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AutomationController extends Controller
{
    /**
     * Catalog of trigger event types supported by the automation engine.
     * Keys are the DB values stored on workflows.trigger_type.
     */
    private const TRIGGER_CATALOG = [
        'new_lead' => 'New Lead Created',
        'form_submitted' => 'Form Submitted',
        'status_changed' => 'Lead Status Changed',
        'property_approved' => 'Property Approved',
        'appointment_booked' => 'Appointment Booked',
        'contract_signed' => 'Contract Signed',
        'newsletter_subscribed' => 'Newsletter Subscribed',
        'contact_imported' => 'Contact Imported',
        'scheduled_time' => 'Scheduled Time',
    ];

    /**
     * Catalog of action types the automation engine can run.
     * Keys match the "type" field inside workflows.actions[].
     */
    private const ACTION_CATALOG = [
        'send_email' => 'Send Email',
        'send_notification' => 'Send Notification',
        'create_task' => 'Create Task',
        'assign_agent' => 'Assign Agent',
        'update_status' => 'Update Status',
        'post_social' => 'Post to Social',
        'add_tag' => 'Add Tag',
        'add_to_campaign' => 'Add to Campaign',
    ];
    public function index(): JsonResponse
    {
        $workflows = AutomationWorkflow::latest()->get();
        return response()->json($workflows);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger_type' => 'required|string',
            'trigger_conditions' => 'nullable|array',
            'actions' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        // Map friendly aliases to DB values
        $triggerMap = [
            'lead_created' => 'new_lead',
            'lead_updated' => 'status_changed',
            'property_created' => 'property_approved',
            'schedule' => 'scheduled_time',
            'manual' => 'form_submitted',
        ];
        if (isset($triggerMap[$validated['trigger_type']])) {
            $validated['trigger_type'] = $triggerMap[$validated['trigger_type']];
        }

        $validated['actions'] = $validated['actions'] ?? [
            ['type' => 'send_email', 'config' => ['template' => 'welcome']],
            ['type' => 'create_task', 'config' => ['title' => 'Follow up']],
        ];
        $validated['is_active'] = $validated['is_active'] ?? false;

        $workflow = AutomationWorkflow::create($validated);
        return response()->json($workflow, 201);
    }

    public function show(int $id): JsonResponse
    {
        $workflow = AutomationWorkflow::findOrFail($id);
        return ApiResponse::ok($this->presentWorkflow($workflow), 'Workflow loaded');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $workflow = AutomationWorkflow::findOrFail($id);

        $data = $request->only(['name', 'description', 'trigger_type', 'trigger_conditions', 'actions', 'is_active']);

        // Keep aliases in sync with store(): a workflow saved from the admin
        // detail page used to persist e.g. "lead_updated" verbatim, which the
        // engine's canonicalize() never matched — so edited triggers silently died.
        if (isset($data['trigger_type'])) {
            $triggerMap = [
                'lead_created' => 'new_lead',
                'lead_updated' => 'status_changed',
                'property_created' => 'property_approved',
                'schedule' => 'scheduled_time',
                'manual' => 'form_submitted',
            ];
            if (isset($triggerMap[$data['trigger_type']])) {
                $data['trigger_type'] = $triggerMap[$data['trigger_type']];
            }
        }

        $workflow->update($data);
        return response()->json($workflow);
    }

    public function destroy(int $id): JsonResponse
    {
        AutomationWorkflow::findOrFail($id)->delete();
        return response()->json(['message' => 'Workflow deleted']);
    }

    public function toggle(int $id): JsonResponse
    {
        $workflow = AutomationWorkflow::findOrFail($id);
        $workflow->update(['is_active' => !$workflow->is_active]);
        return response()->json($workflow);
    }

    public function logs(int $id): JsonResponse
    {
        // Ensure the workflow exists so a bad id returns 404 (not an empty list).
        AutomationWorkflow::findOrFail($id);

        $logs = AutomationWorkflowLog::where('workflow_id', $id)
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (AutomationWorkflowLog $log) => [
                'id' => $log->id,
                'trigger_event' => $log->trigger_event ?? '—',
                'status' => $log->status ?? 'success',
                'action_results' => array_map(function ($result) {
                    return [
                        'action' => $result['action'] ?? ($result['type'] ?? 'Action'),
                        'status' => $result['status'] ?? 'success',
                        'detail' => $result['detail'] ?? ($result['message'] ?? ''),
                    ];
                }, is_array($log->action_results) ? $log->action_results : []),
                'timestamp' => optional($log->created_at)->toIso8601String(),
                'duration_ms' => $log->duration_ms ?? null,
            ]);

        return ApiResponse::ok($logs, 'Run history loaded');
    }

    /**
     * Read-only catalog of trigger event types with real usage counts.
     * Triggers are not standalone records — they live on workflows.trigger_type.
     */
    public function triggers(): JsonResponse
    {
        $workflows = AutomationWorkflow::get(['trigger_type', 'is_active']);

        $items = [];
        foreach (self::TRIGGER_CATALOG as $eventType => $label) {
            $matching = $workflows->where('trigger_type', $eventType);
            $items[] = [
                'event_type' => $eventType,
                'name' => $label,
                'workflow_count' => $matching->count(),
                'active_count' => $matching->where('is_active', true)->count(),
            ];
        }

        return ApiResponse::ok($items, 'Trigger catalog loaded');
    }

    /**
     * Read-only catalog of action types with real usage counts.
     * Actions are not standalone records — they live inside workflows.actions[].
     */
    public function actions(): JsonResponse
    {
        $workflows = AutomationWorkflow::get(['actions']);

        $counts = array_fill_keys(array_keys(self::ACTION_CATALOG), 0);
        foreach ($workflows as $workflow) {
            $seen = [];
            foreach ((is_array($workflow->actions) ? $workflow->actions : []) as $action) {
                $type = $action['type'] ?? null;
                if ($type && isset($counts[$type]) && ! isset($seen[$type])) {
                    $counts[$type]++;
                    $seen[$type] = true;
                }
            }
        }

        $items = [];
        foreach (self::ACTION_CATALOG as $type => $label) {
            $items[] = [
                'type' => $type,
                'name' => $label,
                'workflow_count' => $counts[$type],
            ];
        }

        return ApiResponse::ok($items, 'Action catalog loaded');
    }

    /**
     * Normalize a workflow into the shape the admin detail page expects.
     */
    private function presentWorkflow(AutomationWorkflow $workflow): array
    {
        $conditions = [];
        foreach ((is_array($workflow->trigger_conditions) ? $workflow->trigger_conditions : []) as $key => $cond) {
            if (is_array($cond)) {
                $conditions[] = [
                    'field' => $cond['field'] ?? (is_string($key) ? $key : ''),
                    'operator' => $cond['operator'] ?? 'equals',
                    'value' => is_array($cond['value'] ?? null) ? implode(',', $cond['value']) : ($cond['value'] ?? ''),
                ];
            } else {
                // Simple field => value map
                $conditions[] = ['field' => (string) $key, 'operator' => 'equals', 'value' => (string) $cond];
            }
        }

        return [
            'id' => $workflow->id,
            'name' => $workflow->name,
            'description' => $workflow->description ?? '',
            'trigger_type' => $workflow->trigger_type,
            'status' => $workflow->is_active ? 'active' : 'inactive',
            'conditions' => $conditions,
            'actions' => array_map(function ($action) {
                return [
                    'type' => $action['type'] ?? 'action',
                    'config' => $action['config'] ?? [],
                ];
            }, is_array($workflow->actions) ? $workflow->actions : []),
            'run_count' => (int) ($workflow->run_count ?? 0),
            'created_at' => optional($workflow->created_at)->toIso8601String(),
        ];
    }
}
