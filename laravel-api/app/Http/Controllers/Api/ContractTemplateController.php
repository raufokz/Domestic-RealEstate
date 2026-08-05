<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContractTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContractTemplateController extends Controller
{
    private function checkAdmin(): void
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['admin', 'super_admin'], true)) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    public function index(): JsonResponse
    {
        $this->checkAdmin();

        return response()->json(ContractTemplate::orderByDesc('created_at')->get());
    }

    public function show(int $id): JsonResponse
    {
        $this->checkAdmin();

        return response()->json(ContractTemplate::findOrFail($id));
    }

    public function store(Request $request): JsonResponse
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'html' => 'required|string',
            'merge_fields' => 'nullable|array',
        ]);

        $template = ContractTemplate::create($validated + ['created_by' => Auth::id()]);

        return response()->json($template, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $this->checkAdmin();

        $template = ContractTemplate::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'html' => 'sometimes|string',
            'merge_fields' => 'nullable|array',
        ]);

        $template->update($validated);

        return response()->json($template);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->checkAdmin();

        ContractTemplate::findOrFail($id)->delete();

        return response()->json(['message' => 'Template deleted.']);
    }
}
