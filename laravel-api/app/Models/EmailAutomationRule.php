<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmailAutomationRule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'description', 'trigger_event', 'email_template_id',
        'conditions', 'delay_config', 'is_active', 'execution_count',
        'last_executed_at',
    ];

    protected $casts = [
        'conditions' => 'array',
        'delay_config' => 'array',
        'is_active' => 'boolean',
        'execution_count' => 'integer',
        'last_executed_at' => 'datetime',
    ];

    public function emailTemplate(): BelongsTo { return $this->belongsTo(EmailTemplate::class); }
    public function scopeActive($query) { return $query->where('is_active', true); }
}
