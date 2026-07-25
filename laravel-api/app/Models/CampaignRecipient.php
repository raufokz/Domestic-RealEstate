<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampaignRecipient extends Model
{
    use HasFactory;

    protected $fillable = ['campaign_id', 'contact_id', 'email', 'status', 'sent_at', 'opened_at', 'clicked_at'];
    protected function casts(): array {
        return ['sent_at' => 'datetime', 'opened_at' => 'datetime', 'clicked_at' => 'datetime'];
    }
    public function campaign() { return $this->belongsTo(EmailCampaign::class, 'campaign_id'); }
    public function contact() { return $this->belongsTo(Contact::class); }
}
