"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

interface Conversation {
  id: number;
  name: string;
  role: string;
  property: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
}

const FALLBACK_CONVERSATIONS: Conversation[] = [
  { id: 1, name: "Sarah Johnson", role: "Agent", property: "Luxury Beachfront Villa", lastMessage: "The seller accepted your offer!", time: "2h ago", unread: 2, avatar: "SJ" },
  { id: 2, name: "Michael Chen", role: "Agent", property: "Modern Downtown Loft", lastMessage: "I've scheduled the inspection for Thursday.", time: "5h ago", unread: 0, avatar: "MC" },
  { id: 3, name: "Emily Davis", role: "Agent", property: "Suburban Family Estate", lastMessage: "Here are the disclosure documents you requested.", time: "1d ago", unread: 1, avatar: "ED" },
  { id: 4, name: "Lisa Anderson", role: "Agent", property: "Lakefront Cottage", lastMessage: "Would you like to make an offer?", time: "2d ago", unread: 0, avatar: "LA" },
];

const FALLBACK_MESSAGES: Message[] = [
  { id: 1, sender: "Sarah Johnson", content: "Hi! I wanted to let you know about the Beachfront Villa listing.", time: "10:00 AM", isMe: false },
  { id: 2, sender: "You", content: "Thanks Sarah! I'm very interested. What's the seller's timeline?", time: "10:15 AM", isMe: true },
  { id: 3, sender: "Sarah Johnson", content: "They're looking to close within 30 days. Would you like to schedule a viewing?", time: "10:20 AM", isMe: false },
  { id: 4, sender: "You", content: "Yes, let's do this weekend if possible.", time: "10:25 AM", isMe: true },
  { id: 5, sender: "Sarah Johnson", content: "The seller accepted your offer! Congratulations!", time: "2:30 PM", isMe: false },
];

export default function BuyerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(FALLBACK_CONVERSATIONS);
  const [messages] = useState<Message[]>(FALLBACK_MESSAGES);
  const [selectedId, setSelectedId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet<Conversation[]>("/buyer/messages");
        setConversations(result);
      } catch {
        setConversations(FALLBACK_CONVERSATIONS);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleSend() {
    if (!newMessage.trim()) return;
    try {
      await apiPost("/buyer/messages", { conversationId: selectedId, content: newMessage });
    } catch {
      // Silently fail
    }
    setNewMessage("");
  }

  return (
    <BuyerLayout title="Messages" subtitle="Chat with agents about your properties.">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : (
          <div className="flex h-full">
            <div className="w-80 border-r border-slate-200 flex flex-col">
              <div className="p-3 border-b border-slate-200">
                <input type="text" placeholder="Search conversations..." className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-[#C9A227]" />
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${selectedId === conv.id ? "bg-[#0A2647]/5" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0A2647] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{conv.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#0A2647] text-sm">{conv.name}</span>
                          <span className="text-xs text-slate-400">{conv.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{conv.property}</p>
                      </div>
                      {conv.unread > 0 && (
                        <span className="w-5 h-5 bg-[#C9A227] text-[#0A2647] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{conv.unread}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#0A2647] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">SJ</span>
                </div>
                <div>
                  <p className="font-semibold text-[#0A2647] text-sm">Sarah Johnson</p>
                  <p className="text-xs text-slate-400">Agent — Luxury Beachfront Villa</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${msg.isMe ? "bg-[#0A2647] text-white rounded-br-md" : "bg-slate-100 text-[#0A2647] rounded-bl-md"}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.isMe ? "text-white/50" : "text-slate-400"}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-slate-200 flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 rounded-full text-sm border border-slate-200 focus:outline-none focus:border-[#C9A227]"
                />
                <button onClick={handleSend} className="bg-[#C9A227] text-[#0A2647] p-2.5 rounded-full hover:bg-[#b8911f] transition">
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
