<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SocialPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'content', 'media', 'link_url', 'target_accounts',
        'status', 'scheduled_at', 'published_at', 'ai_generated',
        'source_type', 'source_id', 'created_by',
    ];

    protected $casts = [
        'media' => 'array',
        'target_accounts' => 'array',
        'ai_generated' => 'boolean',
        'scheduled_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function results(): HasMany
    {
        return $this->hasMany(SocialPostResult::class);
    }

    public function scopeDraft($query) { return $query->where('status', 'draft'); }
    public function scopeScheduled($query) { return $query->where('status', 'scheduled'); }
    public function scopePublished($query) { return $query->where('status', 'published'); }
    public function scopeFailed($query) { return $query->where('status', 'failed'); }
}
