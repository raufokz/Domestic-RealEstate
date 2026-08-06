<?php

namespace App\Services;

use App\Models\ImportBatch;
use App\Models\ImportBatchError;
use Illuminate\Http\UploadedFile;

/**
 * Shared CSV/XLSX/JSON reading + per-row error logging for bulk importers.
 * Extracted from LeadController::import's private helpers (the original,
 * still untouched) now that a second importer (PropertyController::import)
 * needs the identical file-parsing logic.
 */
class TabularImportService
{
    /**
     * Read CSV/XLSX/JSON into a positional header + rows structure.
     *
     * @return array{0: array<int,string>, 1: array<int, array<int, mixed>>}
     */
    public static function read(UploadedFile $file, string $ext): array
    {
        $path = $file->getRealPath();

        if ($ext === 'json') {
            $decoded = json_decode((string) file_get_contents($path), true);
            if (!is_array($decoded) || $decoded === []) {
                return [[], []];
            }
            $headers = array_keys((array) reset($decoded));
            $rows = array_map(
                fn ($item) => array_map(fn ($h) => ((array) $item)[$h] ?? null, $headers),
                $decoded
            );

            return [$headers, array_values($rows)];
        }

        if (in_array($ext, ['xlsx', 'xls'], true)) {
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($path);
            $data = $spreadsheet->getActiveSheet()->toArray(null, true, true, false);
            $headers = array_map(fn ($h) => trim((string) $h), array_shift($data) ?: []);

            return [$headers, array_values(array_filter($data, fn ($r) => array_filter($r, fn ($v) => trim((string) $v) !== '')))];
        }

        // Default: CSV / TXT
        $headers = [];
        $rows = [];
        if (($handle = fopen($path, 'r')) !== false) {
            while (($row = fgetcsv($handle, 0, ',')) !== false) {
                if ($headers === []) {
                    $headers = array_map(fn ($h) => trim((string) $h), $row);
                    continue;
                }
                if (array_filter($row, fn ($v) => trim((string) $v) !== '') !== []) {
                    $rows[] = $row;
                }
            }
            fclose($handle);
        }

        return [$headers, $rows];
    }

    /** Persist one failed/skipped row so the admin can download and correct it. */
    public static function recordRowError(
        ImportBatch $batch,
        int $rowNumber,
        string $code,
        string $reason,
        array $headers,
        array $row
    ): void {
        ImportBatchError::create([
            'import_batch_id' => $batch->id,
            'row_number' => $rowNumber,
            'reason_code' => $code,
            'reason' => $reason,
            'row_data' => self::combineRow($headers, $row),
        ]);
    }

    /** @return array<string, mixed> */
    public static function combineRow(array $headers, array $row): array
    {
        $out = [];
        foreach ($headers as $i => $header) {
            $out[$header] = $row[$i] ?? null;
        }

        return $out;
    }
}
