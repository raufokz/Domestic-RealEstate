<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RealtorApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference', 'full_name', 'email', 'phone', 'license_number', 'license_state',
        'zip_codes', 'radius_miles', 'lead_type_preferences', 'languages_spoken', 'email_verified',
        'brokerage_name', 'brokerage_license_number', 'id_document_path', 'license_document_path',
        'profile_photo_path', 'status', 'reviewer_id', 'review_notes', 'created_user_id', 'submitted_at', 'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'zip_codes' => 'array',
            'lead_type_preferences' => 'array',
            'languages_spoken' => 'array',
            'email_verified' => 'boolean',
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
