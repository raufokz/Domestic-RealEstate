<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    use HasFactory;

    protected $fillable = ['question', 'answer', 'category', 'sort_order', 'page_type', 'page_id', 'is_active'];
    protected function casts(): array { return ['is_active' => 'boolean', 'sort_order' => 'integer', 'page_id' => 'integer']; }

    protected static function boot() {
        parent::boot();
        static::saved(function () { cache()->forget('seo_faqs'); });
        static::deleted(function () { cache()->forget('seo_faqs'); });
    }
}
