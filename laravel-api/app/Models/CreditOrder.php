<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreditOrder extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'user_id', 'lead_package_id', 'credits', 'amount_paid', 'status',
        'payment_gateway', 'gateway_checkout_id', 'gateway_checkout_url',
        'confirmed_at', 'confirmed_by', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'credits' => 'integer',
            'amount_paid' => 'decimal:2',
            'confirmed_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function leadPackage()
    {
        return $this->belongsTo(LeadPackage::class);
    }

    public function confirmedBy()
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
}
