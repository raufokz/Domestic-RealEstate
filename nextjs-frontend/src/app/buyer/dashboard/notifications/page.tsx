"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";

const NOTIFICATIONS = [
  { id: 1, title: "New price reduction on saved property", detail: "Oceanfront Retreat dropped from $920K to $890K", time: "10 min ago", read: false, type: "price" },
  { id: 2, title: "New listing matches your search", detail: "Modern Penthouse Suite — 3 beds, Denver — $1.25M", time: "1h ago", read: false, type: "listing" },
  { id: 3, title: "Offer accepted!", detail: "The seller accepted your offer on Family Ranch Home", time: "3h ago", read: false, type: "offer" },
  { id: 4, title: "New message from Sarah Johnson", detail: "Great news! I have an update on the property inspection...", time: "5h ago", read: true, type: "message" },
  { id: 5, title: "Viewing reminder", detail: "You have a viewing scheduled tomorrow at 2:30 PM — Urban Loft Downtown", time: "1d ago", read: true, type: "appointment" },
  { id: 6, title: "Document ready for review", detail: "Your mortgage pre-approval letter is ready to download", time: "2d ago", read: true, type: "document" },
  { id: 7, title: "Market update", detail: "Miami market report: 3% price increase this quarter", time: "3d ago", read: true, type: "market" },
  { id: 8, title: "Search alert", detail: "3 new listings match \"NYC Luxury Condos under $2M\"", time: "4d ago", read: true, type: "alert" },
];

const TYPE_COLORS: Record<string, string> = {
  price: "bg-green-100 text-green-600",
  listing: "bg-blue-100 text-blue-600",
  offer: "bg-purple-100 text-purple-600",
  message: "bg-emerald-100 text-emerald-600",
  appointment: "bg-amber-100 text-amber-600",
  document: "bg-slate-100 text-slate-600",
  market: "bg-indigo-100 text-indigo-600",
  alert: "bg-rose-100 text-rose-600",
};

const TYPE_ICONS: Record<string, string> = {
  price: "M7 11l5-5m0 0l5 5m-5-5v12",
  listing: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  offer: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  message: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  appointment: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  document: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  market: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  alert: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
};

export default function BuyerNotificationsPage() {
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <BuyerLayout title="Notifications" subtitle="Stay updated on your property search and transactions.">
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
    </BuyerLayout>
  );
}
