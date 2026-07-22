<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiConversation extends Model
{
    protected $fillable = [
        'session_id',
        'lead_id',
        'ai_type',
        'user_name',
        'user_email',
        'user_phone',
        'messages',
        'summary',
        'qualification_score',
        'status',
        'assigned_agent_id',
        'notes',
    ];

    protected $casts = [
        'messages' => 'array',
        'qualification_score' => 'integer',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function assignedAgent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_agent_id');
    }
}
