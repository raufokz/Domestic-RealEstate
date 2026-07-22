<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaLibrary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaLibraryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MediaLibrary::query();

        if ($request->has('collection')) {
            $query->byCollection($request->collection);
        }
        if ($request->has('mime_type')) {
            $query->byMimeType($request->mime_type);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('file_name', 'like', "%{$search}%");
            });
        }

        $media = $query->latest()->paginate(20);
        return response()->json($media);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|max:10240',
            'collection' => 'nullable|string|max:255',
            'meta' => 'nullable|array',
            'meta.alt_text' => 'nullable|string|max:255',
            'meta.caption' => 'nullable|string|max:500',
        ]);

        $file = $request->file('file');
        $path = $file->store('media', 'public');

        $media = MediaLibrary::create([
            'name' => $file->getClientOriginalName(),
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'path' => $path,
            'disk' => 'public',
            'collection' => $validated['collection'] ?? 'default',
            'meta' => $validated['meta'] ?? null,
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json($media, 201);
    }

    public function show(int $id): JsonResponse
    {
        $media = MediaLibrary::findOrFail($id);
        return response()->json($media);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $media = MediaLibrary::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'collection' => 'nullable|string|max:255',
            'meta' => 'nullable|array',
            'meta.alt_text' => 'nullable|string|max:255',
            'meta.caption' => 'nullable|string|max:500',
        ]);

        $media->update($validated);
        return response()->json($media);
    }

    public function destroy(int $id): JsonResponse
    {
        $media = MediaLibrary::findOrFail($id);

        if (Storage::disk($media->disk)->exists($media->path)) {
            Storage::disk($media->disk)->delete($media->path);
        }

        $media->delete();
        return response()->json(['message' => 'Media deleted']);
    }

    public function getCollections(): JsonResponse
    {
        $collections = MediaLibrary::distinct()->pluck('collection')->filter()->values();
        return response()->json($collections);
    }
}
