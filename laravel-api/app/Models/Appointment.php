<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'lead_id', 'title', 'description', 'type',
        'starts_at', 'ends_at', 'status', 'location',
    ];

    protected function casts(): array {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function user() { return $this->belongsTo(User::class, 'user_id'); }
    public function lead() { return $this->belongsTo(Lead::class, 'lead_id'); }
}
