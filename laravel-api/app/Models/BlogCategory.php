<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'sort_order'];
    protected function casts(): array { return ['sort_order' => 'integer']; }
    public function blogs() { return $this->hasMany(Blog::class, 'category_id'); }
}
