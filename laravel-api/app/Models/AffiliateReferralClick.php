<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AffiliateReferralClick extends Model
{
    use HasFactory;

    protected $fillable = [
        'affiliate_id', 'ip_hash', 'user_agent_hash', 'landing_page',
        'referrer_url', 'converted', 'converted_user_id', 'converted_at',
    ];

    protected function casts(): array {
        return ['converted' => 'boolean', 'converted_at' => 'datetime'];
    }

    public function affiliate() { return $this->belongsTo(AffiliateProfile::class, 'affiliate_id'); }
    public function convertedUser() { return $this->belongsTo(User::class, 'converted_user_id'); }
}
