<?php

use App\Jobs\ProcessDataExport;
use App\Jobs\PublishScheduledSocialPost;
use App\Models\Blog;
use App\Models\DataExport;
use App\Models\Invoice;
use App\Models\SocialPost;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Storage;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Tasks
|--------------------------------------------------------------------------
| Requires this cron entry on the server:
|
|   * * * * * cd /path/to/laravel-api && php artisan schedule:run >> /dev/null 2>&1
|
| And a running queue worker:
|
|   php artisan queue:work --tries=3
*/

/**
 * Pick up exports that were requested but never processed.
 * Without this every export stayed "pending" and could never be downloaded.
 */
Schedule::call(function () {
    DataExport::where('status', 'pending')
        ->orderBy('id')
        ->limit(25)
        ->get()
        ->each(fn (DataExport $export) => ProcessDataExport::dispatch($export->id));
})->everyMinute()->name('dispatch-pending-exports')->withoutOverlapping();

/**
 * Publish social posts whose scheduled time has arrived.
 */
Schedule::call(function () {
    SocialPost::where('status', 'scheduled')
        ->whereNotNull('scheduled_at')
        ->where('scheduled_at', '<=', now())
        ->orderBy('scheduled_at')
        ->limit(50)
        ->get()
        ->each(fn (SocialPost $post) => PublishScheduledSocialPost::dispatch($post->id));
})->everyMinute()->name('publish-scheduled-social-posts')->withoutOverlapping();

/**
 * Release marketplace lead reservations that expired without a payment.
 */
Schedule::call(function () {
    \App\Http\Controllers\Api\MarketplaceController::releaseExpiredReservations();
})->everyMinute()->name('release-expired-marketplace-reservations')->withoutOverlapping();

/**
 * Publish blog posts whose scheduled time has arrived — the admin UI offers
 * "Schedule" as a status but nothing ever flipped it to published without this.
 */
Schedule::call(function () {
    Blog::where('status', 'scheduled')
        ->whereNotNull('scheduled_at')
        ->where('scheduled_at', '<=', now())
        ->get()
        ->each(function (Blog $post) {
            $post->status = 'published';
            $post->published_at = now();
            $post->scheduled_at = null;
            $post->save();
        });
})->everyMinute()->name('publish-scheduled-blogs')->withoutOverlapping();

/**
 * Flag invoices past their due date so the finance dashboard reflects reality.
 */
Schedule::call(function () {
    Invoice::where('status', 'sent')
        ->whereNotNull('due_at')
        ->where('due_at', '<', now())
        ->update(['status' => 'overdue']);
})->hourly()->name('mark-overdue-invoices')->withoutOverlapping();

/**
 * Housekeeping: remove export files older than 30 days but keep the audit row.
 */
Schedule::call(function () {
    DataExport::where('status', 'completed')
        ->whereNotNull('file_path')
        ->where('created_at', '<', now()->subDays(30))
        ->get()
        ->each(function (DataExport $export) {
            Storage::delete($export->file_path);
            $export->update([
                'file_path' => null,
                'error_message' => 'Export file expired after 30 days. Create a new export to download this data again.',
            ]);
        });
})->dailyAt('03:00')->name('prune-old-exports');

Schedule::command('queue:prune-failed --hours=168')->daily();
