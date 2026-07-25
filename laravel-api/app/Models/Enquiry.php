<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'type', 'name', 'email', 'phone', 'subject', 'message',
        'property_id', 'agent_id', 'status', 'source_page',
    ];

    public function property() { return $this->belongsTo(Property::class); }
    public function agent() { return $this->belongsTo(User::class, 'agent_id'); }
    public function replies() { return $this->hasMany(EnquiryReply::class); }
}
