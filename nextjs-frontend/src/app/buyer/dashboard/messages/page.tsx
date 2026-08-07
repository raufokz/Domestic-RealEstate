"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";
import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Conversation {
  id: number;
  name: string;
  role: string;
  property: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface Message {
  id: number | string;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
}

export default function BuyerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { notifyError } = useToast();

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<Conversation[]>("/buyer/messages");
      setConversations(result);
      if (result.length > 0) setSelectedId((prev) => prev ?? result[0].id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedId) return;
    setThreadLoading(true);
    apiGet<{ data: Message[] }>(`/buyer/messages/${selectedId}`)
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]))
      .finally(() => setThreadLoading(false));
  }, [selectedId]);

  async function handleSend() {
    if (!newMessage.trim() || !selectedId) return;
    setSending(true);
    try {
      await apiPost("/buyer/messages", { conversationId: selectedId, content: newMessage });
      setNewMessage("");
      const res = await apiGet<{ data: Message[] }>(`/buyer/messages/${selectedId}`);
      setMessages(res.data);
      fetchConversations();
    } catch (e) {
      notifyError(e, "Could not send this message.");
    } finally {
      setSending(false);
    }
  }

  const selected = conversations.find((c) => c.id === selectedId);

  return (
    <BuyerLayout title="Messages" subtitle="Your enquiry threads with agents.">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
              {error}
              <button onClick={fetchConversations} className="ml-3 underline font-semibold">Retry</button>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6 text-center text-slate-400 text-sm">
            No messages yet. Contact an agent from a property page to start a conversation.
          </div>
        ) : (
          <div className="flex h-full">
            <div className="w-80 border-r border-slate-200 flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${selectedId === conv.id ? "bg-[#0A2647]/5" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0A2647] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{conv.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#0A2647] text-sm">{conv.name}</span>
                          <span className="text-xs text-slate-400">{conv.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{conv.property}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              {selected && (
                <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#0A2647] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{selected.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A2647] text-sm">{selected.name}</p>
                    <p className="text-xs text-slate-400">{selected.role} — {selected.property}</p>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {threadLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C9A227]" />
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${msg.isMe ? "bg-[#0A2647] text-white rounded-br-md" : "bg-slate-100 text-[#0A2647] rounded-bl-md"}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.isMe ? "text-white/50" : "text-slate-400"}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-5 py-3 border-t border-slate-200 flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 bg-slate-50 rounded-full text-sm border border-slate-200 focus:outline-none focus:border-[#C9A227] disabled:opacity-50"
                />
                <button onClick={handleSend} disabled={sending || !newMessage.trim()} className="bg-[#C9A227] text-[#0A2647] p-2.5 rounded-full hover:bg-[#b8911f] transition disabled:opacity-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
