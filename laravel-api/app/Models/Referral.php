<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Referral extends Model
{
    use HasFactory;

    protected $fillable = [
        'referrer_id', 'referred_id', 'code', 'commission', 'status', 'paid_at',
        'deal_id', 'fee_type', 'fee_value', 'closing_date', 'payment_status',
    ];

    protected function casts(): array {
        return [
            'commission' => 'decimal:2',
            'fee_value' => 'decimal:2',
            'paid_at' => 'datetime',
            'closing_date' => 'date',
        ];
    }

    public function referrer() { return $this->belongsTo(User::class, 'referrer_id'); }
    public function referred() { return $this->belongsTo(User::class, 'referred_id'); }
    public function deal() { return $this->belongsTo(Deal::class); }
}
