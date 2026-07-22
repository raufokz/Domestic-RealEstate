<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactGroupMember extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $fillable = ['group_id', 'contact_id'];
    public function group() { return $this->belongsTo(ContactGroup::class, 'group_id'); }
    public function contact() { return $this->belongsTo(Contact::class); }
}
