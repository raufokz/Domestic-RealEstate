<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyAnalytics extends Model
{
    use HasFactory;

    protected $fillable = ['property_id', 'date', 'views', 'inquiries', 'clicks'];
    protected function casts(): array {
        return ['date' => 'date', 'views' => 'integer', 'inquiries' => 'integer', 'clicks' => 'integer'];
    }
    public function property() { return $this->belongsTo(Property::class); }
}
