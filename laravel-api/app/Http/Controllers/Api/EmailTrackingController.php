<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SentEmail;
use App\Models\EmailTracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class EmailTrackingController extends Controller
{
    public function trackOpen(Request $request, $trackingId)
    {
        try {
            $sentEmail = SentEmail::where('tracking_id', $trackingId)->first();
            if ($sentEmail) {
                $sentEmail->update([
                    'opened_at' => $sentEmail->opened_at ?? now(),
                    'open_tracked' => true,
                ]);

                $historyId = $sentEmail->metadata['email_history_id'] ?? null;
                if ($historyId) {
                    \App\Models\EmailHistory::where('id', $historyId)->increment('opens');
                    EmailTracking::create([
                        'email_history_id' => $historyId,
                        'type' => 'open',
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                    ]);
                }
            }
        } catch (\Exception $e) {
            // silently fail
        }

        return Response::make(base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), 200, [
            'Content-Type' => 'image/gif',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ]);
    }

    public function trackClick(Request $request, $trackingId, $linkIndex)
    {
        try {
            $sentEmail = SentEmail::where('tracking_id', $trackingId)->first();
            if ($sentEmail) {
                $sentEmail->update([
                    'clicked_at' => $sentEmail->clicked_at ?? now(),
                    'click_tracked' => true,
                ]);

                $historyId = $sentEmail->metadata['email_history_id'] ?? null;
                if ($historyId) {
                    \App\Models\EmailHistory::where('id', $historyId)->increment('clicks');
                    EmailTracking::create([
                        'email_history_id' => $historyId,
                        'type' => 'click',
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                        'metadata' => ['link_index' => $linkIndex, 'url' => $request->fullUrl()],
                    ]);
                }
            }
        } catch (\Exception $e) {
            // silently fail
        }

        return redirect($request->query('url', '/'));
    }

    public function unsubscribe($token)
    {
        return view('unsubscribe', ['token' => $token]);
    }

    public function processUnsubscribe(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        \App\Models\EmailUnsubscribe::updateOrCreate(
            ['email' => strtolower($request->email)],
            ['token' => \Illuminate\Support\Str::random(32)]
        );

        return response()->json(['message' => 'You have been unsubscribed successfully.']);
    }
}
