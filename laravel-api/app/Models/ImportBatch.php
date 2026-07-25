<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ImportBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'import_type', 'file_name', 'file_path', 'format', 'status',
        'column_map', 'detected_headers',
        'total_rows', 'rows_imported', 'rows_updated', 'rows_failed', 'rows_without_email',
        'error_message', 'created_by', 'started_at', 'completed_at',
    ];

    protected $casts = [
        'column_map' => 'array',
        'detected_headers' => 'array',
        'total_rows' => 'integer',
        'rows_imported' => 'integer',
        'rows_updated' => 'integer',
        'rows_failed' => 'integer',
        'rows_without_email' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function errors(): HasMany
    {
        return $this->hasMany(ImportBatchError::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
