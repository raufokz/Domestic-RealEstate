<?php

namespace Tests\Feature;

use App\Models\AgentWallet;
use App\Models\CreditOrder;
use App\Models\CreditTransaction;
use App\Models\Lead;
use App\Models\LeadPackage;
use App\Models\MarketplaceLeadPurchase;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletTest extends TestCase
{
    use RefreshDatabase;

    public function test_wallet_credit_and_debit_write_a_correct_ledger(): void
    {
        $user = User::factory()->create();

        $this->assertSame(0, WalletService::balance($user));

        WalletService::credit($user, 100, 'test_credit');
        $this->assertSame(100, WalletService::balance($user));
        $this->assertDatabaseHas('credit_transactions', [
            'user_id' => $user->id, 'type' => 'credit', 'amount' => 100, 'balance_after' => 100,
        ]);

        WalletService::debit($user, 40, 'test_debit');
        $this->assertSame(60, WalletService::balance($user));
        $this->assertDatabaseHas('credit_transactions', [
            'user_id' => $user->id, 'type' => 'debit', 'amount' => 40, 'balance_after' => 60,
        ]);
    }

    public function test_debit_throws_and_balance_never_goes_negative(): void
    {
        $user = User::factory()->create();
        WalletService::credit($user, 10, 'seed');

        $this->expectException(\App\Services\InsufficientCreditsException::class);
        try {
            WalletService::debit($user, 999, 'overspend');
        } finally {
            $this->assertSame(10, WalletService::balance($user));
        }
    }

    public function test_bank_transfer_topup_only_credits_after_admin_confirms(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $pack = LeadPackage::create(['name' => 'Starter Pack', 'slug' => 'starter-pack-wallet', 'lead_count' => 50, 'price' => 45, 'is_active' => true]);

        $res = $this->actingAs($user)->postJson('/api/wallet/topup', [
            'lead_package_id' => $pack->id,
            'payment_method' => 'bank_transfer',
        ]);
        $res->assertStatus(200)->assertJson(['data' => ['status' => 'awaiting_confirmation']]);

        // Not spendable yet.
        $this->assertSame(0, WalletService::balance($user));
        $order = CreditOrder::where('user_id', $user->id)->first();
        $this->assertSame(CreditOrder::STATUS_PENDING, $order->status);

        $this->actingAs($admin)->postJson("/api/admin/wallet/topups/{$order->id}/confirm")
            ->assertStatus(200);

        $this->assertSame(50, WalletService::balance($user));
        $this->assertDatabaseHas('credit_orders', ['id' => $order->id, 'status' => 'confirmed']);
    }

    public function test_rejected_topup_never_adds_credits(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $pack = LeadPackage::create(['name' => 'Growth Pack', 'slug' => 'growth-pack-wallet', 'lead_count' => 120, 'price' => 100, 'is_active' => true]);

        $this->actingAs($user)->postJson('/api/wallet/topup', [
            'lead_package_id' => $pack->id,
            'payment_method' => 'bank_transfer',
        ])->assertStatus(200);

        $order = CreditOrder::where('user_id', $user->id)->first();
        $this->actingAs($admin)->postJson("/api/admin/wallet/topups/{$order->id}/reject", ['notes' => 'no funds received'])
            ->assertStatus(200);

        $this->assertSame(0, WalletService::balance($user));
        $this->assertDatabaseHas('credit_orders', ['id' => $order->id, 'status' => 'rejected']);
    }

    public function test_wallet_unlocks_a_lead_instantly_and_debits_correct_amount(): void
    {
        $user = User::factory()->create(['ppl_eligible' => true, 'ppl_access_enabled' => true]);
        WalletService::credit($user, 100, 'seed');

        $lead = Lead::create([
            'first_name' => 'Wallet', 'last_name' => 'Buyer', 'email' => 'walletbuyer@example.com', 'phone' => '555-1000',
            'marketplace_status' => 'available', 'marketplace_title' => 'Wallet Test Lead', 'marketplace_price' => 30.00, 'listed_at' => now(),
        ]);

        $reserveRes = $this->actingAs($user)->postJson("/api/marketplace/leads/{$lead->id}/reserve");
        $reserveRes->assertStatus(200);
        $token = $reserveRes->json('token');

        $purchaseRes = $this->actingAs($user)->postJson("/api/marketplace/leads/{$lead->id}/purchase", [
            'token' => $token,
            'payment_method' => 'wallet',
        ]);

        $purchaseRes->assertStatus(200)->assertJson(['data' => ['status' => 'purchased']]);

        // Instant unlock — no webhook needed.
        $this->assertDatabaseHas('leads', ['id' => $lead->id, 'marketplace_status' => 'sold', 'sold_to' => $user->id]);
        $this->assertSame(70, WalletService::balance($user));
        $this->assertDatabaseHas('marketplace_lead_purchases', ['lead_id' => $lead->id, 'status' => 'paid', 'payment_gateway' => 'wallet']);

        $this->actingAs($user)->getJson("/api/marketplace/leads/{$lead->id}/details")
            ->assertStatus(200)
            ->assertJson(['email' => 'walletbuyer@example.com', 'phone' => '555-1000']);
    }

    public function test_insufficient_credits_returns_clean_402_and_does_not_touch_lead_or_balance(): void
    {
        $user = User::factory()->create(['ppl_eligible' => true, 'ppl_access_enabled' => true]);
        WalletService::credit($user, 5, 'seed'); // not enough for a $30 lead

        $lead = Lead::create([
            'first_name' => 'Poor', 'email' => 'poor@example.com',
            'marketplace_status' => 'available', 'marketplace_price' => 30.00, 'listed_at' => now(),
        ]);

        $token = $this->actingAs($user)->postJson("/api/marketplace/leads/{$lead->id}/reserve")->json('token');

        $res = $this->actingAs($user)->postJson("/api/marketplace/leads/{$lead->id}/purchase", [
            'token' => $token,
            'payment_method' => 'wallet',
        ]);

        $res->assertStatus(402)->assertJson(['code' => 'insufficient_credits']);
        $this->assertSame(5, WalletService::balance($user));
        // Reservation is untouched (not marked sold) — the agent can still pay another way.
        $this->assertDatabaseHas('leads', ['id' => $lead->id, 'marketplace_status' => 'reserved']);
    }

    /**
     * Race-condition END STATE test: simulates two wallet-unlock attempts on
     * the SAME lead by preparing state as if the first request already won
     * (matches the existing test_user_cannot_reserve_already_reserved_lead
     * convention in MarketplaceTest.php — sequential simulation of the
     * guard, not literal OS-level simultaneity, which Windows PHP's lack of
     * pcntl makes impractical to test in-process).
     */
    public function test_second_wallet_purchase_attempt_on_already_sold_lead_fails_cleanly_no_double_debit(): void
    {
        $user = User::factory()->create(['ppl_eligible' => true, 'ppl_access_enabled' => true]);
        WalletService::credit($user, 100, 'seed');

        $lead = Lead::create([
            'first_name' => 'Race', 'email' => 'race@example.com',
            'marketplace_status' => 'available', 'marketplace_price' => 20.00, 'listed_at' => now(),
        ]);

        $token = $this->actingAs($user)->postJson("/api/marketplace/leads/{$lead->id}/reserve")->json('token');

        $first = $this->actingAs($user)->postJson("/api/marketplace/leads/{$lead->id}/purchase", ['token' => $token, 'payment_method' => 'wallet']);
        $first->assertStatus(200);
        $this->assertSame(80, WalletService::balance($user));

        // A retried/duplicate second attempt with the same (now-stale) token must not double-charge.
        $second = $this->actingAs($user)->postJson("/api/marketplace/leads/{$lead->id}/purchase", ['token' => $token, 'payment_method' => 'wallet']);
        $second->assertStatus(422); // "reservation no longer valid" — purchase record is no longer pending

        $this->assertSame(80, WalletService::balance($user)); // NOT double-debited
    }

    public function test_one_wallet_two_different_leads_only_one_unlock_succeeds(): void
    {
        $user = User::factory()->create(['ppl_eligible' => true, 'ppl_access_enabled' => true]);
        WalletService::credit($user, 25, 'seed'); // enough for exactly one $25 lead

        $leadA = Lead::create(['first_name' => 'A', 'email' => 'a@example.com', 'marketplace_status' => 'available', 'marketplace_price' => 25.00, 'listed_at' => now()]);
        $leadB = Lead::create(['first_name' => 'B', 'email' => 'b@example.com', 'marketplace_status' => 'available', 'marketplace_price' => 25.00, 'listed_at' => now()]);

        $tokenA = $this->actingAs($user)->postJson("/api/marketplace/leads/{$leadA->id}/reserve")->json('token');
        $tokenB = $this->actingAs($user)->postJson("/api/marketplace/leads/{$leadB->id}/reserve")->json('token');

        $resA = $this->actingAs($user)->postJson("/api/marketplace/leads/{$leadA->id}/purchase", ['token' => $tokenA, 'payment_method' => 'wallet']);
        $resB = $this->actingAs($user)->postJson("/api/marketplace/leads/{$leadB->id}/purchase", ['token' => $tokenB, 'payment_method' => 'wallet']);

        $statuses = collect([$resA->status(), $resB->status()])->sort()->values();
        $this->assertSame([200, 402], $statuses->all());

        // Exactly one lead sold, wallet decremented exactly once.
        $soldCount = Lead::whereIn('id', [$leadA->id, $leadB->id])->where('marketplace_status', 'sold')->count();
        $this->assertSame(1, $soldCount);
        $this->assertSame(0, WalletService::balance($user));
    }

    public function test_wallet_purchase_refund_returns_credits_not_cash(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['ppl_eligible' => true, 'ppl_access_enabled' => true]);
        WalletService::credit($user, 50, 'seed');

        $lead = Lead::create(['first_name' => 'Ref', 'email' => 'ref@example.com', 'marketplace_status' => 'available', 'marketplace_price' => 20.00, 'listed_at' => now()]);
        $token = $this->actingAs($user)->postJson("/api/marketplace/leads/{$lead->id}/reserve")->json('token');
        $this->actingAs($user)->postJson("/api/marketplace/leads/{$lead->id}/purchase", ['token' => $token, 'payment_method' => 'wallet'])->assertStatus(200);

        $this->assertSame(30, WalletService::balance($user));

        $purchase = MarketplaceLeadPurchase::where('lead_id', $lead->id)->first();
        $this->actingAs($admin)->postJson("/api/admin/marketplace/purchases/{$purchase->id}/refund", ['notes' => 'bad lead'])
            ->assertStatus(200);

        $this->assertSame(50, WalletService::balance($user)); // credits returned
        $this->assertDatabaseHas('leads', ['id' => $lead->id, 'marketplace_status' => 'available']);
    }
}
