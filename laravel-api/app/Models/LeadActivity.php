<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadActivity extends Model
{
    use HasFactory;

    protected $fillable = ['lead_id', 'type', 'description', 'metadata', 'performed_by'];
    protected function casts(): array { return ['metadata' => 'array']; }
    public function lead() { return $this->belongsTo(Lead::class); }
    public function performer() { return $this->belongsTo(User::class, 'performed_by'); }
}
