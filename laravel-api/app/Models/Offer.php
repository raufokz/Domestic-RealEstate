<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Offer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'offer_number', 'property_id', 'buyer_id', 'amount', 'current_amount',
        'financing_type', 'contingencies', 'closing_date', 'expiration_date',
        'message', 'counter_message', 'status', 'last_action_by', 'responded_at', 'created_by',
    ];

    protected function casts(): array {
        return [
            'amount' => 'decimal:2',
            'current_amount' => 'decimal:2',
            'contingencies' => 'array',
            'closing_date' => 'date',
            'expiration_date' => 'datetime',
            'responded_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Offer $offer) {
            if (!$offer->offer_number) {
                $offer->offer_number = 'OFR-' . strtoupper(Str::random(8));
            }
        });
    }

    public function property() { return $this->belongsTo(Property::class); }
    public function buyer() { return $this->belongsTo(User::class, 'buyer_id'); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
