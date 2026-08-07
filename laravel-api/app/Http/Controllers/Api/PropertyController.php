<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyFavorite;
use App\Models\PropertyImage;
use App\Models\Enquiry;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PropertyController extends Controller
{
    /** Roles allowed to create/manage property listings. */
    private const LISTING_ROLES = ['super_admin', 'admin', 'agent', 'broker', 'seller'];

    /** True if the user owns the property or is an admin. */
    private function canManage($user, Property $property): bool
    {
        return $property->realtor_id === $user->id
            || $property->broker_id === $user->id
            || $property->seller_id === $user->id
            || in_array($user->role, ['admin', 'super_admin']);
    }

    public function index(Request $request) {
        $query = Property::where('approval_status', 'approved')
            ->where('status', 'active')
            ->with(['propertyType', 'realtor', 'images']);

        if ($request->filled('city')) $query->where('city', $request->city);
        if ($request->filled('state')) $query->where('state', $request->state);
        if ($request->filled('zip')) $query->where('zip', $request->zip);
        if ($request->filled('type')) $query->where('property_type_id', $request->type);
        if ($request->filled('min_price')) $query->where('price', '>=', $request->min_price);
        if ($request->filled('max_price')) $query->where('price', '<=', $request->max_price);
        if ($request->filled('bedrooms')) $query->where('bedrooms', '>=', $request->bedrooms);
        if ($request->filled('bathrooms')) $query->where('bathrooms', '>=', $request->bathrooms);
        if ($request->filled('property_type')) $query->whereHas('propertyType', fn($q) => $q->where('slug', $request->property_type));
        if ($request->filled('price_type')) $query->where('price_type', $request->price_type);
        if ($request->boolean('open_house')) $query->whereNotNull('open_house_date')->where('open_house_date', '>=', now());
        if ($request->filled('featured')) $query->where('featured', true);
        if ($request->filled('premium')) $query->where('premium', true);

        $sortBy = $request->get('sort', 'created_at');
        $sortDir = $request->get('direction', 'desc');
        $allowedSorts = ['price', 'created_at', 'bedrooms', 'sqft', 'view_count'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        }

        $properties = $query->paginate($request->get('per_page', 12));
        return response()->json($properties);
    }

    /** Self-service "my listings" for a seller who self-lists (owns via seller_id) —
     * unlike index(), NOT filtered to approved+active so a seller can see their own
     * pending/rejected/draft listings too. */
    public function myListings(Request $request) {
        $user = $request->user();
        $query = Property::where('seller_id', $user->id)->with(['propertyType', 'images']);

        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('approval_status')) $query->where('approval_status', $request->approval_status);

        return response()->json($query->latest()->paginate($request->get('per_page', 12)));
    }

    public function featured() {
        $properties = cache()->remember('properties_featured', 3600, function () {
            return Property::where('featured', true)->where('approval_status', 'approved')
                ->where('status', 'active')->with(['propertyType', 'realtor', 'images'])
                ->limit(6)->get();
        });
        return response()->json($properties);
    }

    public function premium() {
        $properties = cache()->remember('properties_premium', 3600, function () {
            return Property::where('premium', true)->where('approval_status', 'approved')
                ->where('status', 'active')->with(['propertyType', 'realtor', 'images'])
                ->limit(12)->get();
        });
        return response()->json($properties);
    }

    public function search(Request $request) {
        $query = Property::where('approval_status', 'approved')->where('status', 'active');
        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('state', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('zip', 'like', "%{$search}%")
                  ->orWhere('neighborhood', 'like', "%{$search}%");
            });
        }
        return response()->json($query->with(['propertyType', 'realtor', 'images'])->paginate(12));
    }

    public function show($slug) {
        // Mirror index()'s visibility rule: a pending/rejected/inactive listing
        // must 404 publicly even though the slug is guessable, not render.
        $property = Property::where('slug', $slug)
            ->where('approval_status', 'approved')
            ->where('status', 'active')
            ->with(['propertyType', 'realtor.agentProfile', 'broker', 'comments.user', 'images'])
            ->firstOrFail();
        $property->increment('view_count');
        return response()->json($property);
    }

    public function store(Request $request) {
        if (!in_array($request->user()->role, self::LISTING_ROLES)) {
            return ApiResponse::fail(
                'Only agents, brokers, sellers, and admins can create listings.',
                'insufficient_role',
                403,
                reason: 'your account role cannot create property listings',
            );
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'property_type_id' => 'nullable|exists:property_types,id',
            'price' => 'required|numeric|min:0',
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'zip' => 'required|string',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|numeric|min:0',
            'sqft' => 'nullable|integer|min:0',
        ]);

        // A self-listing homeowner (role=seller) owns the listing via seller_id;
        // agents/brokers/admins keep the existing realtor_id ownership path.
        if ($request->user()->role === 'seller') {
            $validated['seller_id'] = $request->user()->id;
        } else {
            $validated['realtor_id'] = $request->user()->id;
        }
        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        $validated['uuid'] = \Illuminate\Support\Str::uuid();
        $validated['country'] = 'US';

        $property = Property::create($validated);
        return response()->json($property, 201);
    }

    /**
     * Bulk-import properties from CSV/XLSX/JSON with smart column auto-detection
     * (headers don't need to match exactly). Mirrors LeadController::import's
     * shape — one ImportBatch per run, per-row failures recorded so a handful of
     * bad rows never blocks the good ones.
     */
    public function import(Request $request) {
        if (!in_array($request->user()->role, self::LISTING_ROLES)) {
            return ApiResponse::fail(
                'Only agents, brokers, and admins can import listings.',
                'insufficient_role',
                403,
                reason: 'your account role cannot bulk-import property listings',
            );
        }

        $request->validate([
            'file' => 'required|file|max:10240',
            'column_map' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension());

        try {
            [$headers, $rows] = \App\Services\TabularImportService::read($file, $ext);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'code' => 'unreadable_file',
                'message' => 'That file could not be read.',
                'reason' => $e->getMessage(),
                'fix' => 'Save the file as CSV, XLSX, or JSON and upload it again.',
            ], 422);
        }

        if ($headers === [] || $rows === []) {
            return response()->json([
                'success' => false,
                'code' => 'empty_file',
                'message' => 'The uploaded file contains no data rows.',
                'reason' => 'no header row or no data rows were found',
                'fix' => 'Add a header row and at least one data row, then upload again.',
            ], 422);
        }

        $map = \App\Services\ImportColumnMapper::detect($headers, $rows, \App\Services\ImportColumnMapper::PROPERTY_ALIASES);

        if ($request->filled('column_map')) {
            $customMap = json_decode($request->input('column_map'), true);
            if (is_array($customMap)) {
                foreach ($customMap as $field => $headerName) {
                    if ($headerName && in_array($headerName, $headers, true)) {
                        $map[$field] = $headerName;
                    }
                }
            }
        }

        $batch = \App\Models\ImportBatch::create([
            'import_type' => 'properties',
            'file_name' => $file->getClientOriginalName(),
            'format' => $ext,
            'status' => 'processing',
            'column_map' => $map,
            'detected_headers' => $headers,
            'total_rows' => count($rows),
            'created_by' => $request->user()?->id,
            'started_at' => now(),
        ]);

        $index = array_flip($headers);
        $imported = 0;
        $failed = 0;
        $requiredFields = ['title', 'description', 'price', 'address', 'city', 'state', 'zip'];

        foreach ($rows as $i => $row) {
            $rowNumber = $i + 2; // +1 for zero-index, +1 for the header row
            $value = fn (?string $field) => $field !== null && isset($index[$field])
                ? trim((string) ($row[$index[$field]] ?? ''))
                : null;

            $data = [];
            foreach ($requiredFields as $field) {
                $data[$field] = $value($map[$field] ?? null);
            }

            $missing = array_values(array_filter($requiredFields, fn ($f) => !$data[$f]));
            if ($missing !== []) {
                $failed++;
                \App\Services\TabularImportService::recordRowError(
                    $batch,
                    $rowNumber,
                    'missing_required_field',
                    'Missing required field(s): '.implode(', ', $missing).'.',
                    $headers,
                    $row
                );
                continue;
            }

            if (!is_numeric($data['price'])) {
                $failed++;
                \App\Services\TabularImportService::recordRowError(
                    $batch,
                    $rowNumber,
                    'invalid_price',
                    '"'.$data['price'].'" is not a valid price.',
                    $headers,
                    $row
                );
                continue;
            }

            $realtorId = $request->user()->id;
            $emailValue = $value($map['email'] ?? null);
            if ($emailValue) {
                $matchedUser = \App\Models\User::where('email', $emailValue)
                    ->whereIn('role', ['agent', 'broker'])
                    ->first();
                if ($matchedUser) {
                    $realtorId = $matchedUser->id;
                }
            }

            $typeText = $value($map['property_type'] ?? null);
            $propertyTypeId = \App\Services\PropertyTypeResolver::resolve($typeText);
            if ($typeText && !$propertyTypeId) {
                // Soft warning only — the row still imports without a type.
                \App\Services\TabularImportService::recordRowError(
                    $batch,
                    $rowNumber,
                    'property_type_unmapped',
                    '"'.$typeText.'" did not match any known property type — imported without one.',
                    $headers,
                    $row
                );
            }

            try {
                Property::create([
                    'title' => $data['title'],
                    'description' => $data['description'],
                    'price' => (float) $data['price'],
                    'address' => $data['address'],
                    'city' => $data['city'],
                    'state' => $data['state'],
                    'zip' => $data['zip'],
                    'bedrooms' => $this->toNullableInt($value($map['bedrooms'] ?? null)),
                    'bathrooms' => $this->toNullableFloat($value($map['bathrooms'] ?? null)),
                    'sqft' => $this->toNullableInt($value($map['sqft'] ?? null)),
                    'property_type_id' => $propertyTypeId,
                    'realtor_id' => $realtorId,
                    'country' => 'US',
                ]);
                $imported++;
            } catch (\Throwable $e) {
                $failed++;
                \App\Services\TabularImportService::recordRowError($batch, $rowNumber, 'save_failed', $e->getMessage(), $headers, $row);
            }
        }

        $batch->update([
            'status' => $failed > 0 ? 'completed_with_errors' : 'completed',
            'rows_imported' => $imported,
            'rows_failed' => $failed,
            'completed_at' => now(),
        ]);

        $message = "Imported {$imported} propert".($imported === 1 ? 'y' : 'ies').'.';
        if ($failed > 0) {
            $message .= " {$failed} row(s) had issues — download the error report for details.";
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'batch_id' => $batch->id,
            'count' => $imported,
            'errors' => $failed,
            'column_map' => $map,
        ]);
    }

    private function toNullableInt(?string $value): ?int {
        return $value !== null && $value !== '' && is_numeric($value) ? (int) $value : null;
    }

    private function toNullableFloat(?string $value): ?float {
        return $value !== null && $value !== '' && is_numeric($value) ? (float) $value : null;
    }

    public function update(Request $request, $id) {
        $property = Property::findOrFail($id);
        if (!$this->canManage($request->user(), $property)) {
            return ApiResponse::fail(
                'You do not have permission to manage this property.',
                'insufficient_role',
                403,
                reason: 'you are not the owner of this listing and are not an admin',
            );
        }
        $restricted = ['approval_status', 'featured', 'premium', 'view_count', 'inquiry_count', 'realtor_id', 'broker_id', 'seller_id', 'uuid', 'slug'];
        $blocked = in_array($request->user()->role, ['admin', 'super_admin'])
            ? ['uuid', 'slug', 'view_count', 'inquiry_count']
            : $restricted;
        $allowed = array_values(array_diff($property->getFillable(), $blocked));
        $property->update($request->only($allowed));
        return response()->json($property);
    }

    public function destroy(Request $request, $id) {
        $property = Property::findOrFail($id);
        if (!$this->canManage($request->user(), $property)) {
            return ApiResponse::fail(
                'You do not have permission to manage this property.',
                'insufficient_role',
                403,
                reason: 'you are not the owner of this listing and are not an admin',
            );
        }
        $property->delete();
        return response()->json(['message' => 'Property deleted']);
    }

    public function uploadImages(Request $request, $id) {
        $property = Property::findOrFail($id);
        if (!$this->canManage($request->user(), $property)) {
            return ApiResponse::fail(
                'You do not have permission to manage this property.',
                'insufficient_role',
                403,
                reason: 'you are not the owner of this listing and are not an admin',
            );
        }
        $request->validate(['images' => 'required|array', 'images.*' => 'image|max:5120']);

        $hasExisting = $property->images()->exists();
        $nextOrder = (int) ($property->images()->max('sort_order') ?? -1) + 1;

        $created = [];
        foreach ($request->file('images') as $i => $image) {
            $path = $image->store('properties', 'public');
            $created[] = PropertyImage::create([
                'property_id' => $property->id,
                'path' => $path,
                'original_name' => $image->getClientOriginalName(),
                'mime_type' => $image->getClientMimeType(),
                'size' => $image->getSize(),
                'is_featured' => !$hasExisting && $i === 0,
                'sort_order' => $nextOrder + $i,
            ]);
        }

        return response()->json(['data' => $created], 201);
    }

    public function destroyImage(Request $request, $propertyId, $imageId) {
        $property = Property::findOrFail($propertyId);
        if (!$this->canManage($request->user(), $property)) {
            return ApiResponse::fail(
                'You do not have permission to manage this property.',
                'insufficient_role',
                403,
                reason: 'you are not the owner of this listing and are not an admin',
            );
        }
        $image = PropertyImage::where('property_id', $propertyId)->findOrFail($imageId);
        if (Storage::disk('public')->exists($image->path)) {
            Storage::disk('public')->delete($image->path);
        }
        $wasFeatured = $image->is_featured;
        $image->delete();

        if ($wasFeatured) {
            $next = $property->images()->first();
            if ($next) {
                $next->update(['is_featured' => true]);
            }
        }

        return response()->json(['message' => 'Image deleted']);
    }

    public function setPrimaryImage(Request $request, $propertyId, $imageId) {
        $property = Property::findOrFail($propertyId);
        if (!$this->canManage($request->user(), $property)) {
            return ApiResponse::fail(
                'You do not have permission to manage this property.',
                'insufficient_role',
                403,
                reason: 'you are not the owner of this listing and are not an admin',
            );
        }
        $image = PropertyImage::where('property_id', $propertyId)->findOrFail($imageId);

        DB::transaction(function () use ($property, $image) {
            $property->images()->where('id', '!=', $image->id)->update(['is_featured' => false]);
            $image->update(['is_featured' => true]);
        });

        return response()->json(['message' => 'Cover photo updated']);
    }

    public function reorderImages(Request $request, $propertyId) {
        $property = Property::findOrFail($propertyId);
        if (!$this->canManage($request->user(), $property)) {
            return ApiResponse::fail(
                'You do not have permission to manage this property.',
                'insufficient_role',
                403,
                reason: 'you are not the owner of this listing and are not an admin',
            );
        }
        $validated = $request->validate(['order' => 'required|array', 'order.*' => 'integer']);

        DB::transaction(function () use ($property, $validated) {
            foreach ($validated['order'] as $index => $imageId) {
                PropertyImage::where('property_id', $property->id)
                    ->where('id', $imageId)
                    ->update(['sort_order' => $index]);
            }
        });

        return response()->json(['message' => 'Order updated']);
    }

    public function toggleFavorite(Request $request, $id) {
        $property = Property::findOrFail($id);
        $existing = PropertyFavorite::where('user_id', $request->user()->id)->where('property_id', $id)->first();
        if ($existing) {
            $existing->delete();
            return response()->json(['favorited' => false]);
        }
        PropertyFavorite::create(['user_id' => $request->user()->id, 'property_id' => $id]);
        return response()->json(['favorited' => true]);
    }

    public function analytics(Request $request, $id) {
        $property = Property::findOrFail($id);
        if (!$this->canManage($request->user(), $property)) {
            return ApiResponse::fail(
                'You do not have permission to manage this property.',
                'insufficient_role',
                403,
                reason: 'you are not the owner of this listing and are not an admin',
            );
        }
        return response()->json($property->analytics()->orderBy('date', 'desc')->limit(30)->get());
    }

    public function inquiry(Request $request, $id) {
        $request->validate(['name' => 'required', 'email' => 'required|email', 'message' => 'required']);
        Enquiry::create(array_merge($request->only(['name', 'email', 'phone', 'message']), [
            'property_id' => $id,
            'type' => 'property',
            'source_page' => url()->current(),
        ]));
        $property = Property::findOrFail($id);
        $property->increment('inquiry_count');

        \App\Services\LeadCaptureService::upsert([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->input('phone'),
            'source' => 'property_inquiry',
            'type' => 'buyer',
            'notes' => 'Inquiry on property #'.$id.': '.$request->message,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'page_url' => $request->header('referer', ''),
        ]);

        return response()->json(['message' => 'Inquiry submitted successfully'], 201);
    }
}
