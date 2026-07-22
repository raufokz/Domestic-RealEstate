<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WebsiteTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'description', 'thumbnail', 'config', 'category',
        'is_active', 'is_premium',
    ];

    protected $casts = [
        'config' => 'array',
        'is_active' => 'boolean',
        'is_premium' => 'boolean',
    ];

    public function scopeActive($query) { return $query->where('is_active', true); }
    public function scopeByCategory($query, $category) { return $query->where('category', $category); }
}
