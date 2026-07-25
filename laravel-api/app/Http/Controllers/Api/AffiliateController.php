<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AffiliateProfile;
use App\Models\AffiliateReferralClick;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AffiliateController extends Controller
{
    public function dashboard() {
        $user = Auth::user();
        $profile = AffiliateProfile::firstOrCreate(
            ['user_id' => $user->id],
            ['unique_code' => AffiliateProfile::generateCode()]
        );
        return response()->json([
            'profile' => $profile,
            'recent_clicks' => $profile->clicks()->latest()->limit(20)->get(),
            'stats' => [
                'total_clicks' => $profile->total_clicks,
                'total_conversions' => $profile->total_conversions,
                'total_earnings' => $profile->total_earnings,
                'pending_payout' => $profile->pending_payout,
            ],
        ]);
    }

    public function trackClick(Request $request, $code) {
        $profile = AffiliateProfile::where('unique_code', $code)->where('status', 'active')->first();
        if (!$profile) return response()->json(['error' => 'Invalid referral code'], 404);

        $ipHash = hash('sha256', $request->ip() . config('app.key'));
        $uaHash = hash('sha256', $request->userAgent() . config('app.key'));

        $existing = AffiliateReferralClick::where('affiliate_id', $profile->id)
            ->where('ip_hash', $ipHash)
            ->where('user_agent_hash', $uaHash)
            ->where('created_at', '>=', now()->subDays(60))
            ->first();

        if (!$existing) {
            AffiliateReferralClick::create([
                'affiliate_id' => $profile->id,
                'ip_hash' => $ipHash,
                'user_agent_hash' => $uaHash,
                'landing_page' => $request->query('page'),
                'referrer_url' => $request->header('referer'),
            ]);
            $profile->increment('total_clicks');
        }

        return response()->json(['redirect' => url('/')]);
    }
}
