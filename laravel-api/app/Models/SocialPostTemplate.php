<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocialPostTemplate extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'content_template', 'platform', 'category', 'variables'];

    protected $casts = ['variables' => 'array'];
}
