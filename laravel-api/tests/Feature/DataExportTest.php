<?php

namespace Tests\Feature;

use App\Models\DataExport;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DataExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_accepts_new_report_export_types(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        foreach (['deals', 'invoices', 'agent_leads'] as $type) {
            $this->actingAs($admin)->postJson('/api/admin/exports', [
                'export_type' => $type,
                'format' => 'csv',
            ])->assertStatus(201);
        }

        $this->assertSame(3, DataExport::count());
        $this->assertSame(3, DataExport::where('status', 'completed')->count());
    }

    public function test_store_rejects_unknown_export_type(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson('/api/admin/exports', ['export_type' => 'nonsense', 'format' => 'csv'])
            ->assertStatus(422);
    }

    public function test_agent_leads_export_aggregates_leads_per_agent(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create(['role' => 'admin']);
        $agent = User::factory()->create(['role' => 'agent']);
        Lead::create(['email' => 'a@example.com', 'first_name' => 'A', 'type' => 'buyer', 'assigned_to' => $agent->id]);
        Lead::create(['email' => 'b@example.com', 'first_name' => 'B', 'type' => 'buyer', 'assigned_to' => $agent->id]);

        $this->actingAs($admin)->postJson('/api/admin/exports', ['export_type' => 'agent_leads', 'format' => 'csv'])
            ->assertStatus(201);

        $export = DataExport::where('export_type', 'agent_leads')->firstOrFail();
        $this->assertSame('completed', $export->status);
        $this->assertSame(1, $export->row_count);
        $this->assertNotNull($export->file_path);
        $this->assertTrue(Storage::disk('local')->exists($export->file_path));

        $csv = Storage::disk('local')->get($export->file_path);
        $this->assertStringContainsString('agent_name,agent_id,lead_count,converted_count', $csv);
        $this->assertStringContainsString('2,', $csv);
    }
}
