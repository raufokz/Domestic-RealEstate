<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadNote;
use App\Models\LeadTask;
use App\Models\LeadAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LeadController extends Controller
{
    public function index(Request $request) {
        $query = Lead::with(['assignee', 'realtor']);
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('type')) $query->where('type', $request->type);
        if ($request->filled('priority')) $query->where('priority', $request->priority);
        if ($request->filled('assigned_to')) $query->where('assigned_to', $request->assigned_to);
        $leads = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 25));
        return response()->json($leads);
    }

    /**
     * Public homepage / form lead capture (no auth).
     * Extra preference fields are folded into notes.
     */
    public function capture(Request $request) {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:50',
            'type' => 'nullable|in:buyer,seller,investor,realtor,vendor',
            'source' => 'nullable|string|max:100',
            'budget_min' => 'nullable|numeric',
            'budget_max' => 'nullable|numeric',
            'timeline' => 'nullable|string|max:255',
            'motivation' => 'nullable|string|max:2000',
            'notes' => 'nullable|string|max:5000',
            'location' => 'nullable|string|max:255',
            'bedrooms' => 'nullable|integer',
            'property_type' => 'nullable|string|max:100',
        ]);

        $extra = [];
        if (!empty($validated['location'])) $extra[] = 'Location: '.$validated['location'];
        if (!empty($validated['bedrooms'])) $extra[] = 'Bedrooms: '.$validated['bedrooms'];
        if (!empty($validated['property_type'])) $extra[] = 'Property type: '.$validated['property_type'];
        unset($validated['location'], $validated['bedrooms'], $validated['property_type']);

        $notes = trim(($validated['notes'] ?? '').(count($extra) ? "\n".implode(' | ', $extra) : ''));
        $validated['last_name'] = $validated['last_name'] ?? '';
        $validated['type'] = $validated['type'] ?? 'buyer';
        $validated['source'] = $validated['source'] ?? 'website_form';
        $validated['notes'] = $notes ?: null;
        $validated['lead_number'] = 'LEAD-' . strtoupper(Str::random(8));
        $validated['normalized_email'] = strtolower($validated['email']);
        $validated['normalized_phone'] = !empty($validated['phone']) ? preg_replace('/[^\d]/', '', $validated['phone']) : null;
        $validated['ip_address'] = $request->ip();
        $validated['user_agent'] = $request->userAgent();
        $validated['page_url'] = $request->header('referer', '');

        $existing = Lead::where('normalized_email', $validated['normalized_email'])->first();
        if ($existing) {
            $existing->update([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'] ?: $existing->last_name,
                'phone' => $validated['phone'] ?? $existing->phone,
                'budget_min' => $validated['budget_min'] ?? $existing->budget_min,
                'budget_max' => $validated['budget_max'] ?? $existing->budget_max,
                'timeline' => $validated['timeline'] ?? $existing->timeline,
                'motivation' => $validated['motivation'] ?? $existing->motivation,
                'notes' => trim(($existing->notes ? $existing->notes."\n" : '').($notes ?: 'Updated via public form')),
            ]);
            LeadActivity::create([
                'lead_id' => $existing->id,
                'type' => 'updated',
                'description' => 'Lead updated from public form ('.$validated['source'].')',
                'performed_by' => null,
            ]);
            return response()->json(['data' => $existing->fresh(), 'message' => 'Lead updated', 'created' => false], 200);
        }

        $lead = Lead::create($validated);

        if (class_exists(\App\Models\AuditLog::class)) {
            \App\Models\AuditLog::log('lead.created', 'lead', $lead->id, null, $request->only(['email', 'first_name', 'last_name']));
        }

        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'created',
            'description' => 'Lead created from ' . ($validated['source'] ?? 'website_form'),
            'performed_by' => null,
        ]);

        return response()->json(['data' => $lead, 'message' => 'Lead created', 'created' => true], 201);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'type' => 'nullable|in:buyer,seller,investor,realtor,vendor',
            'source' => 'nullable|string',
            'budget_min' => 'nullable|numeric',
            'budget_max' => 'nullable|numeric',
            'timeline' => 'nullable|string',
            'motivation' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['last_name'] = $validated['last_name'] ?? '';
        $validated['type'] = $validated['type'] ?? 'buyer';
        $validated['lead_number'] = 'LEAD-' . strtoupper(Str::random(8));
        $validated['normalized_email'] = strtolower($validated['email']);
        $validated['normalized_phone'] = !empty($validated['phone']) ? preg_replace('/[^\d]/', '', $validated['phone']) : null;
        $validated['ip_address'] = $request->ip();
        $validated['user_agent'] = $request->userAgent();
        $validated['page_url'] = $request->header('referer', '');

        $lead = Lead::create($validated);

        \App\Models\AuditLog::log('lead.created', 'lead', null, null, $request->only(['email', 'first_name', 'last_name']));

        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'created',
            'description' => 'Lead created from ' . ($validated['source'] ?? 'direct'),
            'performed_by' => $request->user()->id ?? null,
        ]);

        return response()->json($lead, 201);
    }

    public function show($id) {
        return response()->json(
            Lead::with(['assignee', 'realtor', 'activities.performer', 'notes.creator', 'tasks', 'assignments.agent'])->findOrFail($id)
        );
    }

    public function updateStatus(Request $request, $id) {
        $request->validate(['status' => 'required|in:new,contacted,qualified,scheduled,negotiation,converted,lost,archived']);
        $lead = Lead::findOrFail($id);
        $oldStatus = $lead->status;
        $lead->update(['status' => $request->status]);

        \App\Models\AuditLog::log('lead.status_updated', 'lead', $lead->id, ['status' => $oldStatus], ['status' => $request->status]);

        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'status_change',
            'description' => "Status changed from {$oldStatus} to {$request->status}",
            'performed_by' => $request->user()->id,
        ]);

        return response()->json($lead);
    }

    public function update(Request $request, $id) {
        $lead = Lead::findOrFail($id);
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email',
            'phone' => 'nullable|string',
            'type' => 'sometimes|in:buyer,seller,investor,realtor,vendor',
            'source' => 'nullable|string',
            'status' => 'sometimes|in:new,contacted,qualified,scheduled,negotiation,converted,lost,archived',
            'priority' => 'sometimes|in:low,normal,high,urgent,hot,warm,cold',
            'budget_min' => 'nullable|numeric',
            'budget_max' => 'nullable|numeric',
            'timeline' => 'nullable|string',
            'motivation' => 'nullable|string',
            'notes' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
        ]);
        if (isset($validated['email'])) {
            $validated['normalized_email'] = strtolower($validated['email']);
        }
        if (array_key_exists('phone', $validated)) {
            $validated['normalized_phone'] = $validated['phone']
                ? preg_replace('/[^\d]/', '', $validated['phone'])
                : null;
        }
        $lead->update($validated);
        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'updated',
            'description' => 'Lead details updated',
            'performed_by' => $request->user()->id,
        ]);
        return response()->json($lead->fresh(['assignee', 'realtor']));
    }

    public function destroy($id) {
        $lead = Lead::findOrFail($id);
        $lead->delete();
        return response()->json(['message' => 'Lead deleted']);
    }

    public function addNote(Request $request, $id) {
        $request->validate(['note' => 'required|string']);
        $note = LeadNote::create([
            'lead_id' => $id,
            'note' => $request->note,
            'pinned' => $request->get('pinned', false),
            'created_by' => $request->user()->id,
        ]);
        return response()->json($note, 201);
    }

    public function addTask(Request $request, $id) {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'priority' => 'sometimes|in:low,normal,high,urgent',
            'due_date' => 'nullable|date',
        ]);
        $validated['lead_id'] = $id;
        $validated['created_by'] = $request->user()->id;
        $validated['assigned_to'] = $request->get('assigned_to', $request->user()->id);
        $task = LeadTask::create($validated);
        return response()->json($task, 201);
    }

    public function assign(Request $request, $id) {
        $request->validate(['agent_id' => 'required|exists:users,id']);
        \App\Models\AuditLog::log('lead.assigned', 'lead', $id, null, ['agent_id' => $request->agent_id]);

        $assignment = LeadAssignment::create([
            'lead_id' => $id,
            'agent_id' => $request->agent_id,
            'assigned_at' => now(),
        ]);
        Lead::where('id', $id)->update(['assigned_to' => $request->agent_id]);
        return response()->json($assignment, 201);
    }

    public function import(Request $request) {
        $request->validate([
            'file' => 'required|file|max:10240'
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        $ext = strtolower($file->getClientOriginalExtension());

        $rows = [];
        if ($ext === 'json') {
            $content = file_get_contents($path);
            $rows = json_decode($content, true) ?: [];
        } else {
            // Read as CSV
            if (($handle = fopen($path, 'r')) !== false) {
                $header = null;
                while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                    if (!$header) {
                        $header = array_map(function($h) {
                            return strtolower(trim(preg_replace('/[^\w\s]/', '', $h)));
                        }, $row);
                    } else {
                        if (count($header) === count($row)) {
                            $rows[] = array_combine($header, $row);
                        }
                    }
                }
                fclose($handle);
            }
        }

        $imported = 0;
        $errors = 0;

        foreach ($rows as $rowData) {
            $email = $rowData['email'] ?? $rowData['emailaddress'] ?? $rowData['email_address'] ?? null;
            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors++;
                continue;
            }

            $name = $rowData['name'] ?? $rowData['fullname'] ?? $rowData['full_name'] ?? null;
            $firstName = $rowData['firstname'] ?? $rowData['first_name'] ?? null;
            $lastName = $rowData['lastname'] ?? $rowData['last_name'] ?? null;

            if (!$firstName && $name) {
                $parts = explode(' ', trim($name), 2);
                $firstName = $parts[0];
                $lastName = $parts[1] ?? '';
            }

            // Mapped status validation
            $type = strtolower($rowData['type'] ?? 'buyer');
            if (!in_array($type, ['buyer', 'seller', 'investor', 'realtor', 'vendor'])) {
                if ($type === 'agent') {
                    $type = 'realtor';
                } else {
                    $type = 'buyer';
                }
            }

            try {
                \App\Services\LeadCaptureService::upsert([
                    'first_name' => $firstName ?: 'Guest',
                    'last_name' => $lastName ?? '',
                    'email' => $email,
                    'phone' => $rowData['phone'] ?? $rowData['phonenumber'] ?? $rowData['phone_number'] ?? $rowData['mobile'] ?? null,
                    'type' => $type,
                    'source' => $rowData['source'] ?? 'csv_import',
                    'notes' => $rowData['notes'] ?? $rowData['comment'] ?? $rowData['message'] ?? null,
                ]);
                $imported++;
            } catch (\Throwable $e) {
                $errors++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Imported {$imported} leads successfully, with {$errors} skipped.",
            'count' => $imported,
            'errors' => $errors
        ]);
    }

    public function bulkReassign(Request $request) {
        $request->validate([
            'lead_ids' => 'required|array',
            'agent_id' => 'required|exists:users,id',
        ]);
        Lead::whereIn('id', $request->lead_ids)->update(['assigned_to' => $request->agent_id]);
        return response()->json(['message' => count($request->lead_ids) . ' leads reassigned']);
    }

    public function qualify(Request $request) {
        $request->validate(['lead_id' => 'required|exists:leads,id']);
        $lead = Lead::findOrFail($request->lead_id);

        $score = 0;

        // Budget alignment (0-25): stronger budget signals score higher
        if ($lead->budget_max && $lead->budget_max > 0) {
            $score += 10;
            if ($lead->budget_min && $lead->budget_min > 0) {
                $score += 15; // both min and max set = serious buyer
            }
        }

        // Timeline urgency (0-20): shorter timelines = higher intent
        if ($lead->timeline) {
            $timelineLower = strtolower($lead->timeline);
            if (str_contains($timelineLower, 'immediate') || str_contains($timelineLower, 'asap') || str_contains($timelineLower, 'now') || str_contains($timelineLower, '1 month') || str_contains($timelineLower, '30 day')) {
                $score += 20;
            } elseif (str_contains($timelineLower, '3 month') || str_contains($timelineLower, '6 month') || str_contains($timelineLower, 'soon')) {
                $score += 12;
            } else {
                $score += 8;
            }
        }

        // Communication channel completeness (0-15)
        $hasEmail = !empty($lead->email);
        $hasPhone = !empty($lead->phone);
        $hasPhoneVerified = !empty($lead->phone_verified);
        if ($hasEmail && $hasPhone) $score += 10;
        elseif ($hasEmail || $hasPhone) $score += 5;
        if ($hasPhoneVerified) $score += 5;

        // Source quality (0-15)
        $sourceScores = [
            'referral' => 15,
            'organic' => 12,
            'ai_chat' => 10,
            'direct' => 10,
            'website' => 8,
            'social' => 7,
            'paid' => 5,
            'cold_call' => 3,
        ];
        $score += $sourceScores[$lead->source] ?? 5;

        // Repeat engagement (0-15): returning leads show higher intent
        $activityCount = $lead->activities()->count();
        if ($activityCount >= 5) {
            $score += 15;
        } elseif ($activityCount >= 3) {
            $score += 10;
        } elseif ($activityCount >= 2) {
            $score += 5;
        }

        // Motivation signal (0-10)
        if ($lead->motivation) {
            $motivationLower = strtolower($lead->motivation);
            if (str_contains($motivationLower, 'urgent') || str_contains($timelineLower, 'must') || str_contains($motivationLower, 'relocat')) {
                $score += 10;
            } else {
                $score += 6;
            }
        }

        $score = min($score, 100);

        $priority = match(true) {
            $score >= 70 => 'high',
            $score >= 40 => 'normal',
            default => 'low',
        };

        $lead->update(['score' => $score, 'priority' => $priority]);

        return response()->json([
            'lead_id' => $lead->id,
            'score' => $score,
            'priority' => $priority,
            'breakdown' => [
                'budget' => ($lead->budget_max && $lead->budget_max > 0) ? ($lead->budget_min ? 25 : 10) : 0,
                'timeline' => $lead->timeline ? (str_contains(strtolower($lead->timeline), 'immediate') || str_contains(strtolower($lead->timeline), 'asap') || str_contains(strtolower($lead->timeline), 'now') ? 20 : (str_contains(strtolower($lead->timeline), '3 month') || str_contains(strtolower($lead->timeline), 'soon') ? 12 : 8)) : 0,
                'communication' => ($hasEmail && $hasPhone ? 10 : ($hasEmail || $hasPhone ? 5 : 0)) + ($hasPhoneVerified ? 5 : 0),
                'source' => $sourceScores[$lead->source] ?? 5,
                'engagement' => $activityCount >= 5 ? 15 : ($activityCount >= 3 ? 10 : ($activityCount >= 2 ? 5 : 0)),
                'motivation' => $lead->motivation ? 6 : 0,
            ],
            'summary' => "Lead qualification score: {$score}/100. Priority: {$priority}. " .
                "Source: {$lead->source}. Timeline: " . ($lead->timeline ?: 'unset') . ". " .
                "Engagement depth: {$activityCount} interactions.",
        ]);
    }
}
