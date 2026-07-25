<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadNote extends Model
{
    use HasFactory;

    protected $fillable = ['lead_id', 'note', 'pinned', 'created_by'];
    protected function casts(): array { return ['pinned' => 'boolean']; }
    public function lead() { return $this->belongsTo(Lead::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
