<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractSigner extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_id', 'name', 'email', 'role', 'signature_base64',
        'signed_at', 'signed_ip', 'signed_user_agent', 'sort_order', 'status',
    ];

    protected function casts(): array
    {
        return ['signed_at' => 'datetime'];
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }
}
