<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BrokerProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'company_name', 'brokerage_license', 'address', 'city',
        'state', 'zip', 'country', 'agents_count', 'transactions_count',
        'logo', 'website', 'phone', 'email', 'status',
    ];

    protected function casts(): array {
        return ['agents_count' => 'integer', 'transactions_count' => 'integer'];
    }

    public function user() { return $this->belongsTo(User::class); }
}
