<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'setting_key', 'value', 'type', 'setting_group', 'description',
    ];

    public function scopeByGroup($query, $group) { return $query->where('setting_group', $group); }
}
