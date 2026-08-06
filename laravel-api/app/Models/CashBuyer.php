<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CashBuyer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'wholesaler_id', 'name', 'email', 'phone', 'budget_min', 'budget_max',
        'preferred_areas', 'property_types', 'criteria', 'deals_closed',
        'last_active_at', 'source',
    ];

    protected function casts(): array {
        return [
            'budget_min' => 'decimal:2',
            'budget_max' => 'decimal:2',
            'preferred_areas' => 'array',
            'property_types' => 'array',
            'deals_closed' => 'integer',
            'last_active_at' => 'datetime',
        ];
    }

    public function wholesaler() { return $this->belongsTo(User::class, 'wholesaler_id'); }
}
