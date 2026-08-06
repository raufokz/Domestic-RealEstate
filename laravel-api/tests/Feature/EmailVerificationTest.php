<?php

namespace Tests\Feature;

use App\Mail\VerificationEmail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_queues_a_verification_email(): void
    {
        Mail::fake();

        $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'buyer',
        ])->assertStatus(201);

        Mail::assertQueued(VerificationEmail::class, fn (VerificationEmail $mail) => $mail->hasTo('newuser@example.com'));

        $user = User::where('email', 'newuser@example.com')->first();
        $this->assertNotNull($user->email_verification_token);
        $this->assertNull($user->email_verified_at);
    }

    public function test_resend_verification_sends_a_new_link_and_token(): void
    {
        Mail::fake();

        $user = User::factory()->create(['email' => 'user@example.com', 'email_verified_at' => null]);

        $this->postJson('/api/auth/resend-verification', ['email' => 'user@example.com'])
            ->assertOk()
            ->assertJsonPath('message', fn ($msg) => str_contains((string) $msg, 'verification link'));

        Mail::assertQueued(VerificationEmail::class, fn (VerificationEmail $mail) => $mail->hasTo('user@example.com'));

        $token = $user->fresh()->email_verification_token;
        $this->assertNotNull($token);
        $this->assertStringContainsString('token=' . urlencode($token), Mail::queued(VerificationEmail::class)->first()->verifyUrl);
    }

    public function test_resend_verification_rejects_unknown_email(): void
    {
        $this->postJson('/api/auth/resend-verification', ['email' => 'nobody@example.com'])
            ->assertStatus(422);
    }

    public function test_resend_verification_reports_already_verified(): void
    {
        Mail::fake();

        User::factory()->create(['email' => 'done@example.com', 'email_verified_at' => now()]);

        $this->postJson('/api/auth/resend-verification', ['email' => 'done@example.com'])
            ->assertOk()
            ->assertJsonPath('message', fn ($msg) => str_contains((string) $msg, 'already verified'));

        Mail::assertNothingQueued();
    }

    public function test_verify_email_marks_user_verified_and_clears_token(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'email_verified_at' => null,
            'email_verification_token' => 'valid-token-abc',
            'email_verification_expires_at' => now()->addHours(1),
        ]);

        $this->postJson('/api/auth/verify-email', [
            'email' => 'user@example.com',
            'token' => 'valid-token-abc',
        ])->assertOk();

        $user->refresh();
        $this->assertNotNull($user->email_verified_at);
        $this->assertNull($user->email_verification_token);
        $this->assertNull($user->email_verification_expires_at);
    }

    public function test_verify_email_rejects_invalid_token(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'email_verified_at' => null,
            'email_verification_token' => 'valid-token-abc',
            'email_verification_expires_at' => now()->addHours(1),
        ]);

        $this->postJson('/api/auth/verify-email', [
            'email' => 'user@example.com',
            'token' => 'wrong-token',
        ])->assertStatus(422);

        $this->assertNull(User::where('email', 'user@example.com')->first()->email_verified_at);
    }

    public function test_verify_email_rejects_expired_token(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'email_verified_at' => null,
            'email_verification_token' => 'expired-token-abc',
            'email_verification_expires_at' => now()->subMinutes(5),
        ]);

        $this->postJson('/api/auth/verify-email', [
            'email' => 'user@example.com',
            'token' => 'expired-token-abc',
        ])->assertStatus(422);

        $this->assertNull(User::where('email', 'user@example.com')->first()->email_verified_at);
    }
}
