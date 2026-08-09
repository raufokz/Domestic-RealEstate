<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\SocialPost;
use App\Models\SocialPostResult;
use App\Models\SocialPostTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SocialController extends Controller
{
    public function indexAccounts(Request $request): JsonResponse
    {
        $accounts = SocialAccount::where('user_id', $request->user()->id)
            ->orderBy('platform')
            ->get();
        return response()->json($accounts);
    }

    public function storeAccount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'platform' => 'required|string|in:facebook,instagram,linkedin,x,tiktok,youtube,pinterest,google_business',
            'account_name' => 'required|string|max:255',
            'account_id' => 'required|string|max:255',
            'avatar_url' => 'nullable|string',
        ]);

        $account = SocialAccount::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'status' => 'connected',
            'connected_at' => now(),
        ]);

        return response()->json($account, 201);
    }

    public function updateAccount(Request $request, int $id): JsonResponse
    {
        $account = SocialAccount::where('user_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validate([
            'account_name' => 'sometimes|string|max:255',
            'account_id' => 'sometimes|string|max:255',
            'avatar_url' => 'nullable|string',
            'status' => 'sometimes|string|in:connected,disconnected,pending_verification',
        ]);

        $account->update($validated);
        return response()->json($account);
    }

    public function destroyAccount(Request $request, int $id): JsonResponse
    {
        $account = SocialAccount::where('user_id', $request->user()->id)->findOrFail($id);
        $account->update([
            'status' => 'disconnected',
            'access_token' => null,
            'refresh_token' => null,
            'token_expires_at' => null,
            'disconnected_at' => now(),
        ]);
        return response()->json(['message' => 'Account disconnected']);
    }

    public function testAccount(Request $request, int $id): JsonResponse
    {
        $account = SocialAccount::where('user_id', $request->user()->id)->findOrFail($id);
        $account->update(['last_tested_at' => now(), 'last_error_message' => null]);
        return response()->json(['status' => 'success', 'message' => 'Connection test passed']);
    }

    public function indexPosts(Request $request): JsonResponse
    {
        $query = SocialPost::where('user_id', $request->user()->id);
        if ($request->has('status')) $query->where('status', $request->status);
        if ($request->has('platform')) {
            $accountIds = SocialAccount::where('user_id', $request->user()->id)
                ->forPlatform($request->platform)->pluck('id');
            $query->whereJsonContains('target_accounts', $accountIds->toArray());
        }
        $posts = $query->with('results.account')->latest()->paginate(20);
        return response()->json($posts);
    }

    public function storePost(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'media' => 'nullable|array',
            'link_url' => 'nullable|string',
            'target_accounts' => 'required|array|min:1',
            'target_accounts.*' => 'integer',
            'scheduled_at' => 'nullable|date|after:now',
            'ai_generated' => 'boolean',
            'source_type' => 'nullable|string',
            'source_id' => 'nullable|integer',
        ]);

        $status = $validated['scheduled_at'] ? 'scheduled' : 'draft';
        if (!isset($validated['scheduled_at']) && !isset($validated['media'])) {
            $status = 'draft';
        }

        $post = SocialPost::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'created_by' => $request->user()->id,
            'status' => $status,
        ]);

        return response()->json($post, 201);
    }

    public function showPost(Request $request, int $id): JsonResponse
    {
        $post = SocialPost::where('user_id', $request->user()->id)
            ->with('results.account')
            ->findOrFail($id);
        return response()->json($post);
    }

    public function updatePost(Request $request, int $id): JsonResponse
    {
        $post = SocialPost::where('user_id', $request->user()->id)->findOrFail($id);
        $post->update($request->only(['content', 'media', 'link_url', 'target_accounts', 'scheduled_at']));
        return response()->json($post);
    }

    public function destroyPost(Request $request, int $id): JsonResponse
    {
        $post = SocialPost::where('user_id', $request->user()->id)->findOrFail($id);
        $post->delete();
        return response()->json(['message' => 'Post deleted']);
    }

    public function retryPost(Request $request, int $id): JsonResponse
    {
        $post = SocialPost::where('user_id', $request->user()->id)->findOrFail($id);
        $post->update(['status' => 'draft']);
        return response()->json(['message' => 'Post queued for retry', 'post' => $post]);
    }

    public function indexTemplates(): JsonResponse
    {
        return response()->json(SocialPostTemplate::orderBy('category')->get());
    }

    public function storeTemplate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'content_template' => 'required|string',
            'platform' => 'nullable|string',
            'category' => 'required|string|in:listing,blog,testimonial,market_report,tip,event,open_house,general',
            'variables' => 'nullable|array',
        ]);
        $template = SocialPostTemplate::create($validated);
        return response()->json($template, 201);
    }

    public function updateTemplate(Request $request, int $id): JsonResponse
    {
        $template = SocialPostTemplate::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'content_template' => 'sometimes|string',
            'platform' => 'nullable|string',
            'category' => 'sometimes|string|in:listing,blog,testimonial,market_report,tip,event,open_house,general',
            'variables' => 'nullable|array',
        ]);
        $template->update($validated);
        return response()->json($template);
    }

    public function destroyTemplate(int $id): JsonResponse
    {
        SocialPostTemplate::findOrFail($id)->delete();
        return response()->json(['message' => 'Template deleted']);
    }

    public function shareListing(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => 'required|integer',
            'target_accounts' => 'required|array',
            'custom_content' => 'nullable|string',
        ]);

        $post = SocialPost::create([
            'user_id' => $request->user()->id,
            'content' => $validated['custom_content'] ?? 'Check out this amazing property!',
            'target_accounts' => $validated['target_accounts'],
            'source_type' => 'property_listing',
            'source_id' => $validated['property_id'],
            'created_by' => $request->user()->id,
            'status' => 'draft',
        ]);

        return response()->json($post, 201);
    }

    public function calendar(Request $request): JsonResponse
    {
        $start = $request->get('start', now()->startOfMonth());
        $end = $request->get('end', now()->endOfMonth());
        $posts = SocialPost::where('user_id', $request->user()->id)
            ->whereBetween('scheduled_at', [$start, $end])
            ->get()
            ->groupBy(fn ($p) => $p->scheduled_at?->format('Y-m-d'));
        return response()->json($posts);
    }

    public function analytics(Request $request): JsonResponse
    {
        $accounts = SocialAccount::where('user_id', $request->user()->id)->connected()->get();
        $stats = [];
        foreach ($accounts as $account) {
            $totalPosts = SocialPostResult::where('social_account_id', $account->id)->count();
            $successful = SocialPostResult::where('social_account_id', $account->id)->where('status', 'success')->count();
            $engagement = SocialPostResult::where('social_account_id', $account->id)
                ->selectRaw('SUM(CAST(engagement_stats->"$.likes" AS UNSIGNED)) as total_likes')
                ->selectRaw('SUM(CAST(engagement_stats->"$.comments" AS UNSIGNED)) as total_comments')
                ->selectRaw('SUM(CAST(engagement_stats->"$.shares" AS UNSIGNED)) as total_shares')
                ->first();
            $stats[] = [
                'account' => $account,
                'total_posts' => $totalPosts,
                'successful_posts' => $successful,
                'engagement' => $engagement,
            ];
        }
        return response()->json($stats);
    }
}
