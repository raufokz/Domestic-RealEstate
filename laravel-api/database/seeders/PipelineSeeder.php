<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pipeline;
use App\Models\PipelineStage;

class PipelineSeeder extends Seeder
{
    public function run(): void
    {
        $pipeline = Pipeline::create([
            'name' => 'Sales Pipeline',
            'slug' => 'sales-pipeline',
            'description' => 'Default sales pipeline for managing deals',
            'is_default' => true,
        ]);

        $stages = [
            ['name' => 'New Lead', 'slug' => 'new-lead', 'color' => '#3B82F6', 'probability' => 10],
            ['name' => 'Contacted', 'slug' => 'contacted', 'color' => '#8B5CF6', 'probability' => 25],
            ['name' => 'Qualified', 'slug' => 'qualified', 'color' => '#F59E0B', 'probability' => 50],
            ['name' => 'Proposal Sent', 'slug' => 'proposal-sent', 'color' => '#F97316', 'probability' => 70],
            ['name' => 'Negotiation', 'slug' => 'negotiation', 'color' => '#EF4444', 'probability' => 85],
            ['name' => 'Closed Won', 'slug' => 'closed-won', 'color' => '#10B981', 'probability' => 100, 'is_won' => true],
            ['name' => 'Closed Lost', 'slug' => 'closed-lost', 'color' => '#6B7280', 'probability' => 0, 'is_lost' => true],
        ];

        foreach ($stages as $i => $stage) {
            PipelineStage::create(array_merge($stage, [
                'pipeline_id' => $pipeline->id,
                'sort_order' => $i,
            ]));
        }
    }
}
