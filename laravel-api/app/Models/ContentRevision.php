<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ContentRevision extends Model
{
    public $timestamps = false;

    protected $fillable = ['revisionable_type', 'revisionable_id', 'data', 'created_by', 'created_at'];

    protected function casts(): array
    {
        return ['data' => 'array', 'created_at' => 'datetime'];
    }

    public function revisionable(): MorphTo { return $this->morphTo(); }
    public function author(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
