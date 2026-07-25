<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AffiliateProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'unique_code', 'total_clicks', 'total_conversions',
        'total_earnings', 'pending_payout', 'status',
    ];

    protected function casts(): array {
        return [
            'total_clicks' => 'integer', 'total_conversions' => 'integer',
            'total_earnings' => 'decimal:2', 'pending_payout' => 'decimal:2',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function clicks() { return $this->hasMany(AffiliateReferralClick::class, 'affiliate_id'); }

    public static function generateCode(): string {
        do { $code = strtoupper(Str::random(8)); } while (static::where('unique_code', $code)->exists());
        return $code;
    }
}
