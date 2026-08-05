<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AutomationEngine;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadNote;
use App\Models\LeadTask;
use App\Models\LeadAssignment;
use App\Models\ImportBatch;
use App\Models\ImportBatchError;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LeadController extends Controller
{
    /**
     * Roles that may view/edit every lead in the CRM.
     * Every other role is strictly scoped to leads they own or were assigned.
     */
    private function isPrivileged($user): bool
    {
        return in_array($user->role, ['admin', 'super_admin'], true);
    }

    /** Restrict a lead query to records the given user is allowed to see. */
    private function scopeToUser($query, $user)
    {
        if ($this->isPrivileged($user)) {
            return $query;
        }

        return $query->where(function ($q) use ($user) {
            $q->where('assigned_to', $user->id)
                ->orWhere('created_by', $user->id)
                ->orWhere('sold_to', $user->id)
                ->orWhere('reserved_by', $user->id);
        });
    }

    /** Load a lead only if the user may access it, else 403. */
    private function findLeadForUser($id, $user): Lead
    {
        $lead = Lead::findOrFail($id);

        if ($this->isPrivileged($user)) {
            return $lead;
        }

        $canAccess = $lead->assigned_to === $user->id
            || $lead->created_by === $user->id
            || $lead->sold_to === $user->id
            || $lead->reserved_by === $user->id;

        abort_if(!$canAccess, 403, 'You do not have access to this lead.');

        return $lead;
    }

    public function index(Request $request) {
        $query = Lead::with(['assignee', 'realtor']);
        $this->scopeToUser($query, $request->user());
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('type')) $query->where('type', $request->type);
        if ($request->filled('priority')) $query->where('priority', $request->priority);
        if ($this->isPrivileged($request->user()) && $request->filled('assigned_to')) $query->where('assigned_to', $request->assigned_to);
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

        // Non-privileged users (agents) can only create leads for themselves.
        $validated['assigned_to'] = $this->isPrivileged($request->user())
            ? ($request->input('assigned_to') ?? $request->user()->id)
            : $request->user()->id;

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

    public function show(Request $request, $id) {
        $lead = $this->findLeadForUser($id, $request->user());
        return response()->json(
            $lead->load(['assignee', 'realtor', 'activities.performer', 'notes.creator', 'tasks', 'assignments.agent'])
        );
    }

    public function updateStatus(Request $request, $id) {
        $request->validate(['status' => 'required|in:new,contacted,qualified,scheduled,negotiation,converted,lost,archived']);
        $lead = $this->findLeadForUser($id, $request->user());
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
        $lead = $this->findLeadForUser($id, $request->user());
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

    public function destroy(Request $request, $id) {
        $lead = $this->findLeadForUser($id, $request->user());
        $lead->delete();
        return response()->json(['message' => 'Lead deleted']);
    }

    public function addNote(Request $request, $id) {
        $request->validate(['note' => 'required|string']);
        $this->findLeadForUser($id, $request->user());
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
        $this->findLeadForUser($id, $request->user());
        $validated['lead_id'] = $id;
        $validated['created_by'] = $request->user()->id;
        $validated['assigned_to'] = $request->get('assigned_to', $request->user()->id);
        $task = LeadTask::create($validated);
        return response()->json($task, 201);
    }

    public function assign(Request $request, $id) {
        abort_unless($this->isPrivileged($request->user()), 403, 'Only administrators can reassign leads.');
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

    /**
     * Import leads from CSV, XLSX, or JSON.
     *
     * The email column is detected from the actual cell values, not the header
     * text, so a timestamp or ID column can never be mistaken for an email.
     * Every run is persisted as an ImportBatch with per-row failure reasons.
     */
    public function import(Request $request) {
        abort_unless($this->isPrivileged($request->user()), 403, 'Only administrators can import leads.');
        $request->validate([
            'file' => 'required|file|max:10240',
            // Explicit override when the admin picks the column manually.
            'email_column' => 'nullable|string',
            // Allows importing contacts that genuinely have no email address.
            'allow_without_email' => 'nullable|boolean',
            'column_map' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension());
        $allowWithoutEmail = $request->boolean('allow_without_email');

        try {
            [$headers, $rows] = $this->readTabularFile($file, $ext);
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

        $map = \App\Services\ImportColumnMapper::detect($headers, $rows);

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

        if ($request->filled('email_column') && in_array($request->email_column, $headers, true)) {
            $map['email'] = $request->email_column;
        }

        $emailHeader = $map['email'] ?? null;

        // No usable email column, and the admin has not opted into email-less import.
        if (!$emailHeader && !$allowWithoutEmail) {
            return response()->json([
                'success' => false,
                'code' => 'no_email_column',
                'message' => \App\Services\ImportColumnMapper::noEmailColumnMessage($headers),
                'reason' => 'none of the columns contain a meaningful number of valid email addresses',
                'fix' => 'Select the correct email column, or re-submit with allow_without_email to import these as non-email leads.',
                'detected_headers' => $headers,
                'suggested_map' => $map,
            ], 422);
        }

        $batch = ImportBatch::create([
            'import_type' => 'leads',
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
        $withoutEmail = 0;

        foreach ($rows as $i => $row) {
            $rowNumber = $i + 2; // +1 for zero-index, +1 for the header row
            $value = fn (?string $field) => $field !== null && isset($index[$field])
                ? trim((string) ($row[$index[$field]] ?? ''))
                : null;

            $email = $emailHeader ? $value($emailHeader) : null;
            $hasValidEmail = $email && filter_var($email, FILTER_VALIDATE_EMAIL);

            if (!$hasValidEmail && !$allowWithoutEmail) {
                $failed++;
                $this->recordRowError(
                    $batch,
                    $rowNumber,
                    $email ? 'invalid_email' : 'missing_email',
                    $email
                        ? '"'.$email.'" is not a valid email address.'
                        : 'This row has no email address.',
                    $headers,
                    $row
                );
                continue;
            }

            $firstName = $value($map['first_name'] ?? null);
            $lastName = $value($map['last_name'] ?? null);
            $fullName = $value($map['name'] ?? null);

            if (!$firstName && $fullName) {
                $parts = explode(' ', trim($fullName), 2);
                $firstName = $parts[0];
                $lastName = $parts[1] ?? '';
            }

            if (!$firstName && !$hasValidEmail) {
                $failed++;
                $this->recordRowError(
                    $batch,
                    $rowNumber,
                    'insufficient_data',
                    'This row has neither a name nor an email address, so it cannot become a lead.',
                    $headers,
                    $row
                );
                continue;
            }

            $type = strtolower($value($map['type'] ?? null) ?: 'buyer');
            if (!in_array($type, ['buyer', 'seller', 'investor', 'realtor', 'vendor'], true)) {
                $type = $type === 'agent' ? 'realtor' : 'buyer';
            }

            try {
                \App\Services\LeadCaptureService::upsert([
                    'first_name' => $firstName ?: 'Guest',
                    'last_name' => $lastName ?: '',
                    'email' => $hasValidEmail ? $email : null,
                    'phone' => $value($map['phone'] ?? null),
                    'type' => $type,
                    'source' => $value($map['source'] ?? null) ?: $ext.'_import',
                    'notes' => $value($map['notes'] ?? null),
                    'location' => $value($map['city'] ?? null),
                ]);

                $imported++;
                if (!$hasValidEmail) {
                    $withoutEmail++;
                }
            } catch (\Throwable $e) {
                $failed++;
                $this->recordRowError($batch, $rowNumber, 'save_failed', $e->getMessage(), $headers, $row);
            }
        }

        $batch->update([
            'status' => $failed > 0 ? 'completed_with_errors' : 'completed',
            'rows_imported' => $imported,
            'rows_failed' => $failed,
            'rows_without_email' => $withoutEmail,
            'completed_at' => now(),
        ]);

        if ($imported > 0) {
            AutomationEngine::trigger('contact_imported', [
                'batch_id' => $batch->id,
                'import_type' => $batch->import_type,
                'count' => $imported,
                'failed' => $failed,
                'source' => $ext.'_import',
                'file_name' => $batch->file_name,
            ]);
        }

        $message = "Imported {$imported} lead(s).";
        if ($withoutEmail > 0) {
            $message .= " {$withoutEmail} have no email address and cannot receive email campaigns until one is added.";
        }
        if ($failed > 0) {
            $message .= " {$failed} row(s) were skipped — download the error report for details.";
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'batch_id' => $batch->id,
            'count' => $imported,
            'errors' => $failed,
            'without_email' => $withoutEmail,
            'column_map' => $map,
        ]);
    }

    /** Persist one failed row so the admin can download and correct it. */
    private function recordRowError(
        ImportBatch $batch,
        int $rowNumber,
        string $code,
        string $reason,
        array $headers,
        array $row
    ): void {
        ImportBatchError::create([
            'import_batch_id' => $batch->id,
            'row_number' => $rowNumber,
            'reason_code' => $code,
            'reason' => $reason,
            'row_data' => $this->combineRow($headers, $row),
        ]);
    }

    /** @return array<string, mixed> */
    private function combineRow(array $headers, array $row): array
    {
        $out = [];
        foreach ($headers as $i => $header) {
            $out[$header] = $row[$i] ?? null;
        }

        return $out;
    }

    /**
     * Read CSV/XLSX/JSON into a positional header + rows structure.
     *
     * @return array{0: array<int,string>, 1: array<int, array<int, mixed>>}
     */
    private function readTabularFile($file, string $ext): array
    {
        $path = $file->getRealPath();

        if ($ext === 'json') {
            $decoded = json_decode((string) file_get_contents($path), true);
            if (!is_array($decoded) || $decoded === []) {
                return [[], []];
            }
            $headers = array_keys((array) reset($decoded));
            $rows = array_map(
                fn ($item) => array_map(fn ($h) => ((array) $item)[$h] ?? null, $headers),
                $decoded
            );

            return [$headers, array_values($rows)];
        }

        if (in_array($ext, ['xlsx', 'xls'], true)) {
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($path);
            $data = $spreadsheet->getActiveSheet()->toArray(null, true, true, false);
            $headers = array_map(fn ($h) => trim((string) $h), array_shift($data) ?: []);

            return [$headers, array_values(array_filter($data, fn ($r) => array_filter($r, fn ($v) => trim((string) $v) !== '')))];
        }

        // Default: CSV / TXT
        $headers = [];
        $rows = [];
        if (($handle = fopen($path, 'r')) !== false) {
            while (($row = fgetcsv($handle, 0, ',')) !== false) {
                if ($headers === []) {
                    $headers = array_map(fn ($h) => trim((string) $h), $row);
                    continue;
                }
                if (array_filter($row, fn ($v) => trim((string) $v) !== '') !== []) {
                    $rows[] = $row;
                }
            }
            fclose($handle);
        }

        return [$headers, $rows];
    }

    public function bulkReassign(Request $request) {
        abort_unless($this->isPrivileged($request->user()), 403, 'Only administrators can reassign leads.');
        $request->validate([
            'lead_ids' => 'required|array',
            'agent_id' => 'required|exists:users,id',
        ]);
        Lead::whereIn('id', $request->lead_ids)->update(['assigned_to' => $request->agent_id]);
        return response()->json(['message' => count($request->lead_ids) . ' leads reassigned']);
    }

    public function qualify(Request $request) {
        $request->validate(['lead_id' => 'required|exists:leads,id']);
        $lead = $this->findLeadForUser($request->lead_id, $request->user());

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
