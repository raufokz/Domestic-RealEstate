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
    ];

    protected function casts(): array {
        return ['is_featured' => 'boolean', 'sort_order' => 'integer', 'size' => 'integer'];
    }

    public function property() { return $this->belongsTo(Property::class); }
}
