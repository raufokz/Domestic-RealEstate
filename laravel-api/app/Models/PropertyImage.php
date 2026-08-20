<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id', 'path', 'original_name', 'mime_type', 'size',
        'is_featured', 'sort_order',
        // Added by 2026_08_20_100000_extend_properties_for_listing_management
        'public_id', 'media_type', 'caption',
    ];

    protected function casts(): array {
        return ['is_featured' => 'boolean', 'sort_order' => 'integer', 'size' => 'integer'];
    }

    public function property() { return $this->belongsTo(Property::class); }

    protected static function boot() {
        parent::boot();
        static::saved(function () {
            cache()->forget('properties_featured');
            cache()->forget('properties_premium');
        });
        static::deleted(function () {
            cache()->forget('properties_featured');
            cache()->forget('properties_premium');
        });
    }
}
