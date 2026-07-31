<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Integration extends Model
{
    use HasFactory;

    protected $fillable = [
        'integration_key', 'name', 'category', 'logo_url', 'status', 'credentials',
        'last_tested_at', 'last_test_result', 'last_error_message',
        'is_free_tier', 'docs_url',
    ];

    protected $casts = [
        'credentials' => 'encrypted:array',
        'last_tested_at' => 'datetime',
        'is_free_tier' => 'boolean',
    ];

    public function testLogs(): HasMany
    {
        return $this->hasMany(IntegrationTestLog::class);
    }

    public function scopeConnected($query) { return $query->where('status', 'connected'); }
    public function scopeByCategory($query, string $cat) { return $query->where('category', $cat); }
}
