<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyType extends Model
{
    use HasFactory;

    protected $fillable = ['category_id', 'name', 'slug', 'icon', 'is_active', 'sort_order'];
    protected function casts(): array { return ['is_active' => 'boolean', 'sort_order' => 'integer']; }
    public function properties() { return $this->hasMany(Property::class); }

    /** Parent use-class category (Residential, Commercial, ...). */
    public function category(): BelongsTo { return $this->belongsTo(PropertyCategory::class, 'category_id'); }
}
