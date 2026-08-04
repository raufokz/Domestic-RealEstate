<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchasedLead extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'lead_id', 'package_id', 'amount', 'purchased_at',
        'commission_amount', 'payout_method', 'payout_email', 'payout_status',
        'closing_date', 'claimed_at',
    ];

    protected function casts(): array {
        return [
            'amount' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'purchased_at' => 'datetime',
            'closing_date' => 'date',
            'claimed_at' => 'datetime',
        ];
    }
    public function user() { return $this->belongsTo(User::class); }
    public function lead() { return $this->belongsTo(Lead::class); }
    public function package() { return $this->belongsTo(LeadPackage::class, 'package_id'); }
}
