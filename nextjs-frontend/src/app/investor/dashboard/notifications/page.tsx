"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";

const NOTIFICATIONS = [
  { id: 1, title: "New deal matches your buy-box", detail: "Distressed Ranch Home in Tampa — $185K, est. 18% ROI", time: "15 min ago", read: false, type: "deal" },
  { id: 2, title: "Price drop on saved property", detail: "Multi-Family Duplex reduced from $355K to $340K", time: "2h ago", read: false, type: "price" },
  { id: 3, title: "New message from Sarah Johnson", detail: "I found 3 off-market properties matching your criteria", time: "4h ago", read: false, type: "message" },
  { id: 4, title: "Rent collected", detail: "July rent for 1120 Pine Ave — $2,100 deposited", time: "1d ago", read: true, type: "financial" },
  { id: 5, title: "Portfolio milestone", detail: "Your portfolio value has exceeded $1.5M", time: "2d ago", read: true, type: "milestone" },
  { id: 6, title: "Inspection report ready", detail: "Report for 452 Oak Street is available for review", time: "3d ago", read: true, type: "document" },
  { id: 7, title: "Market alert — Miami", detail: "Rental demand up 8% in your target neighborhoods", time: "5d ago", read: true, type: "market" },
];

const TYPE_COLORS: Record<string, string> = {
  deal: "bg-emerald-100 text-emerald-600",
  price: "bg-blue-100 text-blue-600",
  message: "bg-purple-100 text-purple-600",
  financial: "bg-green-100 text-green-600",
  milestone: "bg-amber-100 text-amber-600",
  document: "bg-slate-100 text-slate-600",
  market: "bg-indigo-100 text-indigo-600",
};

const TYPE_ICONS: Record<string, string> = {
  deal: "M13 10V3L4 14h7v7l9-11h-7z",
  price: "M7 11l5-5m0 0l5 5m-5-5v12",
  message: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  financial: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v1",
  milestone: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  document: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  market: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
};

export default function InvestorNotificationsPage() {
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <InvestorLayout title="Notifications" subtitle="Stay updated on deals, portfolio, and market activity.">
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{unreadCount} unread notifications</span>
          <button className="text-sm text-[#C9A227] hover:text-[#0A2647] font-semibold transition">
            Mark all as read
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
          {NOTIFICATIONS.map((notif) => (
            <div key={notif.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition ${!notif.read ? "bg-blue-50/30" : ""}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[notif.type]}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={TYPE_ICONS[notif.type]} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#0A2647] text-sm">{notif.title}</p>
                  {!notif.read && <span className="w-2 h-2 bg-[#C9A227] rounded-full flex-shrink-0" />}
                </div>
                <p className="text-slate-500 text-xs mt-0.5">{notif.detail}</p>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{notif.time}</span>
            </div>
          ))}
        </div>
      </div>
    </InvestorLayout>
  );
}
