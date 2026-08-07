<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Staff Portal — every query is strictly scoped to the signed-in user.
 * Access is enforced at the route level via `role:staff,admin,super_admin`.
 * Real data via LeadTask.assigned_to / Lead.assigned_to (the same columns
 * AgentPortalController already uses for the agent-side task/lead views).
 */
class StaffPortalController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $pendingTasks = LeadTask::where('assigned_to', $userId)->whereIn('status', ['pending', 'in_progress'])->count();
        $completedToday = LeadTask::where('assigned_to', $userId)->where('status', 'completed')
            ->whereDate('completed_at', now()->toDateString())->count();
        $assignedLeads = Lead::where('assigned_to', $userId)->count();

        $recentTasks = LeadTask::where('assigned_to', $userId)->with('lead')->latest()->limit(5)->get();

        return response()->json([
            'pending_tasks' => $pendingTasks,
            'assigned_leads' => $assignedLeads,
            'completed_today' => $completedToday,
            'recent_tasks' => $recentTasks->map(fn (LeadTask $t) => [
                'id' => $t->id,
                'title' => $t->title,
                'priority' => ucfirst($t->priority),
                'due' => optional($t->due_date)->format('M j, g:i A'),
                'status' => str($t->status)->headline(),
            ]),
        ]);
    }

    public function tasks(Request $request): JsonResponse
    {
        $query = LeadTask::where('assigned_to', $request->user()->id)->with(['lead', 'creator']);

        if ($request->filled('status')) $query->where('status', str_replace(' ', '_', strtolower($request->status)));
        if ($request->filled('priority')) $query->where('priority', strtolower($request->priority));

        $tasks = $query->orderBy('due_date')->get();

        return response()->json($tasks->map(fn (LeadTask $t) => [
            'id' => $t->id,
            'task' => $t->title,
            'priority' => ucfirst($t->priority),
            'due' => optional($t->due_date)->format('M j, g:i A'),
            'status' => str($t->status)->headline(),
            'assignedBy' => $t->creator?->name ?? 'System',
        ]));
    }

    public function updateTask(Request $request, int $id): JsonResponse
    {
        $task = LeadTask::where('assigned_to', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        $task->update([
            'status' => $validated['status'],
            'completed_at' => $validated['status'] === 'completed' ? now() : null,
        ]);

        return response()->json(['message' => 'Task updated.', 'data' => $task]);
    }
}
