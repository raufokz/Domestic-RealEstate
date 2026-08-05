<?php

namespace Tests\Feature;

use App\Models\AgentProfile;
use App\Models\RealtorApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RealtorApplicationTest extends TestCase
{
    use RefreshDatabase;

    private function application(array $overrides = []): RealtorApplication
    {
        return RealtorApplication::create(array_merge([
            'reference' => 'RA-TEST0001',
            'full_name' => 'Jane Realtor',
            'email' => 'jane@example.com',
            'license_number' => 'LIC-123',
            'license_state' => 'NY',
            'brokerage_name' => 'Test Brokerage',
            'status' => 'pending',
            'submitted_at' => now(),
        ], $overrides));
    }

    public function test_public_form_submission_creates_a_real_application_row_not_just_a_lead(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/forms/realtor-application', [
            'first_name' => 'Jane',
            'last_name' => 'Realtor',
            'email' => 'jane.realtor@example.com',
            'brokerage' => 'Test Brokerage',
            'license_number' => 'LIC-999',
            'state' => 'NY',
            'city' => 'New York',
            'agreement_accepted' => true,
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['application_reference']);
        $this->assertDatabaseHas('realtor_applications', [
            'email' => 'jane.realtor@example.com',
            'license_number' => 'LIC-999',
            'status' => 'pending',
        ]);
    }

    public function test_admin_queue_is_not_reachable_without_permission(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);

        $this->actingAs($agent)->getJson('/api/admin/realtor-applications')->assertStatus(403);
    }

    public function test_staff_can_list_applications(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $this->application();

        $response = $this->actingAs($staff)->getJson('/api/admin/realtor-applications');

        $response->assertStatus(200);
        $response->assertJsonFragment(['reference' => 'RA-TEST0001']);
    }

    public function test_approve_creates_user_and_published_agent_profile_and_sends_email(): void
    {
        Mail::fake();
        $staff = User::factory()->create(['role' => 'staff']);
        $application = $this->application();

        $response = $this->actingAs($staff)->postJson("/api/admin/realtor-applications/{$application->id}/approve");

        $response->assertStatus(200);
        $user = User::where('email', 'jane@example.com')->first();
        $this->assertNotNull($user);
        $this->assertSame('agent', $user->role);

        $profile = AgentProfile::where('user_id', $user->id)->first();
        $this->assertNotNull($profile);
        $this->assertSame('approved', $profile->status);
        $this->assertTrue((bool) $profile->is_published);
        $this->assertSame('LIC-123', $profile->license_number);

        $this->assertSame('approved', $application->fresh()->status);
        Mail::assertQueued(\App\Mail\RealtorApplicationApproved::class);
    }

    public function test_reject_requires_notes_and_does_not_create_a_user(): void
    {
        Mail::fake();
        $staff = User::factory()->create(['role' => 'staff']);
        $application = $this->application(['email' => 'reject-me@example.com']);

        $this->actingAs($staff)->postJson("/api/admin/realtor-applications/{$application->id}/reject", [])
            ->assertStatus(422);

        $response = $this->actingAs($staff)->postJson("/api/admin/realtor-applications/{$application->id}/reject", [
            'notes' => 'License could not be verified with the state board.',
        ]);

        $response->assertStatus(200);
        $this->assertSame('rejected', $application->fresh()->status);
        $this->assertDatabaseMissing('users', ['email' => 'reject-me@example.com']);
        Mail::assertQueued(\App\Mail\RealtorApplicationStatusUpdated::class);
    }

    public function test_request_more_info_allows_applicant_to_resubmit(): void
    {
        Mail::fake();
        $staff = User::factory()->create(['role' => 'staff']);
        $application = $this->application(['email' => 'resubmit@example.com']);

        $this->actingAs($staff)->postJson("/api/admin/realtor-applications/{$application->id}/request-more-info", [
            'notes' => 'Please upload a clearer copy of your license.',
        ])->assertStatus(200);

        $this->assertSame('more_info_requested', $application->fresh()->status);

        $resubmit = $this->postJson("/api/realtor-applications/{$application->reference}/resubmit", [
            'email' => 'resubmit@example.com',
            'note' => 'Uploaded a clearer copy.',
        ]);

        $resubmit->assertStatus(200);
        $this->assertSame('pending', $application->fresh()->status);
    }

    public function test_status_endpoint_is_public_and_scoped_to_reference(): void
    {
        $this->application();

        $response = $this->getJson('/api/realtor-applications/RA-TEST0001/status');

        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'pending');
    }
}
