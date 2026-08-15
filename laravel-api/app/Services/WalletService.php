<?php

namespace App\Services;

use App\Models\AgentWallet;
use App\Models\CreditTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Single source of truth for every credit-wallet balance mutation. Every
 * call writes an immutable credit_transactions ledger row — the balance on
 * agent_wallets is never written to directly outside this service.
 *
 * Lock-ordering invariant: callers must already hold any `leads` row lock
 * an operation needs BEFORE calling credit()/debit() — never acquire the
 * agent_wallets lock first if a leads lock will also be needed in the same
 * transaction (mirrors the existing "never hold a row lock across a
 * network call" discipline in MarketplaceController::purchase()). Every
 * current caller (MarketplaceController's wallet-unlock branch and refund
 * extension) already locks `leads` first, so this holds today — preserve
 * it in any future caller.
 */
class WalletService
{
    public static function balance(User $user): int
    {
        return AgentWallet::where('user_id', $user->id)->value('balance_credits') ?? 0;
    }

    public static function credit(User $user, int $amount, string $reason, ?Model $reference = null): CreditTransaction
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Credit amount must be positive.');
        }

        return DB::transaction(function () use ($user, $amount, $reason, $reference) {
            $wallet = AgentWallet::firstOrCreate(['user_id' => $user->id], ['balance_credits' => 0]);
            $wallet = AgentWallet::whereKey($wallet->id)->lockForUpdate()->first();

            $newBalance = $wallet->balance_credits + $amount;
            $wallet->update(['balance_credits' => $newBalance]);

            return CreditTransaction::create([
                'user_id' => $user->id,
                'type' => CreditTransaction::TYPE_CREDIT,
                'amount' => $amount,
                'balance_after' => $newBalance,
                'reason' => $reason,
                'reference_type' => $reference?->getMorphClass(),
                'reference_id' => $reference?->getKey(),
                'created_at' => now(),
            ]);
        });
    }

    /**
     * @throws InsufficientCreditsException
     */
    public static function debit(User $user, int $amount, string $reason, ?Model $reference = null): CreditTransaction
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Debit amount must be positive.');
        }

        return DB::transaction(function () use ($user, $amount, $reason, $reference) {
            $wallet = AgentWallet::firstOrCreate(['user_id' => $user->id], ['balance_credits' => 0]);
            $wallet = AgentWallet::whereKey($wallet->id)->lockForUpdate()->first();

            if ($wallet->balance_credits < $amount) {
                throw new InsufficientCreditsException($wallet->balance_credits, $amount);
            }

            $newBalance = $wallet->balance_credits - $amount;
            $wallet->update(['balance_credits' => $newBalance]);

            return CreditTransaction::create([
                'user_id' => $user->id,
                'type' => CreditTransaction::TYPE_DEBIT,
                'amount' => $amount,
                'balance_after' => $newBalance,
                'reason' => $reason,
                'reference_type' => $reference?->getMorphClass(),
                'reference_id' => $reference?->getKey(),
                'created_at' => now(),
            ]);
        });
    }
}

class InsufficientCreditsException extends \RuntimeException
{
    public function __construct(public readonly int $available, public readonly int $requested)
    {
        parent::__construct("Insufficient credits: has {$available}, needs {$requested}.");
    }
}
