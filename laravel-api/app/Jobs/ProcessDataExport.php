<?php

namespace App\Jobs;

use App\Models\Blog;
use App\Models\Contact;
use App\Models\DataExport;
use App\Models\Deal;
use App\Models\Invoice;
use App\Models\Lead;
use App\Models\Property;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

/**
 * Turns a pending DataExport row into a real downloadable file.
 *
 * Without this job every export stayed at status "pending" forever and the
 * download endpoint always answered "Export not ready".
 */
class ProcessDataExport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 600;

    public function __construct(public int $exportId)
    {
    }

    public function handle(): void
    {
        $export = DataExport::find($this->exportId);
        if (!$export) {
            return;
        }

        $export->update(['status' => 'processing']);

        try {
            [$headers, $rows] = $this->collectRows($export);

            $directory = 'exports';
            Storage::makeDirectory($directory);

            $filename = sprintf(
                '%s/export-%d-%s-%s.%s',
                $directory,
                $export->id,
                $export->export_type,
                now()->format('Ymd-His'),
                $export->format
            );

            match ($export->format) {
                'xlsx' => $this->writeXlsx($filename, $headers, $rows),
                'pdf' => $this->writePdf($filename, $headers, $rows, $export->export_type),
                default => $this->writeCsv($filename, $headers, $rows),
            };

            $export->update([
                'status' => 'completed',
                'file_path' => $filename,
                'row_count' => count($rows),
                'error_message' => null,
            ]);
        } catch (\Throwable $e) {
            Log::error('Data export failed', [
                'export_id' => $export->id,
                'error' => $e->getMessage(),
            ]);

            $export->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            \App\Services\Notifier::exportFailed($export->id, $e->getMessage());
        }
    }

    public function failed(\Throwable $e): void
    {
        DataExport::where('id', $this->exportId)->update([
            'status' => 'failed',
            'error_message' => $e->getMessage(),
        ]);

        \App\Services\Notifier::exportFailed($this->exportId, $e->getMessage());
    }

    /**
     * @return array{0: array<int,string>, 1: array<int, array<int, mixed>>}
     */
    private function collectRows(DataExport $export): array
    {
        $filters = $export->filters ?? [];

        return match ($export->export_type) {
            'leads' => $this->mapRows(
                $this->applyFilters(Lead::query(), $filters)->get(),
                ['lead_number', 'first_name', 'last_name', 'email', 'phone', 'type', 'status', 'source', 'score', 'created_at']
            ),
            'properties' => $this->mapRows(
                $this->applyFilters(Property::query(), $filters)->get(),
                ['id', 'title', 'slug', 'price', 'status', 'city', 'state', 'bedrooms', 'bathrooms', 'created_at']
            ),
            'users' => $this->mapRows(
                $this->applyFilters(User::query(), $filters)->get(),
                ['id', 'name', 'email', 'role', 'created_at']
            ),
            'contacts' => $this->mapRows(
                $this->applyFilters(Contact::query(), $filters)->get(),
                ['id', 'first_name', 'last_name', 'email', 'phone', 'created_at']
            ),
            'blogs' => $this->mapRows(
                $this->applyFilters(Blog::query(), $filters)->get(),
                ['id', 'title', 'slug', 'status', 'word_count', 'reading_time', 'view_count', 'like_count', 'published_at', 'created_at']
            ),
            'deals' => $this->mapRows(
                $this->applyFilters(Deal::query(), $filters)->get(),
                ['deal_number', 'title', 'value', 'currency', 'status', 'pipeline_id', 'stage_id', 'assigned_to', 'lead_id', 'expected_close_date', 'closed_at', 'created_at']
            ),
            'invoices' => $this->mapRows(
                $this->applyFilters(Invoice::query(), $filters)->get(),
                ['invoice_number', 'user_id', 'description', 'amount', 'currency', 'status', 'paid_at', 'due_at', 'created_at']
            ),
            'agent_leads' => $this->mapAgentLeads($filters),
            default => throw new \RuntimeException('Unsupported export type: '.$export->export_type),
        };
    }

    /** Only applies filters whose key is a real column, so bad input cannot break the query. */
    private function applyFilters($query, array $filters)
    {
        $table = $query->getModel()->getTable();

        foreach ($filters as $key => $value) {
            if ($value === '' || $value === null) {
                continue;
            }

            if (str_ends_with($key, '_after') && Schema::hasColumn($table, substr($key, 0, -6))) {
                $query->where(substr($key, 0, -6), '>=', $value);
                continue;
            }
            if (str_ends_with($key, '_before') && Schema::hasColumn($table, substr($key, 0, -7))) {
                $query->where(substr($key, 0, -7), '<=', $value);
                continue;
            }

            if (Schema::hasColumn($table, $key)) {
                $query->where($key, $value);
            }
        }

        return $query;
    }

    /**
     * @return array{0: array<int,string>, 1: array<int, array<int, mixed>>}
     */
    private function mapRows($collection, array $columns): array
    {
        $rows = $collection->map(function ($model) use ($columns) {
            return array_map(function ($column) use ($model) {
                $value = $model->{$column} ?? '';

                return $value instanceof \DateTimeInterface
                    ? $value->format('Y-m-d H:i:s')
                    : (is_scalar($value) || $value === null ? $value : json_encode($value));
            }, $columns);
        })->all();

        return [$columns, $rows];
    }

    /**
     * @return array{0: array<int,string>, 1: array<int, array<int, mixed>>}
     */
    private function mapAgentLeads(array $filters): array
    {
        $query = Lead::query()
            ->selectRaw('COALESCE(assigned_to, 0) as agent_id')
            ->selectRaw('COUNT(*) as lead_count')
            ->selectRaw('SUM(CASE WHEN status = "converted" THEN 1 ELSE 0 END) as converted_count');

        $this->applyFilters($query, $filters);

        $grouped = $query->groupBy('agent_id')->get();

        $agentNames = User::whereIn('id', $grouped->pluck('agent_id')->filter())
            ->pluck('name', 'id');

        $rows = $grouped->map(function ($row) use ($agentNames) {
            $agentId = (int) $row->agent_id;
            $agentName = $agentId === 0
                ? 'Unassigned'
                : ($agentNames[$agentId] ?? "User #{$agentId}");

            return [
                $agentName,
                $agentId,
                (int) $row->lead_count,
                (int) $row->converted_count,
            ];
        })->all();

        return [['agent_name', 'agent_id', 'lead_count', 'converted_count'], $rows];
    }

    private function writeCsv(string $path, array $headers, array $rows): void
    {
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, $headers);
        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }
        rewind($handle);
        Storage::put($path, stream_get_contents($handle));
        fclose($handle);
    }

    private function writeXlsx(string $path, array $headers, array $rows): void
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->fromArray($headers, null, 'A1');
        if ($rows !== []) {
            $sheet->fromArray($rows, null, 'A2');
        }

        foreach (range(1, count($headers)) as $columnIndex) {
            $sheet->getColumnDimensionByColumn($columnIndex)->setAutoSize(true);
        }
        $sheet->getStyle('A1:'.$sheet->getHighestColumn().'1')->getFont()->setBold(true);

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $temp = tempnam(sys_get_temp_dir(), 'xlsx');
        $writer->save($temp);
        Storage::put($path, file_get_contents($temp));
        @unlink($temp);
    }

    private function writePdf(string $path, array $headers, array $rows, string $title): void
    {
        $html = view('exports.table', [
            'title' => ucfirst($title).' Export',
            'headers' => $headers,
            'rows' => $rows,
            'generatedAt' => now()->format('F j, Y g:i A'),
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->setPaper('a4', 'landscape');
        Storage::put($path, $pdf->output());
    }
}
