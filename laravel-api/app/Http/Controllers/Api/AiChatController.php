<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiConversation;
use App\Models\User;
use App\Models\Lead;
use App\Services\LeadCaptureService;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AiChatController extends Controller
{
    public function conversations(Request $request): JsonResponse {
        $query = AiConversation::with(['lead', 'assignedAgent']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('user_name', 'like', "%{$search}%")
                  ->orWhere('user_email', 'like', "%{$search}%")
                  ->orWhere('user_phone', 'like', "%{$search}%")
                  ->orWhere('session_id', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $conversations = $query->orderBy('updated_at', 'desc')->get();

        // Map database records to the shape the React frontend expects
        $data = $conversations->map(function($c) {
            $lastMessageContent = 'No messages yet';
            if (is_array($c->messages) && count($c->messages) > 0) {
                $lastMsg = end($c->messages);
                $lastMessageContent = $lastMsg['content'] ?? 'No messages yet';
            }

            // Calculate duration (e.g. from creation to update time or current time)
            $diff = $c->created_at->diff($c->updated_at);
            $duration = $diff->i . 'm ' . $diff->s . 's';
            if ($diff->h > 0) {
                $duration = $diff->h . 'h ' . $duration;
            }

            return [
                'id' => $c->id,
                'session_id' => $c->session_id,
                'user' => $c->user_name ?: ($c->user_email ?: 'Guest Chat'),
                'email' => $c->user_email,
                'phone' => $c->user_phone,
                'agent_type' => ucfirst($c->ai_type) . ' AI',
                'status' => $c->status ?? 'active', // waiting, active, resolved, escalated
                'last_message' => Str::limit($lastMessageContent, 80),
                'duration' => $duration,
                'unread' => 0,
                'qualification_score' => $c->qualification_score,
                'notes' => $c->notes,
                'assigned_agent_id' => $c->assigned_agent_id,
                'assigned_agent' => $c->assignedAgent ? $c->assignedAgent->name : null,
                'lead_id' => $c->lead_id,
                'created_at' => $c->created_at->toIso8601String(),
                'updated_at' => $c->updated_at->toIso8601String(),
            ];
        });

        return response()->json([
            'data' => $data
        ]);
    }

    public function conversation($id): JsonResponse {
        $c = AiConversation::with(['lead', 'assignedAgent'])->find($id);

        if (!$c) {
            return response()->json(['message' => 'Conversation not found'], 404);
        }

        // Map to Detail format expected by frontend
        $messages = [];
        if (is_array($c->messages)) {
            foreach ($c->messages as $m) {
                $sender = $m['role'] === 'user' ? 'user' : ($m['sender'] ?? 'agent');
                $messages[] = [
                    'id' => intval(microtime(true) * 1000) + rand(1, 1000),
                    'sender' => $sender,
                    'sender_name' => $m['sender_name'] ?? ($m['role'] === 'user' ? ($c->user_name ?: 'User') : 'AI Assistant'),
                    'content' => $m['content'] ?? '',
                    'timestamp' => $m['timestamp'] ?? $c->updated_at->toIso8601String(),
                    'avatar' => $m['role'] === 'user' ? '👤' : ($sender === 'admin' ? '👨‍💼' : '🤖')
                ];
            }
        }

        $detail = [
            'id' => $c->id,
            'session_id' => $c->session_id,
            'user' => $c->user_name ?: ($c->user_email ?: 'Guest Chat'),
            'email' => $c->user_email,
            'phone' => $c->user_phone,
            'ai_type' => $c->ai_type,
            'notes' => $c->notes,
            'status' => $c->status,
            'qualification_score' => $c->qualification_score,
            'assigned_agent_id' => $c->assigned_agent_id,
            'lead_id' => $c->lead_id,
            'user_context' => [
                'current_page' => $c->lead?->page_url ?: '/',
                'lead_status' => $c->lead?->status ?: 'new',
            ],
            'messages' => $messages
        ];

        return response()->json([
            'data' => $detail
        ]);
    }

    public function storeMessage(Request $request, $id): JsonResponse {
        $conversation = AiConversation::find($id);

        if (!$conversation) {
            return response()->json(['message' => 'Conversation not found'], 404);
        }

        $request->validate([
            'content' => 'required|string',
        ]);

        $sender = 'admin';
        $senderName = $request->user() ? $request->user()->name : 'Admin';
        
        $messages = $conversation->messages ?: [];
        $messages[] = [
            'role' => 'assistant',
            'sender' => $sender,
            'sender_name' => $senderName,
            'content' => $request->input('content'),
            'timestamp' => now()->toISOString()
        ];

        $conversation->update([
            'messages' => $messages,
            'status' => 'active'
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => intval(microtime(true) * 1000),
                'sender' => $sender,
                'sender_name' => $senderName,
                'content' => $request->input('content'),
                'timestamp' => now()->toIso8601String(),
                'avatar' => '👨‍💼'
            ]
        ]);
    }

    public function updateStatus(Request $request, $id): JsonResponse {
        $conversation = AiConversation::find($id);

        if (!$conversation) {
            return response()->json(['message' => 'Conversation not found'], 404);
        }

        $request->validate([
            'status' => 'required|string|in:active,completed,archived,waiting,escalated'
        ]);

        $conversation->update([
            'status' => $request->input('status')
        ]);

        return response()->json([
            'success' => true,
            'data' => $conversation
        ]);
    }

    public function assignAgent(Request $request, $id): JsonResponse {
        $conversation = AiConversation::find($id);

        if (!$conversation) {
            return response()->json(['message' => 'Conversation not found'], 404);
        }

        $request->validate([
            'assigned_agent_id' => 'nullable|exists:users,id'
        ]);

        $conversation->update([
            'assigned_agent_id' => $request->input('assigned_agent_id')
        ]);

        return response()->json([
            'success' => true,
            'data' => $conversation->load('assignedAgent')
        ]);
    }

    public function updateNotes(Request $request, $id): JsonResponse {
        $conversation = AiConversation::find($id);

        if (!$conversation) {
            return response()->json(['message' => 'Conversation not found'], 404);
        }

        $request->validate([
            'notes' => 'nullable|string'
        ]);

        $conversation->update([
            'notes' => $request->input('notes')
        ]);

        return response()->json([
            'success' => true,
            'data' => $conversation
        ]);
    }

    public function destroy($id): JsonResponse {
        $conversation = AiConversation::find($id);

        if (!$conversation) {
            return response()->json(['message' => 'Conversation not found'], 404);
        }

        $conversation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Conversation deleted successfully'
        ]);
    }

    public function analytics(): JsonResponse {
        $totalConversations = AiConversation::count();
        
        // Calculate average messages per conversation
        $allConvs = AiConversation::all();
        $totalMessagesCount = 0;
        foreach ($allConvs as $c) {
            if (is_array($c->messages)) {
                $totalMessagesCount += count($c->messages);
            }
        }
        $avgMessages = $totalConversations > 0 ? round($totalMessagesCount / $totalConversations, 1) : 0;

        // Calculate Lead Capture Rate
        $qualifiedCount = AiConversation::whereNotNull('lead_id')->count();
        $leadCaptureRate = $totalConversations > 0 ? round(($qualifiedCount / $totalConversations) * 100) : 0;

        // Calculate Escalation Rate
        $escalatedCount = AiConversation::where('status', 'escalated')->count();
        $escalationRate = $totalConversations > 0 ? round(($escalatedCount / $totalConversations) * 100) : 0;

        return response()->json([
            'total_conversations' => $totalConversations,
            'avg_response_time' => '12s',
            'lead_capture_rate' => $leadCaptureRate,
            'escalation_rate' => $escalationRate,
        ]);
    }
}
