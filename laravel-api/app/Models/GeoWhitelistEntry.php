<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeoWhitelistEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'value', 'is_cidr', 'note', 'country_code', 'status',
        'expires_at', 'last_used_at', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_cidr' => 'boolean',
            'expires_at' => 'datetime',
            'last_used_at' => 'datetime',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            });
    }

    protected static function boot()
    {
        parent::boot();
        static::saved(function () { cache()->forget('geo:whitelist_entries'); });
        static::deleted(function () { cache()->forget('geo:whitelist_entries'); });
    }
}
