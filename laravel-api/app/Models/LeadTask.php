<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id', 'title', 'description', 'priority', 'status',
        'due_date', 'completed_at', 'created_by', 'assigned_to',
    ];

    protected function casts(): array {
        return ['due_date' => 'datetime', 'completed_at' => 'datetime'];
    }

    public function lead() { return $this->belongsTo(Lead::class); }
    public function assignee() { return $this->belongsTo(User::class, 'assigned_to'); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
