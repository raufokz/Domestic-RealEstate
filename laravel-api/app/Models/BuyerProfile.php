<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BuyerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'min_budget', 'max_budget', 'min_beds', 'max_beds', 'min_baths',
        'property_type_pref', 'preferred_cities', 'preferred_states',
        'preferred_neighborhoods', 'must_have_features', 'deal_breakers',
        'timeline', 'pre_approved', 'pre_approval_amount', 'notes',
    ];

    protected function casts(): array {
        return [
            'min_budget' => 'decimal:2', 'max_budget' => 'decimal:2',
            'pre_approval_amount' => 'decimal:2',
            'preferred_cities' => 'array', 'preferred_states' => 'array',
            'preferred_neighborhoods' => 'array', 'must_have_features' => 'array',
            'deal_breakers' => 'array', 'pre_approved' => 'boolean',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
}
