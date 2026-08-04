<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentProfileAudit extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_profile_id',
        'user_id',
        'action',
        'field_name',
        'previous_value',
        'new_value',
        'changes',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'changes' => 'array',
        ];
    }

    public function agentProfile()
    {
        return $this->belongsTo(AgentProfile::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
