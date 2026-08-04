<?php
namespace App\Models;

use App\Traits\HasAdminActivityLog;
use App\Traits\HasRevisions;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Blog extends Model
{
    use HasFactory, SoftDeletes, HasAdminActivityLog, HasRevisions;

    protected $fillable = [
        'slug', 'title', 'excerpt', 'content', 'featured_image',
        'featured_image_alt', 'featured_image_caption', 'featured_image_credit',
        'category_id', 'author_id', 'co_author_id', 'status', 'published_at', 'scheduled_at',
        'seo_title', 'meta_description', 'reading_time', 'word_count', 'tags',
        'is_featured', 'is_trending', 'is_popular', 'is_editors_choice',
        'view_count', 'like_count', 'share_count',
        'focus_keyword', 'secondary_keywords', 'canonical_url', 'robots_index',
        'og_title', 'og_description', 'og_image',
        'twitter_title', 'twitter_description', 'twitter_image',
        'json_ld_override', 'faq_schema', 'breadcrumb_title',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'secondary_keywords' => 'array',
            'faq_schema' => 'array',
            'published_at' => 'datetime',
            'scheduled_at' => 'datetime',
            'reading_time' => 'integer',
            'word_count' => 'integer',
            'view_count' => 'integer',
            'like_count' => 'integer',
            'share_count' => 'integer',
            'is_featured' => 'boolean',
            'is_trending' => 'boolean',
            'is_popular' => 'boolean',
            'is_editors_choice' => 'boolean',
            'robots_index' => 'boolean',
        ];
    }

    /** Fields excluded from revision snapshots on top of HasRevisions' defaults. */
    protected array $revisionExclude = [];

    public function category(): BelongsTo { return $this->belongsTo(BlogCategory::class, 'category_id'); }

    /** Secondary categories, in addition to the primary `category()`. */
    public function categories(): BelongsToMany { return $this->belongsToMany(BlogCategory::class, 'blog_category', 'blog_id', 'category_id'); }

    public function author(): BelongsTo { return $this->belongsTo(User::class, 'author_id'); }
    public function coAuthor(): BelongsTo { return $this->belongsTo(User::class, 'co_author_id'); }

    public function images(): HasMany { return $this->hasMany(BlogImage::class)->orderBy('sort_order'); }

    public function getRouteKeyName() { return 'slug'; }
}
