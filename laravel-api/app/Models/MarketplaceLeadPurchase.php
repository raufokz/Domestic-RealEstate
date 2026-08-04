<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarketplaceLeadPurchase extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_REFUNDED = 'refunded';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'lead_id', 'user_id', 'amount', 'status',
        'reservation_token', 'reserved_at', 'expires_at',
        'purchased_at', 'refunded_at', 'notes',
    ];

    protected function casts(): array {
        return [
            'amount' => 'decimal:2',
            'reserved_at' => 'datetime',
            'expires_at' => 'datetime',
            'purchased_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    public function lead() { return $this->belongsTo(Lead::class); }
    public function user() { return $this->belongsTo(User::class); }

    public function scopeActive($query) {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_PAID]);
    }
}
