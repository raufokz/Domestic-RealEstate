<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractVersion extends Model
{
    use HasFactory;

    protected $fillable = ['contract_id', 'version_number', 'template_html', 'changed_by', 'change_note'];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function changer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    /**
     * Minimal line-based diff — no external dependency. Returns an array of
     * ['type' => 'same'|'added'|'removed', 'line' => string] entries using
     * the classic LCS-backed diff algorithm.
     */
    public static function diffLines(string $old, string $new): array
    {
        $a = preg_split('/\R/', $old);
        $b = preg_split('/\R/', $new);
        $m = count($a);
        $n = count($b);

        $lcs = array_fill(0, $m + 1, array_fill(0, $n + 1, 0));
        for ($i = $m - 1; $i >= 0; $i--) {
            for ($j = $n - 1; $j >= 0; $j--) {
                $lcs[$i][$j] = $a[$i] === $b[$j]
                    ? $lcs[$i + 1][$j + 1] + 1
                    : max($lcs[$i + 1][$j], $lcs[$i][$j + 1]);
            }
        }

        $result = [];
        $i = 0;
        $j = 0;
        while ($i < $m && $j < $n) {
            if ($a[$i] === $b[$j]) {
                $result[] = ['type' => 'same', 'line' => $a[$i]];
                $i++;
                $j++;
            } elseif ($lcs[$i + 1][$j] >= $lcs[$i][$j + 1]) {
                $result[] = ['type' => 'removed', 'line' => $a[$i]];
                $i++;
            } else {
                $result[] = ['type' => 'added', 'line' => $b[$j]];
                $j++;
            }
        }
        while ($i < $m) {
            $result[] = ['type' => 'removed', 'line' => $a[$i]];
            $i++;
        }
        while ($j < $n) {
            $result[] = ['type' => 'added', 'line' => $b[$j]];
            $j++;
        }

        return $result;
    }
}
