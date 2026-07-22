<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_number', 'service_request_id', 'user_id', 'template_name',
        'template_html', 'client_details', 'signature_base64', 'signed_ip',
        'signed_user_agent', 'status', 'sent_at', 'signed_at', 'expires_at', 'created_by',
    ];

    protected function casts(): array {
        return [
            'client_details' => 'array',
            'sent_at' => 'datetime', 'signed_at' => 'datetime', 'expires_at' => 'datetime',
        ];
    }

    public function serviceRequest() { return $this->belongsTo(ServiceRequest::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }

    public static function generateNumber(): string {
        return 'CTR-' . date('Ymd') . '-' . str_pad(static::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
    }
}
