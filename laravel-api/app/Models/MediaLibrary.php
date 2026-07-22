<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MediaLibrary extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'media_library';
    protected $fillable = [
        'name', 'file_name', 'mime_type', 'size', 'path', 'disk',
        'collection', 'meta', 'uploaded_by',
    ];

    protected $casts = [
        'meta' => 'array',
        'size' => 'integer',
    ];

    public function uploader(): BelongsTo { return $this->belongsTo(User::class, 'uploaded_by'); }
    public function scopeByCollection($query, $collection) { return $query->where('collection', $collection); }
    public function scopeByMimeType($query, $mimeType) { return $query->where('mime_type', $mimeType); }
}
