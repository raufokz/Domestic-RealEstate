"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";

const CONVERSATIONS = [
  { id: 1, name: "Sarah Johnson", role: "Agent", lastMessage: "I have a new off-market deal that matches your criteria", time: "10 min ago", unread: 2, initials: "SJ" },
  { id: 2, name: "Marcus Williams", role: "Wholesaler", lastMessage: "The Tampa duplex is still available, want to walk through?", time: "1h ago", unread: 0, initials: "MW" },
  { id: 3, name: "Emily Chen", role: "Property Manager", lastMessage: "Rent collected for July — $4,200 deposited", time: "3h ago", unread: 1, initials: "EC" },
  { id: 4, name: "David Park", role: "Lender", lastMessage: "Your pre-approval for the BRRRR loan is ready", time: "1d ago", unread: 0, initials: "DP" },
  { id: 5, name: "Rachel Adams", role: "Inspector", lastMessage: "Inspection report for 452 Oak Street is complete", time: "2d ago", unread: 0, initials: "RA" },
];

export default function InvestorMessagesPage() {
  return (
    <InvestorLayout title="Messages" subtitle="Communicate with agents, wholesalers, and service providers.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{CONVERSATIONS.length} conversations · {CONVERSATIONS.filter((c) => c.unread > 0).length} unread</span>
          <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            + New Message
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
          {CONVERSATIONS.map((conv) => (
            <div key={conv.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition cursor-pointer">
              <div className="w-11 h-11 bg-[#0A2647] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {conv.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#0A2647] text-sm">{conv.name}</p>
                  <span className="text-xs text-slate-400">· {conv.role}</span>
                  {conv.unread > 0 && (
                    <span className="bg-[#C9A227] text-[#0A2647] text-xs font-bold px-1.5 py-0.5 rounded-full">{conv.unread}</span>
                  )}
                </div>
                <p className="text-slate-500 text-xs truncate mt-0.5">{conv.lastMessage}</p>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{conv.time}</span>
            </div>
          ))}
        </div>
      </div>
    </InvestorLayout>
  );
}
