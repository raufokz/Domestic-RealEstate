<?php

namespace Tests\Feature;

use App\Models\AgentProfile;
use App\Models\Contract;
use App\Models\Invoice;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_bypasses_every_policy_via_gate_before(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $otherAgentsProperty = Property::factory()->create(['realtor_id' => User::factory()->create(['role' => 'agent'])->id]);

        $this->assertTrue($superAdmin->can('update', $otherAgentsProperty));
        $this->assertTrue($superAdmin->can('markPaid', Invoice::factory()->create(['user_id' => $superAdmin->id])));
    }

    public function test_agent_can_only_update_their_own_property(): void
    {
        $owner = User::factory()->create(['role' => 'agent']);
        $otherAgent = User::factory()->create(['role' => 'agent']);
        $property = Property::factory()->create(['realtor_id' => $owner->id]);

        $this->assertTrue($owner->can('update', $property));
        $this->assertFalse($otherAgent->can('update', $property));
    }

    public function test_staff_can_update_any_property(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $property = Property::factory()->create(['realtor_id' => User::factory()->create(['role' => 'agent'])->id]);

        $this->assertTrue($staff->can('update', $property));
    }

    public function test_only_contract_owner_can_sign_their_contract(): void
    {
        $owner = User::factory()->create(['role' => 'buyer']);
        $stranger = User::factory()->create(['role' => 'buyer']);
        $contract = Contract::factory()->create(['user_id' => $owner->id]);

        $this->assertTrue($owner->can('sign', $contract));
        $this->assertFalse($stranger->can('sign', $contract));
    }

    public function test_invoice_mark_paid_policy_always_denies(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $invoice = Invoice::factory()->create(['user_id' => $staff->id]);

        $this->assertFalse($staff->can('markPaid', $invoice));
    }

    public function test_only_staff_can_verify_an_agent_profile(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);
        $profile = AgentProfile::factory()->create(['user_id' => $agent->id]);
        $staff = User::factory()->create(['role' => 'staff']);

        $this->assertFalse($agent->can('verify', $profile));
        $this->assertTrue($staff->can('verify', $profile));
    }
}
