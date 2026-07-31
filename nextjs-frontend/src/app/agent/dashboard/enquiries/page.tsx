"use client";

import { useState } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { useFetch } from "@/hooks/useFetch";

interface Enquiry {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AgentEnquiriesPage() {
  const { data, loading } = useFetch<{ data: Enquiry[] }>("/agent/enquiries");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const enquiries = data?.data || [];
  const selected = enquiries.find((e) => e.id === selectedId);

  return (
    <AgentLayout title="Enquiries" subtitle="Manage messages from potential clients">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <input type="text" placeholder="Search enquiries..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
              ) : enquiries.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No enquiries yet</div>
              ) : (
                enquiries.map((enq) => (
                  <button
                    key={enq.id}
                    onClick={() => setSelectedId(enq.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${selectedId === enq.id ? "bg-[#C9A227]/10 border-l-3 border-l-[#C9A227]" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-slate-900 truncate">{enq.name}</span>
                      <span className="text-xs text-slate-400 flex-shrink-0">{new Date(enq.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{enq.subject || enq.message}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0A2647]">{selected.subject || "No Subject"}</h3>
                  <p className="text-sm text-slate-500">From: {selected.name} ({selected.email})</p>
                </div>
                <span className="text-xs text-slate-400">{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm resize-none"
                  placeholder="Type your reply..."
                />
                <button className="mt-3 px-6 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
                  Send Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Select an enquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </AgentLayout>
  );
}
