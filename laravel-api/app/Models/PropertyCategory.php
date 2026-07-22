<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class PropertyCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'icon', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'sort_order' => 'integer'];
    }

    public function propertyTypes(): HasMany
    {
        return $this->hasMany(PropertyType::class, 'category_id');
    }

    /** Properties reachable through this category's types. */
    public function properties(): HasManyThrough
    {
        return $this->hasManyThrough(
            Property::class,
            PropertyType::class,
            'category_id',        // FK on property_types
            'property_type_id',   // FK on properties
            'id',
            'id'
        );
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
