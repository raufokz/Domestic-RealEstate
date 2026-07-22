<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadMatch extends Model
{
    use HasFactory;

    protected $fillable = ['lead_id', 'agent_id', 'score', 'matched_at'];
    protected function casts(): array { return ['score' => 'integer', 'matched_at' => 'datetime']; }
    public function lead() { return $this->belongsTo(Lead::class); }
    public function agent() { return $this->belongsTo(User::class, 'agent_id'); }
}
