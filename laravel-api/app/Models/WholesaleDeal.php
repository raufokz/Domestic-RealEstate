<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class WholesaleDeal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'deal_number', 'wholesaler_id', 'title', 'address', 'city', 'state', 'zip',
        'property_type', 'bedrooms', 'bathrooms', 'sqft', 'year_built',
        'asking_price', 'arv', 'repair_estimate', 'assignment_fee', 'monthly_rent_estimate',
        'deal_source', 'condition', 'description', 'repair_details', 'photos',
        'status', 'assigned_buyer_id', 'approval_status',
    ];

    protected function casts(): array {
        return [
            'bathrooms' => 'decimal:1',
            'asking_price' => 'decimal:2',
            'arv' => 'decimal:2',
            'repair_estimate' => 'decimal:2',
            'assignment_fee' => 'decimal:2',
            'monthly_rent_estimate' => 'decimal:2',
            'photos' => 'array',
            'bedrooms' => 'integer',
            'sqft' => 'integer',
            'year_built' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (WholesaleDeal $deal) {
            if (!$deal->deal_number) {
                $deal->deal_number = 'WD-' . strtoupper(Str::random(8));
            }
        });
    }

    public function wholesaler() { return $this->belongsTo(User::class, 'wholesaler_id'); }
    public function assignedBuyer() { return $this->belongsTo(CashBuyer::class, 'assigned_buyer_id'); }
}
