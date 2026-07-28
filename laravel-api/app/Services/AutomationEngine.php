<?php

namespace App\Services;

use App\Mail\CampaignMail;
use App\Models\AutomationWorkflow;
use App\Models\AutomationWorkflowLog;
use App\Models\EmailAutomationRule;
use App\Models\EmailTemplate;
use App\Models\Lead;
use App\Models\LeadTask;
use App\Models\SentEmail;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AutomationEngine
{
    /** Map frontend / rule aliases → all matching trigger names for a family */
    public static function canonicalize(string $triggerType): array
    {
        $families = [
            'new_lead' => ['new_lead', 'lead_created', 'form_submitted', 'inquiry_submitted'],
            'status_changed' => ['status_changed', 'lead_status_changed'],
            'appointment_booked' => ['appointment_booked'],
            'invoice_paid' => ['invoice_paid'],
            'user_registered' => ['user_registered'],
        ];

        foreach ($families as $aliases) {
            if (in_array($triggerType, $aliases, true)) {
                return $aliases;
            }
        }

        return [$triggerType];
    }

    public static function trigger(string $triggerType, array $data): void
    {
        try {
            $names = self::canonicalize($triggerType);

            $workflows = AutomationWorkflow::where('is_active', true)
                ->whereIn('trigger_type', $names)
                ->get();

            foreach ($workflows as $workflow) {
                if (self::conditionsMet($workflow, $data)) {
                    self::executeWorkflow($workflow, $data);
                }
            }

            $emailRules = EmailAutomationRule::where('is_active', true)
                ->whereIn('trigger_event', $names)
                ->get();

            foreach ($emailRules as $rule) {
                self::executeEmailRule($rule, $data);
            }
        } catch (\Exception $e) {
            Log::error("AutomationEngine trigger failed for {$triggerType}: {$e->getMessage()}");
        }
    }

    protected static function conditionsMet(AutomationWorkflow $workflow, array $data): bool
    {
        $conditions = $workflow->trigger_conditions ?? [];
        if (empty($conditions)) {
            return true;
        }

        foreach ($conditions as $key => $value) {
            if (is_string($value) && strtolower($value) === 'any') {
                continue;
            }
            if (isset($data[$key]) && (string) $data[$key] !== (string) $value) {
                return false;
            }
        }

        return true;
    }

    protected static function executeWorkflow(AutomationWorkflow $workflow, array $data): void
    {
        $actions = $workflow->actions ?? [];
        $results = [];

        try {
            foreach ($actions as $action) {
                $results[] = self::executeAction($action, $data);
            }

            $workflow->update([
                'run_count' => $workflow->run_count + 1,
                'last_run_at' => now(),
            ]);

            AutomationWorkflowLog::create([
                'workflow_id' => $workflow->id,
                'trigger_event' => $workflow->trigger_type,
                'trigger_data' => $data,
                'action_results' => $results,
                'status' => 'success',
            ]);
        } catch (\Exception $e) {
            Log::error("Workflow {$workflow->id} execution failed: {$e->getMessage()}");
            AutomationWorkflowLog::create([
                'workflow_id' => $workflow->id,
                'trigger_event' => $workflow->trigger_type,
                'trigger_data' => $data,
                'action_results' => ['error' => $e->getMessage()],
                'status' => 'failed',
            ]);
        }
    }

    protected static function executeAction(array $action, array $data): array
    {
        $type = $action['type'] ?? $action['action'] ?? '';
        $params = $action['params'] ?? $action['config'] ?? [];

        return match ($type) {
            'send_email' => self::actionSendEmail($params, $data),
            'notification' => self::actionNotification($params, $data),
            'create_task' => self::actionCreateTask($params, $data),
            'assign_agent' => self::actionAssignAgent($params, $data),
            'update_status' => self::actionUpdateStatus($params, $data),
            default => ['status' => 'skipped', 'reason' => "Unknown action: {$type}"],
        };
    }

    protected static function actionSendEmail(array $params, array $data): array
    {
        $to = $params['to'] ?? $data['email'] ?? null;
        if (! $to) {
            return ['status' => 'skipped', 'reason' => 'No recipient'];
        }

        $subject = $params['subject'] ?? 'Update from Domestic Real Estate';
        $htmlBody = $params['body'] ?? $params['message'] ?? '';

        $template = null;
        if (! empty($params['template_id'])) {
            $template = EmailTemplate::find($params['template_id']);
        } elseif (! empty($params['template'])) {
            $template = EmailTemplate::where('slug', $params['template'])->first();
        }

        if ($template) {
            $subject = $template->subject ?: $subject;
            $htmlBody = $template->html_body ?: $htmlBody;
        }

        if ($htmlBody === '') {
            $htmlBody = '<p>Hello'.(! empty($data['name']) ? ' '.e($data['name']) : '').',</p><p>Thank you for contacting Domestic Real Estate. A specialist will follow up shortly.</p><p>Email: info@domesticrealestate.us</p>';
        }

        $trackingId = (string) Str::uuid();
        $fromEmail = $params['from'] ?? config('mail.from.address', 'info@domesticrealestate.us');

        $sent = SentEmail::create([
            'from_email' => $fromEmail,
            'to_email' => $to,
            'subject' => $subject,
            'body' => $htmlBody,
            'status' => 'queued',
            'tracking_id' => $trackingId,
            'sent_at' => null,
        ]);

        try {
            if (IntegrationGate::softEmailAvailable()) {
                Mail::to($to)->queue(new CampaignMail(
                    emailSubject: $subject,
                    htmlBody: $htmlBody,
                    textBody: strip_tags($htmlBody),
                    trackingId: $trackingId,
                ));
                $sent->update(['status' => 'sent', 'sent_at' => now()]);

                return ['status' => 'sent', 'to' => $to];
            }

            $sent->update([
                'status' => 'failed',
                'error_message' => 'SMTP not configured',
                'sent_at' => now(),
            ]);

            return ['status' => 'logged', 'to' => $to, 'reason' => 'SMTP not configured — logged only'];
        } catch (\Throwable $e) {
            $sent->update(['status' => 'failed', 'error_message' => $e->getMessage()]);

            return ['status' => 'failed', 'to' => $to, 'error' => $e->getMessage()];
        }
    }

    protected static function actionNotification(array $params, array $data): array
    {
        Log::info('Automation notification', [
            'title' => $params['title'] ?? 'Automation',
            'message' => $params['message'] ?? '',
            'lead_id' => $data['lead_id'] ?? null,
        ]);

        return ['status' => 'logged', 'type' => 'notification'];
    }

    protected static function actionCreateTask(array $params, array $data): array
    {
        $leadId = $data['lead_id'] ?? null;
        if (! $leadId) {
            return ['status' => 'skipped', 'reason' => 'No lead_id'];
        }

        $dueHours = $params['due_hours'] ?? $params['due_in_hours'] ?? 24;

        LeadTask::create([
            'lead_id' => $leadId,
            'title' => $params['title'] ?? 'Follow up with lead',
            'description' => $params['description'] ?? '',
            'priority' => $params['priority'] ?? 'normal',
            'status' => 'pending',
            'due_date' => now()->addHours($dueHours),
            'assigned_to' => $params['assign_to'] ?? $data['assigned_to'] ?? null,
        ]);

        return ['status' => 'created', 'type' => 'task', 'lead_id' => $leadId];
    }

    protected static function actionAssignAgent(array $params, array $data): array
    {
        $leadId = $data['lead_id'] ?? null;
        if (! $leadId) {
            return ['status' => 'skipped', 'reason' => 'No lead_id'];
        }

        $agentId = $params['agent_id'] ?? null;
        if (! $agentId && ($params['method'] ?? '') === 'round_robin') {
            $agentId = self::getNextRoundRobinAgent();
        }

        if ($agentId) {
            Lead::where('id', $leadId)->update(['assigned_to' => $agentId, 'status' => 'contacted']);
        }

        return ['status' => 'assigned', 'lead_id' => $leadId, 'agent_id' => $agentId];
    }

    protected static function actionUpdateStatus(array $params, array $data): array
    {
        $leadId = $data['lead_id'] ?? null;
        $status = $params['status'] ?? null;
        if ($leadId && $status) {
            Lead::where('id', $leadId)->update(['status' => $status]);
        }

        return ['status' => 'updated', 'lead_id' => $leadId];
    }

    protected static function getNextRoundRobinAgent(): ?int
    {
        $agent = User::whereIn('role', ['agent', 'realtor'])
            ->withCount(['assignedLeads as open_leads_count' => function ($q) {
                $q->whereNotIn('status', ['converted', 'lost', 'archived']);
            }])
            ->orderBy('open_leads_count')
            ->first();

        if ($agent) {
            return $agent->id;
        }

        // Fallback without relation
        return User::whereIn('role', ['agent', 'realtor'])->orderBy('id')->value('id');
    }

    protected static function executeEmailRule(EmailAutomationRule $rule, array $data): void
    {
        $conditions = $rule->conditions ?? [];
        foreach ($conditions as $key => $value) {
            if (isset($data[$key]) && (string) $data[$key] !== (string) $value) {
                return;
            }
        }

        $to = $data['email'] ?? null;
        if (! $to) {
            return;
        }

        self::actionSendEmail([
            'to' => $to,
            'subject' => $rule->name ?? 'Update from Domestic Real Estate',
            'body' => $rule->email_body ?? $rule->template_body ?? '',
            'template_id' => $rule->template_id ?? null,
        ], $data);

        $rule->update([
            'execution_count' => $rule->execution_count + 1,
            'last_executed_at' => now(),
        ]);
    }
}
