<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserMembership extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'plan_id', 'status', 'starts_at', 'ends_at',
        'manually_activated_by', 'canceled_at',
    ];

    protected function casts(): array {
        return [
            'starts_at' => 'datetime', 'ends_at' => 'datetime', 'canceled_at' => 'datetime',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function plan() { return $this->belongsTo(MembershipPlan::class, 'plan_id'); }
    public function activatedBy() { return $this->belongsTo(User::class, 'manually_activated_by'); }
}
