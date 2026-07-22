<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadAssignment extends Model
{
    use HasFactory;

    protected $fillable = ['lead_id', 'agent_id', 'status', 'assigned_at', 'responded_at'];
    protected function casts(): array { return ['assigned_at' => 'datetime', 'responded_at' => 'datetime']; }
    public function lead() { return $this->belongsTo(Lead::class); }
    public function agent() { return $this->belongsTo(User::class, 'agent_id'); }
}
