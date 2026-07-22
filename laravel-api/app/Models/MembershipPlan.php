<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MembershipPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'features', 'role',
        'lead_quota', 'listing_limit', 'territory_coverage', 'priority_level', 'status',
        'price_monthly', 'price_yearly', 'is_popular', 'badge',
    ];

    protected function casts(): array {
        return [
            'features' => 'array',
            'lead_quota' => 'integer',
            'listing_limit' => 'integer',
            'priority_level' => 'integer',
            'price_monthly' => 'decimal:2',
            'price_yearly' => 'decimal:2',
            'is_popular' => 'boolean',
        ];
    }
}
