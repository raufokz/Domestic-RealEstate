<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pipeline extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'created_by', 'is_default', 'is_active', 'sort_order'];

    protected function casts(): array {
        return ['is_default' => 'boolean', 'is_active' => 'boolean', 'sort_order' => 'integer'];
    }

    public function stages() { return $this->hasMany(PipelineStage::class)->orderBy('sort_order'); }
    public function deals() { return $this->hasMany(Deal::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
