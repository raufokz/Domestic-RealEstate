<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportBatchError extends Model
{
    use HasFactory;

    protected $fillable = [
        'import_batch_id', 'row_number', 'reason_code', 'reason', 'row_data',
    ];

    protected $casts = [
        'row_data' => 'array',
        'row_number' => 'integer',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(ImportBatch::class, 'import_batch_id');
    }
}
