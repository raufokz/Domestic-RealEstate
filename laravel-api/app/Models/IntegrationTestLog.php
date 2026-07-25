<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntegrationTestLog extends Model
{
    use HasFactory;

    protected $fillable = ['integration_id', 'tested_by', 'result', 'response_summary'];

    public function integration(): BelongsTo { return $this->belongsTo(Integration::class); }
    public function tester(): BelongsTo { return $this->belongsTo(User::class, 'tested_by'); }
}
