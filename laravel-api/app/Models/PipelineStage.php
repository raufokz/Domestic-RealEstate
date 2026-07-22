<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PipelineStage extends Model
{
    use HasFactory;

    protected $table = 'pipeline_stages';

    protected $fillable = ['pipeline_id', 'name', 'slug', 'color', 'sort_order', 'probability', 'is_won', 'is_lost'];

    protected function casts(): array {
        return ['sort_order' => 'integer', 'probability' => 'integer', 'is_won' => 'boolean', 'is_lost' => 'boolean'];
    }

    public function pipeline() { return $this->belongsTo(Pipeline::class); }
    public function deals() { return $this->hasMany(Deal::class, 'stage_id'); }
}
