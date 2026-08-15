<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AgentProfile extends Model
{
    use HasFactory, SoftDeletes;

    public const SERVICE_CATALOG = [
        'Core Services' => [
            'Executive Virtual Assistant', 'Email Management', 'Calendar Management',
            'CRM Management', 'MLS & Property Listings', 'Data Entry & Research',
            'Excel & Google Sheets', 'Cold Calling', 'Lead Generation', 'Social Media Management',
        ],
        'Web & Tech' => [
            'Real Estate Website Development', 'Website Updates & Maintenance', 'Landing Pages',
            'WordPress Development', 'Automation & Workflows', 'Technical Support',
        ],
        'Marketing' => [
            'SEO', 'Graphic Design (Canva)', 'Content Creation', 'YouTube Management', 'Pinterest Marketing',
        ],
        'AI & Productivity' => [
            'AI Tools Integration', 'Reports & Analytics', 'Database Management',
        ],
    ];

    public static function serviceCatalogFlat(): array {
        return array_merge(...array_values(self::SERVICE_CATALOG));
    }

    // 'monthly'/'annual' mirror nextjs-frontend/src/lib/agentPlans.ts exactly —
    // that file is the source of truth for what's *shown*, this is the source
    // of truth for what's *billed*, so the two must stay in sync. Enterprise
    // Custom has no price — it's sales-assisted, never auto-invoiced.
    public const PLAN_TIERS = [
        'Solo' => ['cap' => 2, 'categories' => null, 'monthly' => 21, 'annual' => 250],
        'Starter' => ['cap' => 5, 'categories' => ['Core Services', 'Web & Tech'], 'monthly' => 38, 'annual' => 450],
        'Professional' => ['cap' => 10, 'categories' => null, 'monthly' => 63, 'annual' => 750],
        'Elite' => ['cap' => null, 'categories' => null, 'monthly' => 83, 'annual' => 990],
        'Enterprise Custom' => ['cap' => null, 'categories' => null, 'monthly' => null, 'annual' => null],
    ];

    public static function planAllowedServices(?string $planName): ?array {
        $tier = self::PLAN_TIERS[$planName] ?? null;
        if (!$tier || $tier['categories'] === null) {
            return null;
        }
        return array_merge(...array_map(fn ($cat) => self::SERVICE_CATALOG[$cat], $tier['categories']));
    }

    protected $fillable = [
        'user_id', 'slug', 'middle_name', 'preferred_name', 'dob', 'gender', 'ethnicity', 'nationality', 'timezone',
        'headline', 'bio', 'profile_photo', 'cover_photo', 'company_logo', 'intro_video_url', 'office_photos', 'team_photos', 'property_portfolio_images',
        'brokerage_name', 'broker_name', 'brokerage_address', 'brokerage_website', 'brokerage_contact',
        'license_number', 'license_state', 'license_expiry_date', 'license_status', 'mls_board', 'mls_number', 'years_experience',
        'nar_membership', 'realtor_membership', 'certifications', 'awards', 'designations',
        'specialties', 'property_types', 'languages', 'service_areas', 'lead_type_preferences', 'partnership_type',
        'office_address', 'office_city', 'office_state', 'office_zip', 'radius_miles', 'office_country', 'office_phone', 'office_email',
        'secondary_email', 'mobile_number', 'office_number', 'whatsapp_number', 'fax', 'website', 'social_links',
        'business_name', 'business_email', 'business_phone', 'office_hours', 'team_name', 'team_members', 'assistant_info',
        'notification_preferences', 'privacy_settings', 'e_signature', 'rating', 'review_count', 'sales_count',
        'is_featured', 'is_published', 'status', 'approved_at', 'rejection_reason', 'verified_by', 'verified_at',
        'payment_status', 'payoneer_checkout_url', 'payment_link_sent_at',
    ];

    protected function casts(): array {
        return [
            'specialties' => 'array',
            'property_types' => 'array',
            'languages' => 'array',
            'service_areas' => 'array',
            'lead_type_preferences' => 'array',
            'social_links' => 'array',
            'office_photos' => 'array',
            'team_photos' => 'array',
            'property_portfolio_images' => 'array',
            'certifications' => 'array',
            'awards' => 'array',
            'designations' => 'array',
            'office_hours' => 'array',
            'team_members' => 'array',
            'assistant_info' => 'array',
            'notification_preferences' => 'array',
            'privacy_settings' => 'array',
            'rating' => 'decimal:2',
            'nar_membership' => 'boolean',
            'realtor_membership' => 'boolean',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'dob' => 'date',
            'license_expiry_date' => 'date',
            'approved_at' => 'datetime',
            'verified_at' => 'datetime',
            'years_experience' => 'integer',
            'review_count' => 'integer',
            'sales_count' => 'integer',
            'payment_link_sent_at' => 'datetime',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function verifiedByAdmin() { return $this->belongsTo(User::class, 'verified_by'); }
    public function documents() { return $this->hasMany(AgentDocument::class, 'agent_id'); }
    public function audits() { return $this->hasMany(AgentProfileAudit::class, 'agent_profile_id')->latest(); }

    public function logAudit(string $action, ?string $fieldName = null, $previousValue = null, $newValue = null, ?array $changes = null, ?int $actorUserId = null): AgentProfileAudit
    {
        return AgentProfileAudit::create([
            'agent_profile_id' => $this->id,
            'user_id' => $actorUserId ?? auth()->id(),
            'action' => $action,
            'field_name' => $fieldName,
            'previous_value' => is_array($previousValue) ? json_encode($previousValue) : (string) $previousValue,
            'new_value' => is_array($newValue) ? json_encode($newValue) : (string) $newValue,
            'changes' => $changes,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
