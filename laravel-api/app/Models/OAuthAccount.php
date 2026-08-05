<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OAuthAccount extends Model
{
    use HasFactory;

    protected $table = 'oauth_accounts';

    protected $fillable = ['user_id', 'provider', 'provider_id', 'access_token'];

    protected $casts = [
        'access_token' => 'encrypted',
    ];

    public function user() { return $this->belongsTo(User::class); }
}
