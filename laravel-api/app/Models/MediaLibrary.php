<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class MediaLibrary extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'media_library';
    protected $fillable = [
        'name', 'file_name', 'mime_type', 'size', 'path', 'webp_path',
        'width', 'height', 'disk', 'collection', 'meta', 'uploaded_by',
    ];

    protected $casts = [
        'meta' => 'array',
        'size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
    ];

    protected $appends = ['url', 'webp_url'];

    public function uploader(): BelongsTo { return $this->belongsTo(User::class, 'uploaded_by'); }
    public function scopeByCollection($query, $collection) { return $query->where('collection', $collection); }
    public function scopeByMimeType($query, $mimeType) { return $query->where('mime_type', $mimeType); }

    protected function url(): Attribute
    {
        return Attribute::get(fn () => $this->path ? Storage::disk($this->disk)->url($this->path) : null);
    }

    protected function webpUrl(): Attribute
    {
        return Attribute::get(fn () => $this->webp_path ? Storage::disk($this->disk)->url($this->webp_path) : null);
    }
}
