<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'lead_number', 'source', 'source_url', 'utm_source', 'utm_medium',
        'utm_campaign', 'first_name', 'last_name', 'email', 'phone',
        'normalized_email', 'normalized_phone', 'type', 'status', 'priority',
        'score', 'budget_min', 'budget_max', 'timeline', 'motivation',
        'notes', 'assigned_to', 'realtor_id', 'broker_id', 'ghl_contact_id',
        'ip_address', 'user_agent', 'page_url',
        'property_type', 'bedrooms', 'bathrooms', 'location',
        'financing', 'pre_approved', 'credit_score',
        'realtor_status', 'contact_time', 'consent_given', 'chat_metadata',
    ];

    protected function casts(): array {
        return [
            'score' => 'integer', 'budget_min' => 'decimal:2', 'budget_max' => 'decimal:2',
            'pre_approved' => 'boolean', 'consent_given' => 'boolean',
            'chat_metadata' => 'array',
        ];
    }

    protected static function boot() {
        parent::boot();
        static::creating(function ($model) {
            if (!$model->lead_number) $model->lead_number = 'LEAD-' . strtoupper(uniqid());
        });
    }

    public function assignee() { return $this->belongsTo(User::class, 'assigned_to'); }
    public function realtor() { return $this->belongsTo(User::class, 'realtor_id'); }
    public function broker() { return $this->belongsTo(User::class, 'broker_id'); }
    public function activities() { return $this->hasMany(LeadActivity::class); }
    public function notes() { return $this->hasMany(LeadNote::class); }
    public function tasks() { return $this->hasMany(LeadTask::class); }
    public function assignments() { return $this->hasMany(LeadAssignment::class); }
    public function matches() { return $this->hasMany(LeadMatch::class); }
    public function purchasedBy() { return $this->hasMany(PurchasedLead::class); }
}
