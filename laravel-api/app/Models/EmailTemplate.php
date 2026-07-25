<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'type', 'subject', 'html_body', 'text_body', 'variables', 'is_active'];
    protected function casts(): array { return ['variables' => 'array', 'is_active' => 'boolean']; }
}
