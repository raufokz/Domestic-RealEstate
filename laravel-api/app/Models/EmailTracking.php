<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTracking extends Model
{
    use HasFactory;

    protected $table = 'email_tracking';

    protected $fillable = ['email_history_id', 'type', 'ip_address', 'user_agent', 'metadata'];
    protected function casts(): array { return ['metadata' => 'array']; }
    public function emailHistory() { return $this->belongsTo(EmailHistory::class, 'email_history_id'); }
}
