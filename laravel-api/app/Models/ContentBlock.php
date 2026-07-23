<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContentBlock extends Model
{
    use HasFactory;

    protected $fillable = [
        'key_name',
        'title',
        'content',
        'type',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];
}
