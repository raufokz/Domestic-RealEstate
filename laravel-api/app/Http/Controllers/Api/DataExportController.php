<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessDataExport;
use App\Models\DataExport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DataExportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DataExport::where('created_by', $request->user()->id);

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        $exports = $query->latest()->paginate(20);
        return response()->json($exports);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'export_type' => 'required|string|in:leads,properties,users,contacts,blogs,deals,invoices,agent_leads',
            'format' => 'nullable|string|in:csv,xlsx,pdf',
            'filters' => 'nullable|array',
        ]);

        $export = DataExport::create([
            ...$validated,
            'format' => $validated['format'] ?? 'csv',
            'status' => 'pending',
            'created_by' => $request->user()->id,
        ]);

        // Actually generate the file. Previously the row was created and never processed.
        ProcessDataExport::dispatch($export->id);

        return response()->json($export, 201);
    }

    public function download(int $id): JsonResponse
    {
        $export = DataExport::where('created_by', request()->user()->id)->findOrFail($id);

        if ($export->status !== 'completed' || !$export->file_path) {
            return response()->json(['message' => 'Export not ready'], 404);
        }

        if (!Storage::exists($export->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::download($export->file_path);
    }

    public function destroy(int $id): JsonResponse
    {
        $export = DataExport::where('created_by', request()->user()->id)->findOrFail($id);

        if ($export->file_path && Storage::exists($export->file_path)) {
            Storage::delete($export->file_path);
        }

        $export->delete();
        return response()->json(['message' => 'Export deleted']);
    }
}
