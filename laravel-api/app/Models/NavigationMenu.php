<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NavigationMenu extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'label', 'url', 'target', 'position', 'group_name', 'sort_order',
        'is_active', 'children', 'icon', 'description',
    ];

    protected $casts = [
        'children' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive($query) { return $query->where('is_active', true); }
    public function scopeHeader($query) { return $query->whereIn('position', ['header', 'both']); }
    public function scopeFooter($query) { return $query->whereIn('position', ['footer', 'both']); }
    public function scopeOrdered($query) { return $query->orderBy('sort_order'); }

    protected static function boot() {
        parent::boot();
        $clearCache = function () {
            cache()->forget('nav_header_items');
            cache()->forget('nav_footer_items');
        };
        static::saved($clearCache);
        static::deleted($clearCache);
    }
}
