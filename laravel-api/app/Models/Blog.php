<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Blog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slug', 'title', 'excerpt', 'content', 'featured_image',
        'category_id', 'author_id', 'status', 'published_at',
        'seo_title', 'meta_description', 'reading_time', 'tags',
    ];

    protected function casts(): array {
        return ['tags' => 'array', 'published_at' => 'datetime', 'reading_time' => 'integer'];
    }

    public function category() { return $this->belongsTo(BlogCategory::class, 'category_id'); }
    public function author() { return $this->belongsTo(User::class, 'author_id'); }
    public function getRouteKeyName() { return 'slug'; }
}
