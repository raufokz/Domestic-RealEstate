<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'role', 'location', 'content', 'rating', 'video_url',
        'image', 'type', 'featured', 'sort_order',
    ];

    protected function casts(): array { return ['featured' => 'boolean', 'sort_order' => 'integer', 'rating' => 'integer']; }

    protected static function boot() {
        parent::boot();
        static::saved(function () { cache()->forget('seo_testimonials'); });
        static::deleted(function () { cache()->forget('seo_testimonials'); });
    }
}
