<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgentDocument;
use App\Models\AgentProfile;
use App\Models\Enquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AgentController extends Controller
{
    public function index(Request $request) {
        $query = AgentProfile::where('is_published', true)->where('status', 'approved')
            ->with('user');
        if ($request->filled('city')) $query->where('office_city', $request->city);
        if ($request->filled('state')) $query->where('office_state', $request->state);
        if ($request->filled('specialty')) $query->whereJsonContains('specialties', $request->specialty);
        $agents = $query->orderBy('rating', 'desc')->paginate($request->get('per_page', 12));
        return response()->json($agents);
    }

    public function featured() {
        return response()->json(
            AgentProfile::where('is_featured', true)->where('status', 'approved')
                ->with('user')->limit(6)->get()
        );
    }

    public function show($slug) {
        return response()->json(
            AgentProfile::where('slug', $slug)->with(['user', 'documents'])->firstOrFail()
        );
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'headline' => 'required|string',
            'bio' => 'required|string',
            'license_number' => 'required|string',
            'brokerage_name' => 'nullable|string',
        ]);
        $validated['slug'] = \Illuminate\Support\Str::slug($request->user()->name) . '-' . \Illuminate\Support\Str::random(5);
        $validated['user_id'] = $request->user()->id;
        $profile = AgentProfile::create($validated);
        return response()->json($profile, 201);
    }

    public function update(Request $request, $id) {
        $profile = AgentProfile::findOrFail($id);
        if ($profile->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $profile->update($request->all());
        return response()->json($profile);
    }

    public function uploadDocument(Request $request, $id) {
        $request->validate([
            'document' => 'required|file|max:10240',
            'document_type' => 'required|in:license,certification,insurance,bio_photo,other',
        ]);
        $path = $request->file('document')->store('agent-documents', 'public');
        $doc = \App\Models\AgentDocument::create([
            'agent_id' => $id,
            'document_type' => $request->document_type,
            'file_url' => $path,
            'original_name' => $request->file('document')->getClientOriginalName(),
            'uploaded_at' => now(),
        ]);
        return response()->json($doc, 201);
    }

    public function contact(Request $request, $id) {
        $request->validate(['name' => 'required', 'email' => 'required|email', 'message' => 'required']);
        $enquiry = Enquiry::create(array_merge($request->only(['name', 'email', 'phone', 'message']), [
            'agent_id' => $id,
            'type' => 'agent',
        ]));
        return response()->json(['message' => 'Message sent successfully'], 201);
    }

    /** Resolve the AgentProfile owned by the signed-in user, or null. */
    private function currentAgentProfile(Request $request): ?AgentProfile
    {
        return AgentProfile::where('user_id', $request->user()->id)->first();
    }

    /** List the signed-in agent's own documents. */
    public function myDocuments(Request $request)
    {
        $profile = $this->currentAgentProfile($request);
        if (!$profile) {
            return response()->json(['data' => []]);
        }
        $docs = AgentDocument::where('agent_id', $profile->id)->latest('uploaded_at')->latest()->get();
        return response()->json(['data' => $docs]);
    }

    /** Upload a document for the signed-in agent. */
    public function storeMyDocument(Request $request)
    {
        $profile = $this->currentAgentProfile($request);
        if (!$profile) {
            return response()->json(['success' => false, 'message' => 'No agent profile is linked to your account.'], 403);
        }
        $request->validate([
            'document' => 'required|file|max:10240',
            'document_type' => 'required|in:license,certification,insurance,bio_photo,other',
        ]);
        $path = $request->file('document')->store('agent-documents', 'public');
        $doc = AgentDocument::create([
            'agent_id' => $profile->id,
            'document_type' => $request->document_type,
            'file_url' => $path,
            'original_name' => $request->file('document')->getClientOriginalName(),
            'uploaded_at' => now(),
            'status' => 'pending',
        ]);
        return response()->json(['message' => 'Document uploaded', 'data' => $doc], 201);
    }

    /** Download one of the signed-in agent's own documents. */
    public function downloadMyDocument(Request $request, $id)
    {
        $profile = $this->currentAgentProfile($request);
        if (!$profile) {
            return response()->json(['success' => false, 'message' => 'No agent profile is linked to your account.'], 403);
        }
        $doc = AgentDocument::where('agent_id', $profile->id)->findOrFail($id);
        if (!$doc->file_url || !Storage::disk('public')->exists($doc->file_url)) {
            return response()->json(['success' => false, 'message' => 'File not found'], 404);
        }
        return Storage::disk('public')->download($doc->file_url, $doc->original_name ?? basename($doc->file_url));
    }

    /** Delete one of the signed-in agent's own documents. */
    public function destroyMyDocument(Request $request, $id)
    {
        $profile = $this->currentAgentProfile($request);
        if (!$profile) {
            return response()->json(['success' => false, 'message' => 'No agent profile is linked to your account.'], 403);
        }
        $doc = AgentDocument::where('agent_id', $profile->id)->findOrFail($id);
        if ($doc->file_url && Storage::disk('public')->exists($doc->file_url)) {
            Storage::disk('public')->delete($doc->file_url);
        }
        $doc->delete();
        return response()->json(['message' => 'Document deleted']);
    }
}
