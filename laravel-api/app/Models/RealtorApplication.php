<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RealtorApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference', 'full_name', 'email', 'phone', 'license_number', 'license_state',
        'brokerage_name', 'brokerage_license_number', 'id_document_path', 'license_document_path',
        'status', 'reviewer_id', 'review_notes', 'created_user_id', 'submitted_at', 'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function createdUser()
    {
        return $this->belongsTo(User::class, 'created_user_id');
    }
}
