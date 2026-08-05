<?php

namespace App\Console\Commands;

use App\Models\AutomationWorkflow;
use App\Services\AutomationEngine;
use Illuminate\Console\Command;

/**
 * Runs automation workflows whose trigger is "Scheduled Time".
 *
 * The admin UI offers "Scheduled Time" as a trigger, but without a scheduler
 * job nothing ever fired those workflows — a dead trigger. This command runs
 * every active scheduled workflow, carrying the current timestamp so condition
 * rules (e.g. cadence/dow) can gate execution.
 */
class RunScheduledWorkflows extends Command
{
    protected $signature = 'automation:run-scheduled {--cadence= : Only run workflows whose conditions request this cadence}';

    protected $description = 'Run automation workflows with the scheduled_time trigger';

    public function handle(): int
    {
        $workflows = AutomationWorkflow::where('is_active', true)
            ->where('trigger_type', 'scheduled_time')
            ->get();

        if ($workflows->isEmpty()) {
            $this->info('No active scheduled workflows.');

            return self::SUCCESS;
        }

        foreach ($workflows as $workflow) {
            $data = [
                'now' => now()->toIso8601String(),
                'date' => now()->toDateString(),
                'time' => now()->format('H:i:s'),
                'day_of_week' => now()->format('l'),
                'cadence' => $this->option('cadence') ?? 'hourly',
            ];

            AutomationEngine::trigger('scheduled_time', $data);
            $this->info("Triggered scheduled workflow #{$workflow->id} ({$workflow->name}).");
        }

        return self::SUCCESS;
    }
}
