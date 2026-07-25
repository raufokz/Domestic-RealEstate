<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdPlacement extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'location', 'size', 'price', 'status'];
    protected function casts(): array { return ['price' => 'decimal:2']; }
}
