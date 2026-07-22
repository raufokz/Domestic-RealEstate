<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceSeoPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug', 'title', 'heading', 'body', 'image', 'sections', 'faqs',
        'cta_label', 'cta_url', 'status', 'seo_title', 'meta_description',
        'meta_keywords', 'canonical_url', 'og_title', 'og_description', 'og_image',
        'twitter_title', 'twitter_description', 'twitter_image', 'schema_markup',
    ];

    protected function casts(): array {
        return ['sections' => 'array', 'faqs' => 'array', 'schema_markup' => 'array'];
    }
    public function getRouteKeyName() { return 'slug'; }
}
