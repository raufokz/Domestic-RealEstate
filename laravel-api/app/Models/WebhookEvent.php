<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebhookEvent extends Model
{
    use HasFactory;

    protected $fillable = ['source', 'payload', 'payload_hash', 'status', 'processed_at', 'error_message'];
    protected function casts(): array { return ['payload' => 'array', 'processed_at' => 'datetime']; }
}
