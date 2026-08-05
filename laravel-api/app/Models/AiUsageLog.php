<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiUsageLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider', 'model', 'agent_key', 'user_id', 'input_tokens', 'output_tokens', 'cost_estimate', 'prompt_preview', 'status',
    ];

    protected function casts(): array
    {
        return [
            'input_tokens' => 'integer',
            'output_tokens' => 'integer',
            'cost_estimate' => 'decimal:6',
        ];
    }

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
