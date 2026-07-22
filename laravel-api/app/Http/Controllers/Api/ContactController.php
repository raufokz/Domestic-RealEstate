<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\ContactGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $query = Contact::with('groups');
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('type')) $query->whereJsonContains('type', $request->type);
        if ($request->filled('source')) $query->where('source', $request->source);
        return response()->json($query->latest()->paginate($request->get('per_page', 20)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|email',
            'phone'      => 'nullable|string',
        ]);

        $contact = Contact::create(array_merge(
            $request->only(['first_name', 'last_name', 'email', 'phone', 'type', 'status', 'source', 'company', 'address', 'city', 'state', 'zip', 'notes', 'tags', 'assigned_to']),
            $validated
        ));

        if ($request->filled('group_ids')) {
            $contact->groups()->sync($request->group_ids);
        }

        return response()->json($contact->load('groups'), 201);
    }

    public function show($id)
    {
        return response()->json(Contact::with(['groups', 'assignee'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $contact = Contact::findOrFail($id);
        $contact->update($request->only(['first_name', 'last_name', 'email', 'phone', 'type', 'status', 'source', 'company', 'address', 'city', 'state', 'zip', 'tags', 'assigned_to']));

        if ($request->has('group_ids')) {
            $contact->groups()->sync($request->group_ids);
        }

        return response()->json($contact->load('groups'));
    }

    public function destroy($id)
    {
        Contact::findOrFail($id)->delete();
        return response()->json(['message' => 'Contact deleted']);
    }

    public function stats()
    {
        return response()->json([
            'total'         => Contact::count(),
            'active'        => Contact::where('status', 'active')->count(),
            'unsubscribed'  => Contact::where('status', 'unsubscribed')->count(),
            'by_source'     => Contact::select('source', DB::raw('COUNT(*) as count'))
                                ->groupBy('source')
                                ->get(),
        ]);
    }

    public function groups()
    {
        return response()->json(ContactGroup::withCount('contacts')->orderBy('name')->get());
    }

    public function storeGroup(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $group = ContactGroup::create([
            'name'        => $request->name,
            'description' => $request->description,
        ]);
        return response()->json($group, 201);
    }

    public function updateGroup(Request $request, $id)
    {
        $group = ContactGroup::findOrFail($id);
        $group->update($request->only(['name', 'description']));
        return response()->json($group);
    }

    public function destroyGroup($id)
    {
        ContactGroup::findOrFail($id)->delete();
        return response()->json(['message' => 'Group deleted']);
    }
}
