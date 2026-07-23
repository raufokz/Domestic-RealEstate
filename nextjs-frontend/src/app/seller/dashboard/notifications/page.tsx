"use client";

import SellerLayout from "@/components/seller/SellerLayout";

const NOTIFICATIONS = [
  { id: 1, title: "New inquiry from Michael Chen", detail: "Asked about the pool area at Sunset Villa with Pool", time: "2h ago", read: false, type: "inquiry" },
  { id: 2, title: "Showing scheduled", detail: "David Park will view the property on Jul 15 at 10:00 AM", time: "4h ago", read: false, type: "showing" },
  { id: 3, title: "New offer received", detail: "Lisa Rodriguez submitted an offer of $650,000", time: "1d ago", read: false, type: "offer" },
  { id: 4, title: "Listing viewed 50 times today", detail: "Your property is getting significant interest", time: "1d ago", read: true, type: "stats" },
  { id: 5, title: "Price suggestion", detail: "Based on market data, consider adjusting to $665,000", time: "2d ago", read: true, type: "price" },
  { id: 6, title: "Document uploaded", detail: "Property disclosure form has been added to your listing", time: "3d ago", read: true, type: "document" },
  { id: 7, title: "Marketing performance", detail: "Your listing received 156 views this week — 12% increase", time: "5d ago", read: true, type: "stats" },
];

const TYPE_COLORS: Record<string, string> = {
  inquiry: "bg-blue-100 text-blue-600",
  showing: "bg-purple-100 text-purple-600",
  offer: "bg-emerald-100 text-emerald-600",
  stats: "bg-amber-100 text-amber-600",
  price: "bg-rose-100 text-rose-600",
  document: "bg-slate-100 text-slate-600",
};

const TYPE_ICONS: Record<string, string> = {
  inquiry: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  showing: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  offer: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  stats: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  price: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1",
  document: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
};

export default function SellerNotificationsPage() {
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <SellerLayout title="Notifications" subtitle="Stay updated on your listing activity and buyer interactions.">
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
    </SellerLayout>
  );
}
