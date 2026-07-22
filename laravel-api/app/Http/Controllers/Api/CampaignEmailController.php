<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailCampaign;
use App\Models\CampaignRecipient;
use App\Models\Contact;
use App\Models\Lead;
use App\Models\NewsletterSubscriber;
use App\Models\EmailTemplate;
use App\Models\EmailHistory;
use App\Models\EmailUnsubscribe;
use App\Models\ContactGroup;
use App\Models\ContactGroupMember;
use App\Models\SentEmail;
use App\Mail\CampaignMail;
use App\Services\IntegrationGate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class CampaignEmailController extends Controller
{
    public function index(): JsonResponse
    {
        $campaigns = EmailCampaign::withCount('recipients')->latest()->paginate(20);
        return response()->json($campaigns);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'from_email' => 'nullable|string',
            'reply_to' => 'nullable|string',
            'recipient_source' => 'required|string|in:contacts,leads,subscribers,segment,manual',
            'recipient_filter' => 'nullable|array',
            'recipient_list' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
        ]);

        $validated['created_by'] = $request->user()->id;
        if (!isset($validated['from_email'])) {
            $typeMap = [
                'newsletter' => 'info@domesticrealestate.us',
                'nurture' => 'leads@domesticrealestate.us',
                'outreach' => 'sales@domesticrealestate.us',
                'reengagement' => 'support@domesticrealestate.us',
            ];
            $validated['from_email'] = $typeMap[$validated['type']] ?? 'info@domesticrealestate.us';
        }

        $campaign = EmailCampaign::create($validated);

        $recipients = $this->buildRecipientList($validated);
        foreach ($recipients as $r) {
            $email = is_array($r) ? ($r['email'] ?? null) : $r;
            if (!$email) continue;
            $unsub = EmailUnsubscribe::where('email', $email)->first();
            if ($unsub) continue;
            CampaignRecipient::create([
                'campaign_id' => $campaign->id,
                'email' => $email,
                'name' => is_array($r) ? ($r['name'] ?? '') : '',
                'status' => 'pending',
            ]);
        }

        return response()->json($campaign->loadCount('recipients'), 201);
    }

    public function show(int $id): JsonResponse
    {
        $campaign = EmailCampaign::withCount(['recipients', 'recipients as sent_count' => fn ($q) => $q->where('status', 'sent')])
            ->withCount(['recipients as delivered_count' => fn ($q) => $q->where('status', 'delivered')])
            ->withCount(['recipients as opened_count' => fn ($q) => $q->where('status', 'opened')])
            ->withCount(['recipients as clicked_count' => fn ($q) => $q->where('status', 'clicked')])
            ->withCount(['recipients as bounced_count' => fn ($q) => $q->where('status', 'bounced')])
            ->findOrFail($id);
        return response()->json($campaign);
    }

    public function send(Request $request, int $id): JsonResponse
    {
        IntegrationGate::requireEmail('Email campaigns');

        $campaign = EmailCampaign::with('template')->findOrFail($id);

        $pendingRecipients = CampaignRecipient::where('campaign_id', $id)
            ->where('status', 'pending')
            ->get();

        if ($pendingRecipients->isEmpty()) {
            return response()->json([
                'success' => false,
                'code' => 'no_recipients',
                'message' => 'Email campaigns is not working because there are no pending recipients to send to.',
                'reason' => 'this campaign has no pending recipients',
                'fix' => 'Import or add recipients first, then click Send again.',
            ], 400);
        }

        $campaign->update(['status' => 'sending', 'sent_at' => now()]);

        $subject = $campaign->subject ?? $campaign->name;
        $htmlBody = $campaign->template?->html_body
            ?: $campaign->template?->body
            ?: $campaign->body
            ?: '<p>'.e($campaign->subject ?? 'Message from Domestic Real Estate').'</p>';
        $textBody = strip_tags($htmlBody);
        $fromEmail = $campaign->from_email ?: config('mail.from.address', 'info@domesticrealestate.us');

        foreach ($pendingRecipients as $recipient) {
            $trackingId = Str::uuid()->toString();

            $emailHistory = EmailHistory::create([
                'recipient' => $recipient->email,
                'subject' => $subject,
                'body' => $htmlBody,
                'status' => 'sent',
                'opens' => 0,
                'clicks' => 0,
                'sent_at' => now(),
            ]);

            $sentEmail = SentEmail::create([
                'user_id' => $campaign->created_by ?? null,
                'campaign_id' => $campaign->id,
                'to_email' => $recipient->email,
                'from_email' => $fromEmail,
                'subject' => $subject,
                'body' => $htmlBody,
                'status' => 'sent',
                'tracking_id' => $trackingId,
                'sent_at' => now(),
                'metadata' => ['email_history_id' => $emailHistory->id],
            ]);

            $recipient->update(['status' => 'sent', 'sent_at' => now()]);

            try {
                Mail::to($recipient->email)->queue(new CampaignMail(
                    emailSubject: $subject,
                    htmlBody: $htmlBody,
                    textBody: $textBody,
                    trackingId: $trackingId,
                ));
                $sentEmail->update(['status' => 'sent']);
            } catch (\Exception $e) {
                $sentEmail->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
                $recipient->update(['status' => 'failed']);
                $emailHistory->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
            }
        }

        $allDone = CampaignRecipient::where('campaign_id', $id)->where('status', 'pending')->count() === 0;
        if ($allDone) {
            $campaign->update(['status' => 'sent']);
        }

        return response()->json([
            'message' => 'Campaign emails queued for sending',
            'total' => $pendingRecipients->count(),
        ]);
    }

    public function progress(int $id): JsonResponse
    {
        $campaign = EmailCampaign::findOrFail($id);
        $total = CampaignRecipient::where('campaign_id', $id)->count();
        $sent = CampaignRecipient::where('campaign_id', $id)->where('status', 'sent')->count();
        $delivered = CampaignRecipient::where('campaign_id', $id)->where('status', 'delivered')->count();
        $failed = CampaignRecipient::where('campaign_id', $id)->where('status', 'failed')->count();
        return response()->json(['total' => $total, 'sent' => $sent, 'delivered' => $delivered, 'failed' => $failed]);
    }

    public function recipients(int $id): JsonResponse
    {
        $recipients = CampaignRecipient::where('campaign_id', $id)->paginate(50);
        return response()->json($recipients);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $campaign = EmailCampaign::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string',
            'subject' => 'sometimes|string|max:255',
            'body' => 'sometimes|string',
            'from_email' => 'nullable|string',
            'reply_to' => 'nullable|string',
            'recipient_source' => 'sometimes|string|in:contacts,leads,subscribers,segment,manual',
            'recipient_filter' => 'nullable|array',
            'recipient_list' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
            'status' => 'sometimes|string|in:draft,scheduled,sending,sent,paused,cancelled',
        ]);
        $campaign->update($validated);
        return response()->json(['data' => $campaign->fresh(), 'message' => 'Campaign updated']);
    }

    public function destroy(int $id): JsonResponse
    {
        $campaign = EmailCampaign::findOrFail($id);
        CampaignRecipient::where('campaign_id', $id)->delete();
        $campaign->delete();
        return response()->json(['message' => 'Campaign deleted']);
    }

    public function templates(): JsonResponse
    {
        return response()->json(EmailTemplate::orderBy('name')->get());
    }

    public function storeTemplate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|in:transactional,marketing,notification',
            'subject' => 'required|string|max:255',
            'html_body' => 'required|string',
            'text_body' => 'nullable|string',
            'variables' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);
        $validated['slug'] = Str::slug($validated['name']).'-'.Str::random(4);
        $validated['type'] = $validated['type'] ?? 'marketing';
        $validated['is_active'] = $validated['is_active'] ?? true;
        $template = EmailTemplate::create($validated);
        return response()->json(['data' => $template, 'message' => 'Template created'], 201);
    }

    public function updateTemplate(Request $request, int $id): JsonResponse
    {
        $template = EmailTemplate::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|in:transactional,marketing,notification',
            'subject' => 'sometimes|string|max:255',
            'html_body' => 'sometimes|string',
            'text_body' => 'nullable|string',
            'variables' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);
        $template->update($validated);
        return response()->json(['data' => $template->fresh(), 'message' => 'Template updated']);
    }

    public function destroyTemplate(int $id): JsonResponse
    {
        EmailTemplate::findOrFail($id)->delete();
        return response()->json(['message' => 'Template deleted']);
    }

    public function importRecipients(Request $request, int $id): JsonResponse
    {
        $request->validate(['recipients' => 'required|array|min:1']);
        $campaign = EmailCampaign::findOrFail($id);
        $count = 0;
        foreach ($request->recipients as $r) {
            $email = $r['email'] ?? null;
            if (!$email) continue;
            $unsub = EmailUnsubscribe::where('email', $email)->first();
            if ($unsub) continue;
            CampaignRecipient::create([
                'campaign_id' => $id,
                'email' => $email,
                'name' => $r['name'] ?? '',
                'status' => 'pending',
            ]);
            $count++;
        }
        return response()->json(['message' => "$count recipients imported"]);
    }

    public function indexSentEmails(Request $request): JsonResponse
    {
        $query = SentEmail::where('user_id', $request->user()->id)->latest();
        if ($request->has('status')) $query->where('status', $request->status);
        return response()->json($query->paginate(20));
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
        ]);
        EmailUnsubscribe::create([
            ...$validated,
            'unsubscribed_at' => now(),
        ]);
        return response()->json(['message' => 'You have been unsubscribed']);
    }

    private function buildRecipientList(array $data): array
    {
        return match ($data['recipient_source'] ?? 'manual') {
            'contacts' => Contact::pluck('email')->filter()->toArray(),
            'leads' => Lead::pluck('email')->filter()->toArray(),
            'subscribers' => NewsletterSubscriber::where('status', 'active')->pluck('email')->filter()->toArray(),
            'segment' => $this->getSegmentRecipients($data['recipient_filter'] ?? []),
            default => $data['recipient_list'] ?? [],
        };
    }

    private function getSegmentRecipients(array $filter): array
    {
        $query = Contact::query();
        if (!empty($filter['tag'])) $query->where('tags', 'like', '%' . $filter['tag'] . '%');
        if (!empty($filter['city'])) $query->where('city', $filter['city']);
        if (!empty($filter['source'])) $query->where('source', $filter['source']);
        return $query->pluck('email')->filter()->toArray();
    }
}
