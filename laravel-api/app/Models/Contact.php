<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'first_name', 'last_name', 'email', 'phone', 'type', 'status',
        'tags', 'source', 'company', 'address', 'city', 'state', 'zip',
        'avatar_url', 'metadata', 'assigned_to', 'unsubscribed_at',
    ];

    protected function casts(): array {
        return ['type' => 'array', 'tags' => 'array', 'metadata' => 'array', 'unsubscribed_at' => 'datetime'];
    }

    public function assignee() { return $this->belongsTo(User::class, 'assigned_to'); }
    public function groups() { return $this->belongsToMany(ContactGroup::class, 'contact_group_members'); }
    public function campaignRecipients() { return $this->hasMany(CampaignRecipient::class); }
}
