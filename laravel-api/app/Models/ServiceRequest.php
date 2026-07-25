<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_number', 'user_id', 'full_name', 'email', 'phone',
        'service_type', 'budget_range', 'timeline', 'message',
        'how_did_you_hear', 'metadata', 'status', 'assigned_admin',
        'admin_notes', 'quoted_at', 'contract_sent_at', 'signed_at', 'activated_at',
    ];

    protected function casts(): array {
        return [
            'metadata' => 'array',
            'quoted_at' => 'datetime', 'contract_sent_at' => 'datetime',
            'signed_at' => 'datetime', 'activated_at' => 'datetime',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function assignedAdmin() { return $this->belongsTo(User::class, 'assigned_admin'); }
    public function contracts() { return $this->hasMany(Contract::class); }
    public function invoices() { return $this->hasMany(Invoice::class); }

    public static function generateNumber(): string {
        return 'SR-' . date('Ymd') . '-' . str_pad(static::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
    }
}
