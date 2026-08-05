<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailHistory extends Model
{
    use HasFactory;

    protected $table = 'email_history';

    protected $fillable = ['recipient', 'subject', 'body', 'status', 'opens', 'clicks', 'sent_at', 'error_message'];
    protected function casts(): array { return ['opens' => 'integer', 'clicks' => 'integer', 'sent_at' => 'datetime']; }
    public function tracking() { return $this->hasMany(EmailTracking::class, 'email_history_id'); }
}
