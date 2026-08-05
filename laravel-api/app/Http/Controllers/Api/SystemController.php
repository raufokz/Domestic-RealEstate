<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class SystemController extends Controller
{
    private function checkAdmin(): void
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['admin', 'super_admin'], true)) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    private function backupDir(): string
    {
        return storage_path('app/backups');
    }

    private function formatBytes(int|float $bytes, int $precision = 1): string
    {
        if ($bytes <= 0) {
            return '0 B';
        }
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $pow = min((int) floor(log($bytes, 1024)), count($units) - 1);
        return round($bytes / (1024 ** $pow), $precision) . ' ' . $units[$pow];
    }

    public function systemHealth(): JsonResponse {
        // Real database connectivity check.
        $dbOk = true;
        try {
            DB::select('select 1');
        } catch (\Throwable $e) {
            $dbOk = false;
        }

        // Real disk metrics for the application volume.
        $root = base_path();
        $diskTotal = @disk_total_space($root) ?: 0;
        $diskFree = @disk_free_space($root) ?: 0;
        $diskUsed = $diskTotal - $diskFree;

        // Real memory metrics for this PHP process.
        $memLimitRaw = ini_get('memory_limit');
        $memUsed = memory_get_usage(true);
        $memPeak = memory_get_peak_usage(true);

        // Real queue / failed-job counts (guard missing tables).
        $pendingJobs = null;
        $failedJobs = null;
        try { $pendingJobs = DB::table('jobs')->count(); } catch (\Throwable $e) {}
        try { $failedJobs = DB::table('failed_jobs')->count(); } catch (\Throwable $e) {}

        // Most recent real backup, if any.
        $lastBackup = null;
        if (File::isDirectory($this->backupDir())) {
            $files = collect(File::files($this->backupDir()))->sortByDesc(fn ($f) => $f->getMTime());
            if ($files->isNotEmpty()) {
                $lastBackup = date('c', $files->first()->getMTime());
            }
        }

        return ApiResponse::ok([
            'php_version' => phpversion(),
            'laravel_version' => app()->version(),
            'database' => $dbOk ? 'connected' : 'disconnected',
            'cache' => ['driver' => config('cache.default')],
            'queue' => [
                'driver' => config('queue.default'),
                'pending' => $pendingJobs,
                'failed' => $failedJobs,
            ],
            'disk_usage' => [
                'total' => $this->formatBytes($diskTotal),
                'used' => $this->formatBytes($diskUsed),
                'free' => $this->formatBytes($diskFree),
                'used_percent' => $diskTotal > 0 ? round($diskUsed / $diskTotal * 100, 1) : null,
            ],
            'memory' => [
                'limit' => $memLimitRaw,
                'used' => $this->formatBytes($memUsed),
                'peak' => $this->formatBytes($memPeak),
            ],
            'last_backup' => $lastBackup,
            'checked_at' => now()->toIso8601String(),
        ], 'System health');
    }

    public function logs(): JsonResponse {
        // Parse real entries from the Laravel log file (newest first).
        $file = storage_path('logs/laravel.log');
        $entries = [];

        if (File::exists($file)) {
            // Read only the tail of the file to stay lightweight on large logs.
            $content = @file_get_contents($file, false, null, max(0, filesize($file) - 512 * 1024));
            $lines = $content ? preg_split('/\R/', $content) : [];
            $id = 0;
            foreach ($lines as $line) {
                // Format: [2026-07-18 10:30:00] local.ERROR: message...
                if (preg_match('/^\[(.*?)\]\s+([\w-]+)\.(\w+):\s+(.*)$/', $line, $m)) {
                    $level = strtolower($m[3]);
                    $mapped = in_array($level, ['error', 'critical', 'alert', 'emergency']) ? 'error'
                        : (in_array($level, ['warning', 'notice']) ? 'warning' : 'info');
                    $entries[] = [
                        'id' => ++$id,
                        'timestamp' => str_replace(' ', 'T', $m[1]),
                        'level' => $mapped,
                        'channel' => $m[2],
                        'message' => mb_strimwidth($m[4], 0, 500, '…'),
                        'user' => null,
                        'ip_address' => null,
                    ];
                }
            }
        }

        // Newest first, cap to a reasonable number.
        $entries = array_slice(array_reverse($entries), 0, 200);

        return ApiResponse::ok($entries, 'System logs');
    }

    public function backups(): JsonResponse {
        $backups = [];
        if (File::isDirectory($this->backupDir())) {
            foreach (File::files($this->backupDir()) as $file) {
                $backups[] = [
                    'id' => sprintf('%u', crc32($file->getFilename())),
                    'filename' => $file->getFilename(),
                    'date' => date('c', $file->getMTime()),
                    'size' => $this->formatBytes($file->getSize()),
                    'type' => 'manual',
                    'status' => 'completed',
                ];
            }
        }
        // Newest first.
        usort($backups, fn ($a, $b) => strcmp($b['date'], $a['date']));

        return ApiResponse::ok($backups, 'Backups');
    }

    public function createBackup(): JsonResponse {
        // Perform a REAL mysqldump. Never report a fake success.
        $db = config('database.connections.' . config('database.default'));
        if (($db['driver'] ?? null) !== 'mysql') {
            return ApiResponse::fail('Automated backups are only supported for MySQL databases.', 'unsupported_driver', 422);
        }

        File::ensureDirectoryExists($this->backupDir());
        $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';
        $path = $this->backupDir() . DIRECTORY_SEPARATOR . $filename;

        // Locate mysqldump (env override, common XAMPP path, then PATH).
        $candidates = array_filter([
            env('MYSQLDUMP_PATH'),
            'C:\\xampp\\mysql\\bin\\mysqldump.exe',
            '/usr/bin/mysqldump',
            'mysqldump',
        ]);
        $binary = null;
        foreach ($candidates as $candidate) {
            if ($candidate === 'mysqldump' || @is_executable($candidate)) {
                $binary = $candidate;
                break;
            }
        }
        if (! $binary) {
            Log::error('Backup failed: mysqldump binary not found');
            return ApiResponse::fail('Could not create backup: mysqldump was not found on the server. Set MYSQLDUMP_PATH in .env.', 'mysqldump_missing', 500);
        }

        try {
            $process = new Process([
                $binary,
                '--host=' . ($db['host'] ?? '127.0.0.1'),
                '--port=' . ($db['port'] ?? '3306'),
                '--user=' . ($db['username'] ?? 'root'),
                '--password=' . ($db['password'] ?? ''),
                '--single-transaction',
                '--skip-lock-tables',
                $db['database'],
            ]);
            $process->setTimeout(300);
            $out = fopen($path, 'w');
            $process->run(function ($type, $buffer) use ($out) {
                if ($type === Process::OUT) {
                    fwrite($out, $buffer);
                }
            });
            fclose($out);

            if (! $process->isSuccessful()) {
                @unlink($path);
                Log::error('Backup failed: ' . $process->getErrorOutput());
                return ApiResponse::fail('Backup failed: ' . trim($process->getErrorOutput() ?: 'mysqldump returned an error.'), 'backup_failed', 500);
            }

            return ApiResponse::ok([
                'filename' => $filename,
                'size' => $this->formatBytes(filesize($path)),
                'created_at' => now()->toIso8601String(),
            ], 'Backup created successfully', 201);
        } catch (\Throwable $e) {
            @unlink($path);
            Log::error('Backup exception: ' . $e->getMessage());
            return ApiResponse::fail('Backup failed: ' . $e->getMessage(), 'backup_exception', 500);
        }
    }

    public function downloadBackup($id)
    {
        if (File::isDirectory($this->backupDir())) {
            foreach (File::files($this->backupDir()) as $file) {
                if (sprintf('%u', crc32($file->getFilename())) === (string) $id) {
                    return response()->download($file->getPathname());
                }
            }
        }
        return ApiResponse::fail('Backup not found.', 'not_found', 404);
    }

    public function restoreBackup($id): JsonResponse {
        // Restoring a database from the panel is destructive; require a manual, deliberate process.
        return ApiResponse::fail(
            'For safety, database restore is not available from the panel. Download the backup file and restore it manually.',
            'restore_disabled',
            403
        );
    }

    public function deleteBackup($id): JsonResponse {
        if (! File::isDirectory($this->backupDir())) {
            return ApiResponse::fail('Backup not found.', 'not_found', 404);
        }
        foreach (File::files($this->backupDir()) as $file) {
            if (sprintf('%u', crc32($file->getFilename())) === (string) $id) {
                File::delete($file->getPathname());
                return ApiResponse::ok(null, 'Backup deleted');
            }
        }
        return ApiResponse::fail('Backup not found.', 'not_found', 404);
    }

    public function cacheStats(): JsonResponse {
        return response()->json([
            'driver' => config('cache.default'),
            'key_count' => 0,
            'hit_rate' => 0,
            'memory_usage' => '0MB',
        ]);
    }

    public function clearCache(): JsonResponse {
        Artisan::call('cache:clear');
        return response()->json(['message' => 'Cache cleared successfully']);
    }

    public function warmCache(): JsonResponse {
        try {
            Artisan::call('config:cache');
            Artisan::call('route:cache');
            return ApiResponse::ok(null, 'Configuration and routes cached successfully');
        } catch (\Throwable $e) {
            return ApiResponse::fail('Failed to warm cache: '.$e->getMessage(), 'cache_warm_failed', 500);
        }
    }

    public function cacheGet($key): JsonResponse {
        $value = Cache::get($key);
        return response()->json(['key' => $key, 'value' => $value, 'exists' => Cache::has($key)]);
    }

    public function cacheForget($key): JsonResponse {
        Cache::forget($key);
        return response()->json(['message' => "Cache key '{$key}' deleted"]);
    }

    public function queueStats(): JsonResponse {
        $pending = 0;
        $failed = 0;
        try { $pending = DB::table('jobs')->count(); } catch (\Throwable) {}
        try { $failed = DB::table('failed_jobs')->count(); } catch (\Throwable) {}

        return ApiResponse::ok([
            'pending' => $pending,
            'failed' => $failed,
            'completed' => 0,
        ], 'Queue stats');
    }

    public function retryQueueJob($jobId): JsonResponse {
        try {
            Artisan::call('queue:retry', ['id' => [$jobId]]);
            return ApiResponse::ok(null, 'Job queued for retry');
        } catch (\Throwable $e) {
            return ApiResponse::fail('Failed to retry queue job: '.$e->getMessage(), 'retry_failed', 400);
        }
    }

    public function deleteQueueJob($jobId): JsonResponse {
        try {
            Artisan::call('queue:forget', ['id' => $jobId]);
            return ApiResponse::ok(null, 'Job deleted from failed queue');
        } catch (\Throwable $e) {
            return ApiResponse::fail('Failed to delete queue job: '.$e->getMessage(), 'delete_failed', 400);
        }
    }

    public function cronJobs(): JsonResponse {
        // These are the real scheduled commands configured for this application.
        return ApiResponse::ok([
            ['id' => 1, 'command' => 'schedule:run', 'frequency' => 'Every minute', 'last_run' => null, 'next_run' => null, 'is_active' => true],
            ['id' => 2, 'command' => 'queue:work --stop-when-empty', 'frequency' => 'Every 5 minutes', 'last_run' => null, 'next_run' => null, 'is_active' => true],
        ], 'Cron jobs');
    }

    public function runCronJob($id): JsonResponse {
        // Actually trigger the scheduler run.
        try {
            Artisan::call('schedule:run');
            return ApiResponse::ok(['output' => trim(Artisan::output())], 'Scheduler run triggered');
        } catch (\Throwable $e) {
            Log::error('runCronJob failed: ' . $e->getMessage());
            return ApiResponse::fail('Could not run the scheduler: ' . $e->getMessage(), 'schedule_failed', 500);
        }
    }

    public function toggleCronJob($id): JsonResponse {
        // Scheduled tasks are defined in code (routes/console.php), not toggleable at runtime.
        return ApiResponse::fail(
            'Cron jobs are defined in the application scheduler and cannot be enabled or disabled from the panel.',
            'not_toggleable',
            422
        );
    }

    /** Real import history, newest first, with a failure count per batch. */
    public function imports(Request $request): JsonResponse {
        $this->checkAdmin();
        $batches = \App\Models\ImportBatch::withCount('errors')
            ->latest()
            ->paginate((int) $request->input('per_page', 15));

        return response()->json($batches);
    }

    /** Per-row failure detail for one import batch. */
    public function importErrors($id): JsonResponse {
        $this->checkAdmin();
        $batch = \App\Models\ImportBatch::with(['errors' => fn ($q) => $q->orderBy('row_number')])
            ->findOrFail($id);

        return response()->json([
            'data' => [
                'batch' => $batch->only([
                    'id', 'file_name', 'format', 'status', 'total_rows',
                    'rows_imported', 'rows_failed', 'rows_without_email',
                    'column_map', 'detected_headers', 'created_at',
                ]),
                'errors' => $batch->errors,
            ],
        ]);
    }

    /** Download the failed rows as CSV so they can be corrected and re-uploaded. */
    public function downloadImportErrors($id) {
        $this->checkAdmin();
        $batch = \App\Models\ImportBatch::with('errors')->findOrFail($id);

        if ($batch->errors->isEmpty()) {
            return response()->json([
                'success' => false,
                'code' => 'no_errors',
                'message' => 'This import had no failed rows, so there is nothing to download.',
            ], 404);
        }

        $headers = $batch->detected_headers ?? [];
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, array_merge(['row_number', 'reason'], $headers));

        foreach ($batch->errors as $error) {
            $row = $error->row_data ?? [];
            fputcsv($handle, array_merge(
                [$error->row_number, $error->reason],
                array_map(fn ($h) => $row[$h] ?? '', $headers)
            ));
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="import-'.$batch->id.'-errors.csv"',
        ]);
    }

    /**
     * Re-running an import needs the original file, which is not retained.
     * Say so plainly instead of pretending a retry was queued.
     */
    public function retryImport($id): JsonResponse {
        $this->checkAdmin();
        $batch = \App\Models\ImportBatch::findOrFail($id);

        return ApiResponse::fail(
            'This import cannot be retried automatically because the original file is not stored. '
                .'Download the error report for batch #'.$batch->id.', correct the listed rows, and upload the file again.',
            'retry_unavailable',
            422
        );
    }
}
