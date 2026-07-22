<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SentEmail extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'campaign_id', 'to_email', 'from_email', 'reply_to',
        'subject', 'body', 'status', 'tracking_id', 'open_tracked',
        'click_tracked', 'sent_at', 'delivered_at', 'opened_at', 'clicked_at',
        'error_message', 'metadata',
    ];

    protected $casts = [
        'open_tracked' => 'boolean',
        'click_tracked' => 'boolean',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'opened_at' => 'datetime',
        'clicked_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function campaign(): BelongsTo { return $this->belongsTo(EmailCampaign::class, 'campaign_id'); }
}
