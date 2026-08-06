<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * Every value users.role has ever been allowed to hold. Also the set of
     * Spatie roles UserObserver keeps in sync with that column, and the
     * set RolePermissionSeeder grants permissions to. admin/super_admin are
     * intentionally NOT reachable from public self-registration — see
     * AuthController::register.
     */
    public const ROLES = ['buyer', 'seller', 'agent', 'broker', 'investor', 'wholesaler', 'staff', 'admin', 'super_admin'];

    protected $fillable = [
        'name', 'email', 'password', 'role', 'status', 'phone',
        'phone_verified', 'normalized_phone', 'avatar', 'timezone',
        'locale', 'last_login_at', 'ppl_eligible', 'ppl_access_enabled',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'phone_verified' => 'boolean',
            'ppl_eligible' => 'boolean',
            'ppl_access_enabled' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function agentProfile() { return $this->hasOne(AgentProfile::class); }
    public function brokerProfile() { return $this->hasOne(BrokerProfile::class); }
    public function properties() { return $this->hasMany(Property::class, 'realtor_id'); }
    public function leads() { return $this->hasMany(Lead::class, 'assigned_to'); }
    public function assignedLeads() { return $this->hasMany(Lead::class, 'assigned_to'); }
    public function membership() { return $this->hasOne(UserMembership::class); }
    public function notifications_items() { return $this->hasMany(Notification::class); }
    public function favourites() { return $this->hasMany(PropertyFavorite::class); }
    public function oauthAccounts() { return $this->hasMany(OAuthAccount::class); }
    public function sessions() { return $this->hasMany(UserSession::class); }
    public function enquiries() { return $this->hasMany(Enquiry::class); }
    public function referrals() { return $this->hasMany(Referral::class, 'referrer_id'); }
    public function referredBy() { return $this->belongsTo(Referral::class, 'referred_id'); }
    public function blogPosts() { return $this->hasMany(Blog::class, 'author_id'); }
    public function leadTasks() { return $this->hasMany(LeadTask::class, 'assigned_to'); }
}
