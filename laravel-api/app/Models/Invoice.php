<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number', 'user_id', 'service_request_id', 'payoneer_invoice_id',
        'description', 'amount', 'currency', 'status', 'notes', 'items',
        'sent_at', 'paid_at', 'due_at', 'due_date', 'created_by',
    ];

    protected function casts(): array {
        return [
            'amount' => 'decimal:2',
            'items' => 'array',
            'sent_at' => 'datetime', 'paid_at' => 'datetime', 'due_at' => 'datetime', 'due_date' => 'date',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function serviceRequest() { return $this->belongsTo(ServiceRequest::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }

    public static function generateNumber(): string {
        return 'INV-' . date('Ymd') . '-' . str_pad(static::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
    }
}
