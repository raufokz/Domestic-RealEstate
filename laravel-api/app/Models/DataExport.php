<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataExport extends Model
{
    use HasFactory;

    protected $fillable = [
        'export_type', 'format', 'filters', 'status', 'file_path',
        'row_count', 'created_by', 'error_message',
    ];

    protected $casts = [
        'filters' => 'array',
        'row_count' => 'integer',
    ];

    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function scopeByStatus($query, $status) { return $query->where('status', $status); }
}
