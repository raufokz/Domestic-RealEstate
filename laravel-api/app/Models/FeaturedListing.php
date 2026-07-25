<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeaturedListing extends Model
{
    use HasFactory;

    protected $fillable = ['property_id', 'user_id', 'start_date', 'end_date', 'amount', 'status'];
    protected function casts(): array { return ['start_date' => 'date', 'end_date' => 'date', 'amount' => 'decimal:2']; }
    public function property() { return $this->belongsTo(Property::class); }
    public function user() { return $this->belongsTo(User::class); }
}
