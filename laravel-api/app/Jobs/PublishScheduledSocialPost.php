<?php

namespace App\Jobs;

use App\Models\SocialAccount;
use App\Models\SocialPost;
use App\Models\SocialPostResult;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Publishes a scheduled social post to each of its target accounts.
 *
 * Publishing to a live platform requires a connected account with a valid
 * access token. When an account is not connected the post is recorded as
 * failed for that account with an explicit, admin-readable reason rather than
 * being silently dropped or falsely reported as published.
 */
class PublishScheduledSocialPost implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 120;

    public function __construct(public int $postId)
    {
    }

    public function handle(): void
    {
        $post = SocialPost::find($this->postId);
        if (!$post || !in_array($post->status, ['scheduled', 'failed', 'partially_failed'], true)) {
            return;
        }

        $post->update(['status' => 'publishing']);

        $targets = $post->target_accounts ?? [];
        if ($targets === []) {
            $post->update([
                'status' => 'failed',
            ]);
            SocialPostResult::create([
                'social_post_id' => $post->id,
                'social_account_id' => null,
                'status' => 'failed',
                'error_message' => 'No target accounts were selected for this post.',
            ]);

            return;
        }

        $succeeded = 0;
        $failed = 0;

        foreach ($targets as $accountId) {
            $account = SocialAccount::find($accountId);

            if (!$account) {
                $failed++;
                $this->recordResult($post, $accountId, 'failed', 'The selected social account no longer exists.');
                continue;
            }

            if ($account->status !== 'connected' || !$account->access_token) {
                $failed++;
                $this->recordResult(
                    $post,
                    $accountId,
                    'failed',
                    ucfirst($account->platform).' is not connected. An administrator must connect this account '
                        .'in Admin → Integrations before posts can be published.'
                );
                continue;
            }

            try {
                // Each platform needs its own API client. Until one is configured for
                // this platform we fail loudly rather than reporting a false success.
                $platformPostId = $this->publishToPlatform($account, $post);

                $succeeded++;
                $this->recordResult($post, $accountId, 'published', null, $platformPostId);
            } catch (\Throwable $e) {
                $failed++;
                Log::error('Social publish failed', [
                    'post_id' => $post->id,
                    'account_id' => $accountId,
                    'platform' => $account->platform,
                    'error' => $e->getMessage(),
                ]);
                $this->recordResult($post, $accountId, 'failed', $e->getMessage());
            }
        }

        $post->update([
            'status' => match (true) {
                $failed === 0 => 'published',
                $succeeded === 0 => 'failed',
                default => 'partially_failed',
            },
            'published_at' => $succeeded > 0 ? now() : null,
        ]);

        if ($failed > 0) {
            \App\Services\Notifier::socialPostFailed(
                $post->id,
                $post->platform ?? 'social',
                "{$failed} of " . ($failed + $succeeded) . ' account(s) rejected the post.'
            );
        }
    }

    public function failed(\Throwable $e): void
    {
        SocialPost::where('id', $this->postId)->update(['status' => 'failed']);

        \App\Services\Notifier::socialPostFailed(
            $this->postId,
            SocialPost::find($this->postId)?->platform ?? 'social',
            $e->getMessage()
        );
    }

    /**
     * Dispatches to the correct platform client.
     *
     * No platform API clients are configured yet, so this throws a clear,
     * actionable error instead of pretending the post went out.
     */
    private function publishToPlatform(SocialAccount $account, SocialPost $post): ?string
    {
        throw new \RuntimeException(
            'No publishing client is configured for '.$account->platform.'. '
                .'The post remains saved and scheduled. An administrator must complete the '
                .ucfirst($account->platform).' app setup (OAuth credentials and publish permissions) '
                .'before this post can be delivered.'
        );
    }

    private function recordResult(
        SocialPost $post,
        ?int $accountId,
        string $status,
        ?string $error = null,
        ?string $platformPostId = null
    ): void {
        SocialPostResult::create([
            'social_post_id' => $post->id,
            'social_account_id' => $accountId,
            'platform_post_id' => $platformPostId,
            'status' => $status,
            'error_message' => $error,
            'published_at' => $status === 'published' ? now() : null,
        ]);
    }
}
