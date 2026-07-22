<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationWorkflowLog extends Model
{
    use HasFactory;

    protected $fillable = ['workflow_id', 'trigger_event', 'trigger_data', 'action_results', 'status'];

    protected $casts = [
        'trigger_data' => 'array',
        'action_results' => 'array',
    ];

    public function workflow(): BelongsTo { return $this->belongsTo(AutomationWorkflow::class, 'workflow_id'); }
}
