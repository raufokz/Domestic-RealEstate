<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SeoLandingPage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slug', 'title', 'status', 'scheduled_at', 'published_at',
        'hero_heading', 'hero_subtitle', 'hero_subtext', 'hero_image', 'hero_image_alt',
        'hero_video_url', 'cta_button_1_text', 'cta_button_1_url',
        'cta_button_2_text', 'cta_button_2_url',
        'realtor_name', 'realtor_title', 'realtor_photo', 'realtor_phone', 'realtor_email',
        'website', 'social_links', 'body_content', 'faqs', 'related_agents',
        'seo_title', 'meta_description', 'meta_keywords', 'focus_keyword',
        'canonical_url', 'og_title', 'og_description', 'og_image',
        'twitter_title', 'twitter_description', 'twitter_image',
        'schema_markup', 'is_featured', 'city', 'state', 'zip',
    ];

    protected function casts(): array {
        return [
            'social_links' => 'array', 'faqs' => 'array', 'related_agents' => 'array',
            'schema_markup' => 'array', 'is_featured' => 'boolean',
            'scheduled_at' => 'datetime', 'published_at' => 'datetime',
        ];
    }

    public function getRouteKeyName() { return 'slug'; }

    protected static function boot() {
        parent::boot();
        $clearCache = function ($model) {
            if ($model->slug) {
                cache()->forget('seo_landing_page_' . $model->slug);
            }
        };
        static::saved($clearCache);
        static::deleted($clearCache);
    }
}
