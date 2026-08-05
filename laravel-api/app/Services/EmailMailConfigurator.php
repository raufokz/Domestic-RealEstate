<?php

namespace App\Services;

use App\Models\EmailSetting;
use Illuminate\Support\Facades\Schema;

/**
 * Wires the email_settings DB table into Laravel's mail config so the SMTP
 * details (and sender identity) saved under Admin → Email Settings actually
 * drive the transport used by real sends — campaigns, automation, test emails.
 *
 * Called once per process boot; safely no-ops when the DB is not ready (fresh
 * installs, migrations, config caching) so it falls back to .env values.
 */
class EmailMailConfigurator
{
    public static function apply(): void
    {
        try {
            if (! Schema::hasTable('email_settings')) {
                return;
            }

            $settings = EmailSetting::query()->pluck('value', 'setting_key');
            if ($settings->isEmpty()) {
                return;
            }

            $host = trim((string) ($settings['smtp_host'] ?? ''));
            if ($host === '') {
                return;
            }

            $encryption = (string) ($settings['smtp_encryption'] ?? 'tls');
            if (in_array(strtolower($encryption), ['none', ''], true)) {
                $encryption = null;
            }

            $currentSmtp = config('mail.mailers.smtp', []);

            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp' => array_merge($currentSmtp, [
                    'transport' => 'smtp',
                    'host' => $host,
                    'port' => (int) ($settings['smtp_port'] ?? 587),
                    'username' => trim((string) ($settings['smtp_username'] ?? '')),
                    'password' => (string) ($settings['smtp_password'] ?? ''),
                    'encryption' => $encryption,
                    'scheme' => null,
                    'url' => null,
                ]),
                'mail.from.address' => trim((string) ($settings['from_email'] ?? '')) ?: config('mail.from.address'),
                'mail.from.name' => trim((string) ($settings['from_name'] ?? '')) ?: config('mail.from.name'),
            ]);
        } catch (\Throwable $e) {
            // DB unavailable (migrations/deploy/boot before setup) — keep .env mail config.
        }
    }
}
