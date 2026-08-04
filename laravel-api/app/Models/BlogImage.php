<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class BlogImage extends Model
{
    protected $fillable = ['blog_id', 'path', 'webp_path', 'alt_text', 'caption', 'credit', 'sort_order'];

    protected $casts = ['sort_order' => 'integer'];

    protected $appends = ['url', 'webp_url'];

    public function blog(): BelongsTo { return $this->belongsTo(Blog::class); }

    protected function url(): Attribute
    {
        return Attribute::get(fn () => $this->path ? Storage::disk('public')->url($this->path) : null);
    }

    protected function webpUrl(): Attribute
    {
        return Attribute::get(fn () => $this->webp_path ? Storage::disk('public')->url($this->webp_path) : null);
    }
}
