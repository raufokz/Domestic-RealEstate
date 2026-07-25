<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebsiteDomain extends Model
{
    use HasFactory;

    protected $fillable = [
        'website_id', 'domain', 'type', 'status', 'dns_records',
        'verified_at', 'ssl_issued_at', 'last_error_message',
    ];

    protected $casts = [
        'dns_records' => 'array',
        'verified_at' => 'datetime',
        'ssl_issued_at' => 'datetime',
    ];

    public function website(): BelongsTo { return $this->belongsTo(Website::class); }
}
