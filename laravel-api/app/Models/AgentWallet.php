<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentWallet extends Model
{
    protected $fillable = ['user_id', 'balance_credits'];

    protected function casts(): array
    {
        return ['balance_credits' => 'integer'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
