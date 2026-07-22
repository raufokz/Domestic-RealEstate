<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Website extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'slug', 'template', 'theme_config', 'status',
        'subdomain', 'self_editing_enabled', 'analytics_config', 'deployed_at',
    ];

    protected $casts = [
        'theme_config' => 'array',
        'analytics_config' => 'array',
        'self_editing_enabled' => 'boolean',
        'deployed_at' => 'datetime',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function pages(): HasMany { return $this->hasMany(WebsitePage::class); }
    public function domains(): HasMany { return $this->hasMany(WebsiteDomain::class); }
    public function scopeLive($query) { return $query->where('status', 'live'); }
}
