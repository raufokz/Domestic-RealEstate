<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug', 'title', 'content', 'status', 'is_footer_nav',
        'seo_title', 'meta_description', 'meta_keywords',
        'og_title', 'og_description', 'og_image',
    ];

    protected function casts(): array { return ['is_footer_nav' => 'boolean']; }
    public function getRouteKeyName() { return 'slug'; }

    public function sections() { return $this->hasMany(PageSection::class)->orderBy('sort_order'); }
}
