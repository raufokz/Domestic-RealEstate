<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadPackage extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'lead_count', 'description', 'is_active', 'price', 'price_per_lead', 'is_popular'];
    protected function casts(): array { return ['lead_count' => 'integer', 'is_active' => 'boolean', 'price' => 'decimal:2', 'price_per_lead' => 'decimal:2', 'is_popular' => 'boolean']; }
}
