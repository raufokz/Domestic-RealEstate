<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebsitePage extends Model
{
    use HasFactory;

    protected $fillable = [
        'website_id', 'title', 'slug', 'content', 'sections', 'seo_config',
        'sort_order', 'is_published',
    ];

    protected $casts = [
        'sections' => 'array',
        'seo_config' => 'array',
        'is_published' => 'boolean',
    ];

    public function website(): BelongsTo { return $this->belongsTo(Website::class); }
}
