<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Deal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'deal_number', 'pipeline_id', 'stage_id', 'lead_id', 'contact_id',
        'assigned_to', 'title', 'value', 'currency', 'status',
        'expected_close_date', 'closed_at', 'notes', 'metadata',
    ];

    protected function casts(): array {
        return [
            'value' => 'decimal:2',
            'expected_close_date' => 'date',
            'closed_at' => 'date',
            'metadata' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Deal $deal) {
            if (!$deal->deal_number) {
                $deal->deal_number = 'DL-' . strtoupper(Str::random(8));
            }
        });
    }

    public function pipeline() { return $this->belongsTo(Pipeline::class); }
    public function stage() { return $this->belongsTo(PipelineStage::class, 'stage_id'); }
    public function lead() { return $this->belongsTo(Lead::class); }
    public function contact() { return $this->belongsTo(Contact::class); }
    public function assignee() { return $this->belongsTo(User::class, 'assigned_to'); }
}
