<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

/**
 * Shared CRUD + CSV import/export for GeoWhitelistEntry and GeoBlacklistEntry
 * — same shape (value/is_cidr/note/country_code/status/expires_at), only the
 * model class and cache key differ. Kept as a trait rather than two ~150
 * line copies since GeoWhitelistController and GeoBlacklistController are
 * otherwise identical.
 */
trait GeoListEntryCrud
{
    /** @return class-string */
    abstract protected function model(): string;

    abstract protected function cacheKey(): string;

    abstract protected function label(): string;

    private function checkAdmin(): void
    {
        $user = Auth::user();
        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $this->checkAdmin();
        $model = $this->model();

        $query = $model::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('value', 'like', "%{$search}%")
                    ->orWhere('note', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $perPage = min((int) $request->get('per_page', 20), 100);
        $entries = $query->orderByDesc('created_at')->paginate($perPage);

        // Flat paginator shape (not wrapped in {success,data}), matching
        // BlogController::adminIndex's convention that AdminDataTable expects.
        return response()->json($entries);
    }

    public function store(Request $request): JsonResponse
    {
        $this->checkAdmin();
        $model = $this->model();

        $validated = $this->validated($request, $model, null);
        $validated['created_by'] = Auth::id();

        $entry = $model::create($validated);
        Cache::forget($this->cacheKey());

        return ApiResponse::ok($entry, ucfirst($this->label()) . ' entry created', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $this->checkAdmin();
        $model = $this->model();
        $entry = $model::findOrFail($id);

        $validated = $this->validated($request, $model, $id);
        $entry->update($validated);
        Cache::forget($this->cacheKey());

        return ApiResponse::ok($entry, ucfirst($this->label()) . ' entry updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $this->checkAdmin();
        $model = $this->model();
        $entry = $model::findOrFail($id);
        $entry->delete();
        Cache::forget($this->cacheKey());

        return ApiResponse::ok(null, ucfirst($this->label()) . ' entry deleted');
    }

    private function validated(Request $request, string $model, ?int $ignoreId): array
    {
        $table = (new $model())->getTable();
        $uniqueRule = $ignoreId ? "unique:{$table},value,{$ignoreId}" : "unique:{$table},value";

        return $request->validate([
            'value' => ['required', 'string', 'max:100', $uniqueRule],
            'is_cidr' => 'sometimes|boolean',
            'note' => 'sometimes|nullable|string|max:255',
            'country_code' => 'sometimes|nullable|string|size:2',
            'status' => 'sometimes|in:active,disabled',
            'expires_at' => 'sometimes|nullable|date',
        ]);
    }

    public function export(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->checkAdmin();
        $model = $this->model();
        $entries = $model::query()->orderBy('value')->get();

        $filename = $this->label() . '-' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($entries) {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['value', 'is_cidr', 'note', 'country_code', 'status', 'expires_at']);
            foreach ($entries as $entry) {
                fputcsv($output, [
                    $entry->value,
                    $entry->is_cidr ? '1' : '0',
                    $entry->note,
                    $entry->country_code,
                    $entry->status,
                    optional($entry->expires_at)->toDateString(),
                ]);
            }
            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function import(Request $request): JsonResponse
    {
        $this->checkAdmin();
        $model = $this->model();

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $handle = fopen($request->file('file')->getRealPath(), 'r');
        $header = fgetcsv($handle);
        $imported = 0;
        $skipped = 0;

        while (($row = fgetcsv($handle)) !== false) {
            $data = array_combine($header, array_pad($row, count($header), null));
            if (empty($data['value'])) {
                $skipped++;
                continue;
            }

            $model::updateOrCreate(
                ['value' => trim($data['value'])],
                [
                    'is_cidr' => in_array($data['is_cidr'] ?? '', ['1', 'true', 'yes'], true) || str_contains($data['value'], '/'),
                    'note' => $data['note'] ?? null,
                    'country_code' => !empty($data['country_code']) ? strtoupper($data['country_code']) : null,
                    'status' => in_array($data['status'] ?? 'active', ['active', 'disabled'], true) ? $data['status'] : 'active',
                    'expires_at' => !empty($data['expires_at']) ? $data['expires_at'] : null,
                    'created_by' => Auth::id(),
                ]
            );
            $imported++;
        }
        fclose($handle);

        Cache::forget($this->cacheKey());

        return ApiResponse::ok(['imported' => $imported, 'skipped' => $skipped], 'Import complete');
    }
}
