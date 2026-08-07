<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MortgageApplication extends Model
{
    protected $fillable = [
        'user_id', 'lender_name', 'amount', 'rate', 'term_years',
        'monthly_payment', 'status', 'notes', 'applied_at',
    ];

    protected function casts(): array
    {
        return [
            'rate' => 'decimal:3',
            'monthly_payment' => 'decimal:2',
            'applied_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
