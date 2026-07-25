<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'property_address', 'property_city', 'property_state',
        'property_zip', 'estimated_value', 'asking_price', 'beds', 'baths',
        'sqft', 'year_built', 'property_condition', 'timeline', 'has_tenants', 'notes',
    ];

    protected function casts(): array {
        return [
            'estimated_value' => 'decimal:2', 'asking_price' => 'decimal:2',
            'has_tenants' => 'boolean',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
}
