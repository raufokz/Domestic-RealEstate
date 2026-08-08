<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomFormField extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'form_type', 'field_label', 'field_type',
        'options', 'is_required', 'sort_order', 'is_active',
    ];

    protected function casts(): array {
        return [
            'options' => 'array',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }

    public function scopeForForm($query, string $formType) {
        return $query->where('form_type', $formType)->where('is_active', true)->orderBy('sort_order');
    }
}
