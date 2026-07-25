<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EnquiryReply extends Model
{
    use HasFactory;

    protected $fillable = ['enquiry_id', 'reply', 'replied_by', 'is_guest'];
    protected function casts(): array { return ['is_guest' => 'boolean']; }
    public function enquiry() { return $this->belongsTo(Enquiry::class); }
    public function replier() { return $this->belongsTo(User::class, 'replied_by'); }
}
