<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AgentProfile extends Model
{
    use HasFactory, SoftDeletes;

    /** Canonical "Services Needed" category tree offered on the Preferred Agent
     * registration form. Registration validates `services_needed` against this
     * flattened list so `specialties` never stores an arbitrary free-text value. */
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

    /** Preferred Agent pricing tiers. `cap` = max services selectable (null =
     * unlimited); `categories` = SERVICE_CATALOG keys the tier may pick from
     * (null = any category). Mirrors the tier cards on the home page & register
     * form so the server enforces the same rules a user could otherwise bypass
     * by editing the request directly. */
    public const PLAN_TIERS = [
        'Solo' => ['cap' => 2, 'categories' => null],
        'Starter' => ['cap' => 5, 'categories' => ['Core Services', 'Web & Tech']],
        'Professional' => ['cap' => 10, 'categories' => null],
        'Elite' => ['cap' => null, 'categories' => null],
        'Enterprise Custom' => ['cap' => null, 'categories' => null],
    ];

    /** Services a given plan name is allowed to include, or null if the plan
     * doesn't restrict category (still may cap the count). Unknown plan names
     * return null (no restriction) — registration falls back to "trust the
     * catalog validation" for plans we don't recognize. */
    public static function planAllowedServices(?string $planName): ?array {
        $tier = self::PLAN_TIERS[$planName] ?? null;
        if (!$tier || $tier['categories'] === null) {
            return null;
        }
        return array_merge(...array_map(fn ($cat) => self::SERVICE_CATALOG[$cat], $tier['categories']));
    }

    protected $fillable = [
        'user_id', 'slug', 'headline', 'bio', 'brokerage_name', 'broker_name',
        'license_number', 'license_status', 'mls_board', 'years_experience',
        'specialties', 'languages', 'service_areas', 'lead_type_preferences',
        'partnership_type', 'office_address', 'office_city', 'office_state',
        'office_zip', 'office_country', 'office_phone', 'office_email',
        'website', 'social_links', 'e_signature', 'rating', 'review_count',
        'sales_count', 'is_featured', 'is_published', 'status', 'approved_at',
        'payment_status', 'payoneer_checkout_url', 'payment_link_sent_at',
    ];

    protected function casts(): array {
        return [
            'specialties' => 'array', 'languages' => 'array', 'service_areas' => 'array',
            'lead_type_preferences' => 'array', 'social_links' => 'array',
            'rating' => 'decimal:2', 'is_featured' => 'boolean', 'is_published' => 'boolean',
            'approved_at' => 'datetime', 'years_experience' => 'integer',
            'review_count' => 'integer', 'sales_count' => 'integer',
            'payment_link_sent_at' => 'datetime',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function documents() { return $this->hasMany(AgentDocument::class, 'agent_id'); }
    public function reviews() { return $this->hasManyThrough(Review::class, Review::class, 'reviewable_id'); }
}
