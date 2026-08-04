<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarketplacePaymentLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_id',
        'lead_id',
        'user_id',
        'payment_gateway',
        'gateway_transaction_id',
        'amount',
        'currency',
        'status',
        'payload',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'payload' => 'array',
        ];
    }

    public function purchase()
    {
        return $this->belongsTo(MarketplaceLeadPurchase::class, 'purchase_id');
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
