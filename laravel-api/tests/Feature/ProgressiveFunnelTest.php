<?php

namespace Tests\Feature;

use App\Models\Lead;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgressiveFunnelTest extends TestCase
{
    use RefreshDatabase;

    private function checkpointPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Jane Buyer',
            'phone' => '555-123-4567',
            'email' => 'jane@example.com',
            'location' => 'Austin, TX',
            'timeline' => 'asap',
            'consent_text' => 'By continuing, you agree that a licensed real estate professional may contact you.',
            'consent_version' => 'v1',
        ], $overrides);
    }

    public function test_checkpoint_creates_a_real_partial_lead_before_final_submit(): void
    {
        $res = $this->postJson('/api/funnel/buy/checkpoint', $this->checkpointPayload());

        $res->assertStatus(201)->assertJsonStructure(['data' => ['token']]);

        $this->assertDatabaseHas('leads', [
            'normalized_email' => 'jane@example.com',
            'source_intent' => 'buy',
            'funnel_completed_at' => null,
        ]);

        $lead = Lead::where('normalized_email', 'jane@example.com')->first();
        $this->assertTrue((bool) $lead->consent_given);
        $this->assertNotNull($lead->consent_given_at);
        $this->assertSame('v1', $lead->consent_version);
        $this->assertSame('none', $lead->marketplace_status); // never auto-published
    }

    public function test_completing_the_funnel_patches_the_same_lead_not_a_duplicate(): void
    {
        $checkpoint = $this->postJson('/api/funnel/buy/checkpoint', $this->checkpointPayload());
        $token = $checkpoint->json('data.token');

        $this->assertSame(1, Lead::where('normalized_email', 'jane@example.com')->count());

        $complete = $this->postJson('/api/funnel/buy/complete', [
            'token' => $token,
            'budget_min' => 400000,
            'budget_max' => 550000,
            'property_type' => 'single-family',
            'pre_approved' => true,
        ]);

        $complete->assertStatus(200)->assertJsonStructure(['data' => ['lead_id', 'quality_tier']]);

        // Still exactly one lead — the final submit patched the checkpoint
        // row, it did not create a second one.
        $this->assertSame(1, Lead::where('normalized_email', 'jane@example.com')->count());

        $lead = Lead::where('normalized_email', 'jane@example.com')->first();
        $this->assertNotNull($lead->funnel_completed_at);
        $this->assertEquals(400000, $lead->budget_min);
        $this->assertSame('high_intent', $lead->quality_tier); // asap timeline + completed
    }

    public function test_abandoning_after_checkpoint_leaves_a_real_nurture_lead(): void
    {
        $this->postJson('/api/funnel/sell/checkpoint', $this->checkpointPayload(['email' => 'abandoner@example.com', 'timeline' => 'not-sure']));

        $lead = Lead::where('normalized_email', 'abandoner@example.com')->first();
        $this->assertNotNull($lead);
        $this->assertNull($lead->funnel_completed_at);
        // Quality tier isn't assigned until complete() runs — but the lead
        // itself is real, sellable-later data, which is the whole point.
        $this->assertNull($lead->quality_tier);
    }

    public function test_a_stranger_cannot_hijack_someone_elses_lead_via_email_phone_guessing(): void
    {
        // Victim goes through the real funnel.
        $victimCheckpoint = $this->postJson('/api/funnel/buy/checkpoint', $this->checkpointPayload([
            'name' => 'Real Victim', 'phone' => '555-999-0000', 'email' => 'victim@example.com',
        ]));
        $victimCheckpoint->assertStatus(201);

        // Attacker knows the victim's phone/email and tries to "complete"
        // the funnel on their behalf with a forged token guess AND by
        // simply omitting/forging the token — must NOT merge into the
        // victim's row or stamp a fake consent onto it.
        $forged = $this->postJson('/api/funnel/buy/complete', [
            'token' => 'not-a-real-token.fake-signature',
            'phone' => '555-999-0000',
            'email' => 'victim@example.com',
            'budget_min' => 1,
            'budget_max' => 2,
        ]);

        $forged->assertStatus(200); // treated as a standalone new submission, not an error

        // The victim's original checkpoint lead must be untouched.
        $victim = Lead::where('normalized_email', 'victim@example.com')->where('phone', '555-999-0000')->first();
        $this->assertNull($victim->funnel_completed_at);
        $this->assertNull($victim->budget_min);

        // A second, separate lead was created by the forged request instead
        // of silently merging into the victim's record.
        $this->assertSame(2, Lead::where('normalized_phone', '5559990000')->count());
    }

    public function test_expired_checkpoint_token_is_rejected_not_merged(): void
    {
        $checkpoint = $this->postJson('/api/funnel/sell/checkpoint', $this->checkpointPayload(['email' => 'expiring@example.com']));
        $token = $checkpoint->json('data.token');

        // Forge an expired token with the same structure but a past expiry —
        // simulates what a stolen/replayed old token would look like.
        [$encoded, ] = explode('.', $token, 2);
        $payload = base64_decode($encoded);
        [$leadId, $intent] = explode('|', $payload, 3);
        $expiredPayload = "{$leadId}|{$intent}|" . (now()->subDay()->timestamp);
        $expiredToken = base64_encode($expiredPayload) . '.' . hash_hmac('sha256', $expiredPayload, config('app.key'));

        $res = $this->postJson('/api/funnel/sell/complete', ['token' => $expiredToken, 'condition' => 'move-in-ready']);
        $res->assertStatus(200);

        $original = Lead::where('normalized_email', 'expiring@example.com')->first();
        $this->assertNull($original->funnel_completed_at); // untouched by the expired-token request
    }

    public function test_same_contact_same_intent_within_30_days_reuses_the_original_lead(): void
    {
        // checkpoint()'s own dedup (before quality tiering even runs)
        // already satisfies "same person + same intent = one lead, not
        // two" — verify no duplicate row gets created in the first place.
        $first = $this->postJson('/api/funnel/invest/checkpoint', $this->checkpointPayload(['email' => 'investor@example.com', 'timeline' => 'rental-income']));
        $this->postJson('/api/funnel/invest/complete', ['token' => $first->json('data.token'), 'budget_min' => 100000])->assertStatus(200);

        $second = $this->postJson('/api/funnel/invest/checkpoint', $this->checkpointPayload(['email' => 'investor@example.com', 'timeline' => 'fix-and-flip']));
        $this->postJson('/api/funnel/invest/complete', ['token' => $second->json('data.token'), 'budget_min' => 200000])->assertStatus(200);

        $this->assertSame(1, Lead::where('normalized_email', 'investor@example.com')->count());
    }

    public function test_duplicate_is_tagged_when_the_original_lead_already_entered_the_marketplace_pipeline(): void
    {
        $first = $this->postJson('/api/funnel/invest/checkpoint', $this->checkpointPayload(['email' => 'listed-investor@example.com', 'timeline' => 'rental-income']));
        $this->postJson('/api/funnel/invest/complete', ['token' => $first->json('data.token'), 'budget_min' => 100000])->assertStatus(200);

        // Simulate an admin having already listed the first lead for sale —
        // checkpoint() must not silently mutate a row that's entered the
        // paid pipeline, so a second submission creates a fresh lead...
        Lead::where('normalized_email', 'listed-investor@example.com')->update(['marketplace_status' => 'available']);

        $second = $this->postJson('/api/funnel/invest/checkpoint', $this->checkpointPayload(['email' => 'listed-investor@example.com', 'timeline' => 'fix-and-flip']));
        $secondComplete = $this->postJson('/api/funnel/invest/complete', ['token' => $second->json('data.token'), 'budget_min' => 200000]);

        // ...and that fresh lead correctly gets tagged as a duplicate for
        // admin review, rather than silently entering the marketplace as if
        // it were a brand-new, unrelated contact.
        $secondComplete->assertStatus(200)->assertJson(['data' => ['quality_tier' => 'duplicate']]);
        $this->assertSame(2, Lead::where('normalized_email', 'listed-investor@example.com')->count());
    }
}
