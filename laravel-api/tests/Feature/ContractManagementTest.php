<?php

namespace Tests\Feature;

use App\Console\Commands\SendContractExpirationReminders;
use App\Mail\ContractExpiringReminder;
use App\Models\Contract;
use App\Models\ContractActivityLog;
use App\Models\ContractSigner;
use App\Models\ContractTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContractManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_contract_from_template_with_merge_fields(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = User::factory()->create(['role' => 'buyer', 'name' => 'Jane Doe']);
        $template = ContractTemplate::create([
            'name' => 'Standard Listing',
            'html' => '<p>Agreement for {{client_name}}.</p>',
            'created_by' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->postJson('/api/admin/contracts', [
            'user_id' => $client->id,
            'template_name' => 'Standard Listing',
            'contract_template_id' => $template->id,
            'client_details' => ['client_name' => 'Jane Doe'],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('template_html', '<p>Agreement for Jane Doe.</p>')
            ->assertJsonPath('current_version', 1);

        $this->assertDatabaseHas('contract_versions', [
            'contract_id' => $response->json('id'),
            'version_number' => 1,
        ]);
    }

    public function test_updating_contract_html_creates_a_new_version_and_diff(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $contract = Contract::factory()->create(['template_html' => "Line one\nLine two"]);
        \App\Models\ContractVersion::create([
            'contract_id' => $contract->id,
            'version_number' => 1,
            'template_html' => "Line one\nLine two",
            'changed_by' => $admin->id,
        ]);

        $update = $this->actingAs($admin)->putJson("/api/admin/contracts/{$contract->id}", [
            'template_html' => "Line one\nLine three",
            'change_note' => 'Updated line two',
        ]);

        $update->assertOk()->assertJsonPath('current_version', 2);

        $versions = $this->actingAs($admin)->getJson("/api/admin/contracts/{$contract->id}/versions");
        $versions->assertOk()->assertJsonCount(2, 'versions');
        $this->assertNotNull($versions->json('latest_diff'));

        $this->assertDatabaseHas('contract_activity_logs', [
            'contract_id' => $contract->id,
            'action' => 'version_created',
        ]);
    }

    public function test_multi_party_signing_requires_all_signers_before_contract_is_signed(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer', 'email' => 'buyer@example.com']);
        $seller = User::factory()->create(['role' => 'buyer', 'email' => 'seller@example.com']);
        $contract = Contract::factory()->create([
            'user_id' => $buyer->id,
            'status' => 'sent',
            'expires_at' => now()->addDays(5),
        ]);
        $signerA = ContractSigner::create(['contract_id' => $contract->id, 'name' => 'Buyer', 'email' => 'buyer@example.com', 'role' => 'signer', 'sort_order' => 0]);
        $signerB = ContractSigner::create(['contract_id' => $contract->id, 'name' => 'Seller', 'email' => 'seller@example.com', 'role' => 'signer', 'sort_order' => 1]);

        // The legacy single-signer endpoint must refuse once signer rows exist.
        $this->actingAs($buyer)->postJson("/api/contracts/{$contract->contract_number}/sign", ['signature_base64' => 'data:x'])
            ->assertStatus(422);

        $first = $this->actingAs($buyer)->postJson("/api/contracts/{$contract->contract_number}/signers/{$signerA->id}/sign", [
            'signature_base64' => 'data:sigA',
        ]);
        $first->assertOk()->assertJsonPath('contract.status', 'sent');

        // Wrong user cannot claim someone else's signer slot.
        $this->actingAs($buyer)->postJson("/api/contracts/{$contract->contract_number}/signers/{$signerB->id}/sign", [
            'signature_base64' => 'data:sigB',
        ])->assertStatus(403);

        $second = $this->actingAs($seller)->postJson("/api/contracts/{$contract->contract_number}/signers/{$signerB->id}/sign", [
            'signature_base64' => 'data:sigB',
        ]);
        $second->assertOk()->assertJsonPath('contract.status', 'signed');

        $this->assertSame('signed', $contract->fresh()->status);
    }

    public function test_viewing_and_downloading_a_contract_records_activity_log(): void
    {
        $owner = User::factory()->create(['role' => 'buyer']);
        $contract = Contract::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($owner)->getJson("/api/contracts/{$contract->contract_number}")->assertOk();

        $this->assertDatabaseHas('contract_activity_logs', [
            'contract_id' => $contract->id,
            'action' => 'viewed',
        ]);

        $download = $this->actingAs($owner)->get("/api/contracts/{$contract->contract_number}/download");
        $download->assertOk();

        $this->assertDatabaseHas('contract_activity_logs', [
            'contract_id' => $contract->id,
            'action' => 'downloaded',
        ]);
    }

    public function test_timeline_reflects_activity_and_signer_status(): void
    {
        $owner = User::factory()->create(['role' => 'buyer']);
        $contract = Contract::factory()->create(['user_id' => $owner->id]);
        ContractSigner::create(['contract_id' => $contract->id, 'name' => 'Owner', 'email' => $owner->email, 'role' => 'signer']);

        $this->actingAs($owner)->getJson("/api/contracts/{$contract->contract_number}")->assertOk();

        $timeline = $this->actingAs($owner)->getJson("/api/contracts/{$contract->contract_number}/timeline");
        $timeline->assertOk()->assertJsonCount(1, 'signers');
        $this->assertGreaterThanOrEqual(1, count($timeline->json('activity')));
    }

    public function test_admin_can_renew_a_contract(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $contract = Contract::factory()->create(['status' => 'sent', 'expires_at' => now()->addDay()]);

        $response = $this->actingAs($admin)->postJson("/api/admin/contracts/{$contract->id}/renew");

        $response->assertStatus(201)
            ->assertJsonPath('renewed_from_contract_id', $contract->id)
            ->assertJsonPath('status', 'draft');

        $this->assertDatabaseHas('contract_activity_logs', [
            'contract_id' => $contract->id,
            'action' => 'renewed',
        ]);
    }

    public function test_expiration_reminder_command_emails_and_marks_sent_once(): void
    {
        Mail::fake();

        $user = User::factory()->create();
        $contract = Contract::factory()->create([
            'user_id' => $user->id,
            'status' => 'sent',
            'expires_at' => now()->addDays(2),
        ]);

        $this->artisan(SendContractExpirationReminders::class)->assertSuccessful();

        Mail::assertQueued(ContractExpiringReminder::class);
        $this->assertNotNull($contract->fresh()->last_reminder_sent_at);

        // Running it again immediately must not send a duplicate reminder.
        Mail::fake();
        $this->artisan(SendContractExpirationReminders::class)->assertSuccessful();
        Mail::assertNothingQueued();
    }

    public function test_admin_contract_template_crud(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $create = $this->actingAs($admin)->postJson('/api/admin/contract-templates', [
            'name' => 'Buyer Agreement',
            'html' => '<p>Hello {{client_name}}</p>',
            'merge_fields' => ['client_name'],
        ]);
        $create->assertStatus(201);
        $id = $create->json('id');

        $this->actingAs($admin)->getJson('/api/admin/contract-templates')->assertOk()->assertJsonCount(1);

        $this->actingAs($admin)->putJson("/api/admin/contract-templates/{$id}", ['name' => 'Buyer Agreement v2'])
            ->assertOk()->assertJsonPath('name', 'Buyer Agreement v2');

        $this->actingAs($admin)->deleteJson("/api/admin/contract-templates/{$id}")->assertOk();
        $this->assertDatabaseMissing('contract_templates', ['id' => $id]);
    }

    public function test_non_admin_cannot_manage_contract_templates(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);

        $this->actingAs($buyer)->getJson('/api/admin/contract-templates')->assertStatus(403);
        $this->actingAs($buyer)->postJson('/api/admin/contract-templates', ['name' => 'x', 'html' => 'x'])->assertStatus(403);
    }

    public function test_admin_can_load_contract_creation_options(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create(['role' => 'buyer', 'name' => 'Alice Buyer', 'status' => 'active']);
        $seller = User::factory()->create(['role' => 'seller', 'name' => 'Bob Seller', 'status' => 'active']);
        $agent = User::factory()->create(['role' => 'agent', 'name' => 'Carol Agent', 'status' => 'active']);

        $response = $this->actingAs($admin)->getJson('/api/admin/contracts/available');

        $response->assertOk();
        $clientIds = collect($response->json('clients'))->pluck('id')->all();
        $this->assertContains($buyer->id, $clientIds);
        $this->assertContains($seller->id, $clientIds);

        $agentIds = collect($response->json('agents'))->pluck('id')->all();
        $this->assertContains($agent->id, $agentIds);

        $this->assertIsArray($response->json('properties'));
    }

    public function test_admin_can_view_single_contract_with_timeline(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = User::factory()->create(['role' => 'buyer']);
        $contract = Contract::factory()->create(['user_id' => $client->id]);
        ContractActivityLog::log($contract->id, 'sent');

        $response = $this->actingAs($admin)->getJson("/api/admin/contracts/{$contract->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $contract->id)
            ->assertJsonPath('data.contract_number', $contract->contract_number);
        $this->assertCount(1, $response->json('timeline'));
    }

    public function test_admin_can_download_contract_pdf(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $contract = Contract::factory()->create();

        $this->actingAs($admin)->get("/api/admin/contracts/{$contract->id}/pdf")->assertOk();

        $this->assertDatabaseHas('contract_activity_logs', [
            'contract_id' => $contract->id,
            'action' => 'downloaded',
        ]);
    }

    public function test_non_admin_cannot_access_new_admin_contract_endpoints(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $contract = Contract::factory()->create(['user_id' => $buyer->id]);

        $this->actingAs($buyer)->getJson('/api/admin/contracts/available')->assertStatus(403);
        $this->actingAs($buyer)->getJson("/api/admin/contracts/{$contract->id}")->assertStatus(403);
        $this->actingAs($buyer)->get("/api/admin/contracts/{$contract->id}/pdf")->assertStatus(403);
    }
}
