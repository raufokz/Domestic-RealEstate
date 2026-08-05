<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractTemplate extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'html', 'merge_fields', 'created_by'];

    protected function casts(): array
    {
        return ['merge_fields' => 'array'];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Substitute {{tag}} placeholders in the template HTML with values from
     * $context. Unknown tags are left as-is.
     */
    public function render(array $context): string
    {
        $search = array_map(fn ($tag) => '{{'.$tag.'}}', array_keys($context));

        return str_replace($search, array_values($context), $this->html);
    }
}
