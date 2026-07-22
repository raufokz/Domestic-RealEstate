<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'type', 'subject', 'body', 'template_id', 'status', 'scheduled_at', 'sent_at',
        'recipient_count', 'open_count', 'click_count', 'from_email', 'reply_to',
        'created_by', 'recipient_source',
    ];

    protected function casts(): array {
        return [
            'scheduled_at' => 'datetime', 'sent_at' => 'datetime',
            'recipient_count' => 'integer', 'open_count' => 'integer', 'click_count' => 'integer',
        ];
    }

    public function template() { return $this->belongsTo(EmailTemplate::class, 'template_id'); }
    public function recipients() { return $this->hasMany(CampaignRecipient::class, 'campaign_id'); }
}
