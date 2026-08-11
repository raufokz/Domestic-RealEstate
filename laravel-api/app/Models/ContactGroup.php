<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactGroup extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'description'];
    public function contacts() { return $this->belongsToMany(Contact::class, 'contact_group_members', 'group_id', 'contact_id'); }
}
