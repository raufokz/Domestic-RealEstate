<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $appends = ['full_name'];

    protected $fillable = [
        'lead_number', 'source', 'source_url', 'utm_source', 'utm_medium',
        'utm_campaign', 'first_name', 'last_name', 'email', 'phone',
        'normalized_email', 'normalized_phone', 'type', 'source_intent', 'status', 'priority',
        'score', 'budget_min', 'budget_max', 'timeline', 'motivation',
        'notes', 'assigned_to', 'realtor_id', 'broker_id', 'ghl_contact_id',
        'ip_address', 'user_agent', 'page_url',
        'property_type', 'bedrooms', 'bathrooms', 'location', 'zip_code',
        'financing', 'pre_approved', 'credit_score',
        'realtor_status', 'contact_time', 'consent_given', 'chat_metadata',
        'funnel_completed_at', 'quality_tier', 'consent_text', 'consent_version', 'consent_given_at',
        'marketplace_status', 'marketplace_title', 'marketplace_category',
        'marketplace_description', 'marketplace_price',
        'pricing_model', 'commission_rate', 'payout_method', 'payout_email',
        'reserved_by', 'reservation_expires_at', 'sold_to', 'sold_at', 'listed_at',
        'state', 'city', 'attachments', 'views_count', 'publish_at',
    ];

    protected function casts(): array {
        return [
            'score' => 'integer', 'budget_min' => 'decimal:2', 'budget_max' => 'decimal:2',
            'pre_approved' => 'boolean', 'consent_given' => 'boolean',
            'chat_metadata' => 'array',
            'marketplace_price' => 'decimal:2',
            'commission_rate' => 'decimal:2',
            'reservation_expires_at' => 'datetime',
            'sold_at' => 'datetime',
            'listed_at' => 'datetime',
            'publish_at' => 'datetime',
            'attachments' => 'array',
            'views_count' => 'integer',
            'funnel_completed_at' => 'datetime',
            'consent_given_at' => 'datetime',
        ];
    }

    protected function fullName(): Attribute {
        return Attribute::make(get: fn () => trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? '')));
    }

    protected static function boot() {
        parent::boot();
        static::creating(function ($model) {
            if (!$model->lead_number) $model->lead_number = 'LEAD-' . strtoupper(uniqid());

            // Most capture forms only collect a free-text "City, ST 12345" style
            // location field, not a dedicated ZIP input. Pull a 5-digit ZIP out of
            // whatever text is available so the routing engine has something to
            // match against without requiring every form to be rebuilt.
            if (empty($model->zip_code)) {
                foreach ([$model->location, $model->notes] as $text) {
                    if ($text && preg_match('/\b(\d{5})(?:-\d{4})?\b/', $text, $m)) {
                        $model->zip_code = $m[1];
                        break;
                    }
                }
            }
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

    public function reservedBy() { return $this->belongsTo(User::class, 'reserved_by'); }
    public function soldToUser() { return $this->belongsTo(User::class, 'sold_to'); }
    public function marketplacePurchases() { return $this->hasMany(MarketplaceLeadPurchase::class); }
    public function marketplacePurchase() {
        return $this->hasOne(MarketplaceLeadPurchase::class)->latestOfMany();
    }
    public function paymentLogs() {
        return $this->hasMany(MarketplacePaymentLog::class);
    }

    public function scopeListed($query) { return $query->where('marketplace_status', '!=', 'none'); }
    public function scopeAvailable($query) { return $query->where('marketplace_status', 'available'); }
}
