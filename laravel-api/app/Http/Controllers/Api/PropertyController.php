<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyFavorite;
use App\Models\Enquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PropertyController extends Controller
{
    public function index(Request $request) {
        $query = Property::where('approval_status', 'approved')
            ->where('status', 'active')
            ->with(['propertyType', 'realtor']);

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

    public function featured() {
        return response()->json(
            Property::where('featured', true)->where('approval_status', 'approved')
                ->where('status', 'active')->with(['propertyType', 'realtor'])
                ->limit(6)->get()
        );
    }

    public function premium() {
        return response()->json(
            Property::where('premium', true)->where('approval_status', 'approved')
                ->where('status', 'active')->with(['propertyType', 'realtor'])
                ->limit(12)->get()
        );
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
        return response()->json($query->with(['propertyType', 'realtor'])->paginate(12));
    }

    public function show($slug) {
        $property = Property::where('slug', $slug)
            ->with(['propertyType', 'realtor.agentProfile', 'broker', 'comments.user'])
            ->firstOrFail();
        $property->increment('view_count');
        return response()->json($property);
    }

    public function store(Request $request) {
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

        $validated['realtor_id'] = $request->user()->id;
        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        $validated['uuid'] = \Illuminate\Support\Str::uuid();
        $validated['country'] = 'US';

        $property = Property::create($validated);
        return response()->json($property, 201);
    }

    public function update(Request $request, $id) {
        $property = Property::findOrFail($id);
        if ($property->realtor_id !== $request->user()->id && !$request->user()->hasRole('super_admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $property->update($request->all());
        return response()->json($property);
    }

    public function destroy(Request $request, $id) {
        $property = Property::findOrFail($id);
        if ($property->realtor_id !== $request->user()->id && !$request->user()->hasRole('super_admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $property->delete();
        return response()->json(['message' => 'Property deleted']);
    }

    public function uploadImages(Request $request, $id) {
        $request->validate(['images' => 'required|array', 'images.*' => 'image|max:5120']);
        $property = Property::findOrFail($id);
        $photos = $property->photos ?? [];
        foreach ($request->file('images') as $image) {
            $photos[] = $image->store('properties', 'public');
        }
        $property->update(['photos' => $photos]);
        return response()->json(['photos' => $photos]);
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
