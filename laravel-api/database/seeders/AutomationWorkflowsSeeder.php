<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AutomationWorkflowsSeeder extends Seeder
{
    public function run(): void
    {
        $workflows = [
            [
                'name' => 'New Lead Automated Follow-up',
                'description' => 'Automatically create a follow-up task and send a welcome email when a new lead enters the CRM.',
                'trigger_type' => 'new_lead',
                'trigger_conditions' => json_encode(['source' => 'any']),
                'actions' => json_encode([
                    ['type' => 'send_email', 'config' => ['subject' => 'Welcome to Domestic Real Estate', 'template' => 'welcome_lead']],
                    ['type' => 'create_task', 'config' => ['title' => 'Initial phone outreach', 'due_in_hours' => 24]],
                    ['type' => 'notification', 'config' => ['message' => 'New lead captured', 'severity' => 'info']],
                ]),
                'is_active' => true,
                'run_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Deal Stage Change Alert',
                'description' => 'Notify assigned agent and team when a deal stage is updated on the Kanban board.',
                'trigger_type' => 'status_changed',
                'trigger_conditions' => json_encode(['field' => 'stage_id']),
                'actions' => json_encode([
                    ['type' => 'notification', 'config' => ['message' => 'Deal stage updated on Kanban board', 'severity' => 'warning']],
                    ['type' => 'add_tag', 'config' => ['tag' => 'Active Pipeline']],
                ]),
                'is_active' => true,
                'run_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Seller Valuation Request Auto-Assign',
                'description' => 'Instantly assign seller valuation form submissions to top-performing realtors.',
                'trigger_type' => 'form_submitted',
                'trigger_conditions' => json_encode(['form' => 'seller_valuation']),
                'actions' => json_encode([
                    ['type' => 'assign_agent', 'config' => ['strategy' => 'round_robin']],
                    ['type' => 'send_email', 'config' => ['subject' => 'Your Valuation Report is Being Prepared', 'template' => 'seller_valuation']],
                ]),
                'is_active' => true,
                'run_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($workflows as $wf) {
            DB::table('automation_workflows')->updateOrInsert(
                ['name' => $wf['name']],
                $wf
            );
        }
    }
}
