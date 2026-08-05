<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractActivityLog extends Model
{
    use HasFactory;

    protected $fillable = ['contract_id', 'user_id', 'action', 'ip_address', 'user_agent'];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function log(int $contractId, string $action): void
    {
        static::create([
            'contract_id' => $contractId,
            'user_id' => auth()->id(),
            'action' => $action,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);
    }
}
