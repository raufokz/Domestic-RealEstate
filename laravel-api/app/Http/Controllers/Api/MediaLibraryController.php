<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaLibrary;
use App\Services\ImageProcessingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaLibraryController extends Controller
{
    public function __construct(protected ImageProcessingService $imageProcessor)
    {
    }

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
            // Previously accepted ANY file type up to 10MB — closed to a
            // whitelist covering this library's real uses (images, docs,
            // spreadsheets, PDFs, video) so it can't be used to stash
            // executables/scripts on the server.
            'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,webp,svg,pdf,doc,docx,xls,xlsx,ppt,pptx,csv,txt,mp4,mov',
            'collection' => 'nullable|string|max:255',
            'meta' => 'nullable|array',
            'meta.alt_text' => 'nullable|string|max:255',
            'meta.caption' => 'nullable|string|max:500',
        ]);

        $file = $request->file('file');
        $attributes = [
            'name' => $file->getClientOriginalName(),
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'disk' => 'public',
            'collection' => $validated['collection'] ?? 'default',
            'meta' => $validated['meta'] ?? null,
            'uploaded_by' => $request->user()->id,
        ];

        if ($this->imageProcessor->isProcessableImage($file)) {
            $processed = $this->imageProcessor->process($file, 'public', 'media');
            $attributes['path'] = $processed['path'];
            $attributes['webp_path'] = $processed['webp_path'];
            $attributes['width'] = $processed['width'];
            $attributes['height'] = $processed['height'];
            $attributes['size'] = $processed['size'];
        } else {
            $attributes['path'] = $file->store('media', 'public');
            $attributes['size'] = $file->getSize();
        }

        $media = MediaLibrary::create($attributes);

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
        $this->deleteFiles($media);
        $media->delete();
        return response()->json(['message' => 'Media deleted']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate(['ids' => 'required|array|min:1', 'ids.*' => 'integer']);

        $items = MediaLibrary::whereIn('id', $validated['ids'])->get();
        foreach ($items as $media) {
            $this->deleteFiles($media);
            $media->delete();
        }

        return response()->json(['message' => count($items) . ' file(s) deleted']);
    }

    protected function deleteFiles(MediaLibrary $media): void
    {
        if (Storage::disk($media->disk)->exists($media->path)) {
            Storage::disk($media->disk)->delete($media->path);
        }
        if ($media->webp_path && Storage::disk($media->disk)->exists($media->webp_path)) {
            Storage::disk($media->disk)->delete($media->webp_path);
        }
    }

    public function getCollections(): JsonResponse
    {
        $collections = MediaLibrary::distinct()->pluck('collection')->filter()->values();
        return response()->json($collections);
    }
}
