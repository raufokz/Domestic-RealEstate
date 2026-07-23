<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * Central admin alerting.
 *
 * Every operational failure in the platform should surface here so an operator
 * sees it in the notification centre with a plain-language explanation, a
 * concrete fix, and a link that takes them to the screen that fixes it.
 *
 * Alerting must never break the caller: a failure to record an alert is logged
 * and swallowed, because losing an alert is strictly better than turning a
 * recoverable failure into a 500.
 */
class Notifier
{
    /** Repeat alerts with the same dedupe key inside this window bump a counter. */
    private const DEDUPE_MINUTES = 30;

    /**
     * Raise an alert for every admin / super_admin.
     *
     * @param  array<string,mixed>|null  $data  Related record ids, provider names, etc.
     */
    public static function alert(
        string $title,
        string $message,
        string $severity = Notification::SEVERITY_INFO,
        ?string $module = null,
        ?string $fix = null,
        ?string $actionUrl = null,
        ?string $actionLabel = null,
        ?array $data = null,
        ?string $dedupeKey = null,
    ): void {
        try {
            $admins = User::whereIn('role', ['admin', 'super_admin'])->get(['id']);
            if ($admins->isEmpty()) {
                Log::warning('Notifier: no admin users to alert', ['title' => $title]);
                return;
            }

            $key = $dedupeKey ?? md5(($module ?? '') . '|' . $title);
            $since = now()->subMinutes(self::DEDUPE_MINUTES);

            foreach ($admins as $admin) {
                $existing = Notification::where('user_id', $admin->id)
                    ->where('dedupe_key', $key)
                    ->whereNull('resolved_at')
                    ->where('created_at', '>=', $since)
                    ->first();

                if ($existing) {
                    // Same problem still happening: bump the counter and resurface
                    // it as unread rather than stacking identical rows.
                    $existing->increment('occurrences');
                    $existing->forceFill([
                        'message' => $message,
                        'read_at' => null,
                        'updated_at' => now(),
                    ])->save();
                    continue;
                }

                Notification::create([
                    'user_id' => $admin->id,
                    'type' => $module ?? 'system',
                    'severity' => $severity,
                    'module' => $module,
                    'title' => $title,
                    'message' => $message,
                    'fix' => $fix,
                    'action_url' => $actionUrl,
                    'action_label' => $actionLabel ?? ($actionUrl ? 'Open settings' : null),
                    'data' => $data,
                    'dedupe_key' => $key,
                    'occurrences' => 1,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('Notifier failed to record alert: ' . $e->getMessage(), [
                'title' => $title,
                'module' => $module,
            ]);
        }
    }

    // ---------------------------------------------------------------------
    // Named helpers — one per failure class, so call sites stay one-liners and
    // the fix guidance stays consistent wherever the failure is raised.
    // ---------------------------------------------------------------------

    public static function aiProviderFailed(string $detail, ?string $provider = null): void
    {
        self::alert(
            title: 'AI provider connection failed',
            message: $provider
                ? "The {$provider} AI provider did not return a usable response. {$detail}"
                : "No AI provider returned a usable response, so users are receiving the safe fallback reply. {$detail}",
            severity: Notification::SEVERITY_CRITICAL,
            module: 'ai',
            fix: 'Open Admin → AI Providers, test the Gemini and OpenAI credentials, and confirm the account has remaining quota. Check AI error logs for the raw provider response.',
            actionUrl: '/admin/ai/providers',
            actionLabel: 'Open AI provider settings',
            data: ['provider' => $provider, 'detail' => $detail],
        );
    }

    public static function smtpFailed(string $detail, ?int $campaignId = null): void
    {
        self::alert(
            title: 'Email delivery failed',
            message: "Outgoing email could not be sent. {$detail}",
            severity: Notification::SEVERITY_CRITICAL,
            module: 'email',
            fix: 'Open Admin → Settings → Email and confirm the SMTP host, port, username, password, encryption, and sender address. Then send a test email before retrying.',
            actionUrl: '/admin/email-settings',
            actionLabel: 'Open email settings',
            data: ['campaign_id' => $campaignId, 'detail' => $detail],
        );
    }

    public static function campaignFailed(int $campaignId, string $name, string $detail): void
    {
        self::alert(
            title: "Email campaign failed: {$name}",
            message: "Campaign #{$campaignId} stopped before all recipients were processed. {$detail}",
            severity: Notification::SEVERITY_CRITICAL,
            module: 'email',
            fix: 'Check that the queue worker is running and SMTP is configured, then retry the campaign from the campaign detail page.',
            actionUrl: '/admin/campaigns',
            actionLabel: 'Open campaigns',
            data: ['campaign_id' => $campaignId, 'detail' => $detail],
            dedupeKey: "campaign_failed_{$campaignId}",
        );
    }

    public static function importFailed(string $detail, ?int $batchId = null): void
    {
        self::alert(
            title: 'Lead import failed',
            message: "An import could not be completed. {$detail}",
            severity: Notification::SEVERITY_WARNING,
            module: 'import',
            fix: 'Open the import history, download the invalid-row report, correct the file or the column mapping, and run the import again.',
            actionUrl: '/admin/import-history',
            actionLabel: 'Open import history',
            data: ['batch_id' => $batchId, 'detail' => $detail],
        );
    }

    public static function exportFailed(int $exportId, string $detail): void
    {
        self::alert(
            title: 'Data export failed',
            message: "Export #{$exportId} did not finish. {$detail}",
            severity: Notification::SEVERITY_WARNING,
            module: 'export',
            fix: 'Confirm the queue worker is running and that storage is writable, then create the export again.',
            actionUrl: '/admin/exports',
            actionLabel: 'Open exports',
            data: ['export_id' => $exportId, 'detail' => $detail],
            dedupeKey: "export_failed_{$exportId}",
        );
    }

    public static function socialPostFailed(int $postId, string $platform, string $detail): void
    {
        self::alert(
            title: "Social post failed to publish on {$platform}",
            message: "Scheduled post #{$postId} could not be published. {$detail}",
            severity: Notification::SEVERITY_WARNING,
            module: 'social',
            fix: "Open Admin → Integrations → Social Media, reconnect the {$platform} account, run the connection test, then retry the post.",
            actionUrl: '/admin/social/failed',
            actionLabel: 'Open failed posts',
            data: ['post_id' => $postId, 'platform' => $platform, 'detail' => $detail],
            dedupeKey: "social_failed_{$postId}",
        );
    }

    public static function integrationFailed(string $key, string $detail): void
    {
        self::alert(
            title: "Integration not working: {$key}",
            message: "The {$key} integration reported an error. {$detail}",
            severity: Notification::SEVERITY_WARNING,
            module: 'integrations',
            fix: 'Open the integration settings, re-enter the credentials, and use the Test Connection button to confirm it works.',
            actionUrl: "/admin/integrations/{$key}",
            actionLabel: 'Open integration',
            data: ['integration' => $key, 'detail' => $detail],
            dedupeKey: "integration_failed_{$key}",
        );
    }

    public static function invoiceOverdue(int $invoiceId, string $number, string $customer): void
    {
        self::alert(
            title: "Invoice {$number} is overdue",
            message: "Payment from {$customer} has not been recorded by the due date.",
            severity: Notification::SEVERITY_WARNING,
            module: 'finance',
            fix: 'Open the invoice, confirm whether payment arrived via Payoneer, and either mark it paid or send a reminder.',
            actionUrl: "/admin/invoices/{$invoiceId}",
            actionLabel: 'Open invoice',
            data: ['invoice_id' => $invoiceId, 'number' => $number],
            dedupeKey: "invoice_overdue_{$invoiceId}",
        );
    }

    public static function pipelineMisconfigured(): void
    {
        self::alert(
            title: 'Leads are not being assigned to a pipeline',
            message: 'A lead was captured but no pipeline exists, so it was saved without a pipeline or stage and will not appear on the Kanban board.',
            severity: Notification::SEVERITY_CRITICAL,
            module: 'crm',
            fix: 'Create at least one pipeline with stages under Admin → CRM → Pipeline, then re-assign existing unassigned leads.',
            actionUrl: '/admin/crm/pipeline',
            actionLabel: 'Open pipelines',
            dedupeKey: 'pipeline_missing',
        );
    }
}
