<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AutomationWorkflow extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'trigger_type', 'trigger_conditions',
        'actions', 'is_active', 'run_count', 'last_run_at',
    ];

    protected $casts = [
        'trigger_conditions' => 'array',
        'actions' => 'array',
        'is_active' => 'boolean',
        'last_run_at' => 'datetime',
    ];

    public function logs(): HasMany { return $this->hasMany(AutomationWorkflowLog::class, 'workflow_id'); }
    public function scopeActive($query) { return $query->where('is_active', true); }
}
