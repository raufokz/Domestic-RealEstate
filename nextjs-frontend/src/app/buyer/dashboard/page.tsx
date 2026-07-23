"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";
import Link from "next/link";

const STATS = [
  { label: "Saved Properties", value: "12", change: "+3 this week", color: "bg-blue-50 text-blue-600" },
  { label: "Recent Searches", value: "8", change: "3 new alerts", color: "bg-emerald-50 text-emerald-600" },
  { label: "Recommended For You", value: "24", change: "Updated daily", color: "bg-purple-50 text-purple-600" },
  { label: "Messages", value: "5", change: "2 unread", color: "bg-amber-50 text-amber-600" },
];

const RECENT_ACTIVITY = [
  { id: 1, action: "Saved a property", detail: "Modern Villa with Pool — 123 Sunset Blvd", time: "2h ago", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", color: "bg-red-100 text-red-600" },
  { id: 2, action: "Scheduled a viewing", detail: "Downtown Luxury Condo — Jul 14 at 2:30 PM", time: "5h ago", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "bg-blue-100 text-blue-600" },
  { id: 3, action: "Submitted an offer", detail: "Suburban Family Home — $510,000", time: "1d ago", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "bg-amber-100 text-amber-600" },
  { id: 4, action: "New message from agent", detail: "Sarah Johnson: \"The seller accepted your offer!\"", time: "1d ago", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", color: "bg-emerald-100 text-emerald-600" },
  { id: 5, action: "Search alert triggered", detail: "3 new listings match \"Miami 3+ beds under $600K\"", time: "2d ago", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", color: "bg-purple-100 text-purple-600" },
];

const RECOMMENDED = [
  { id: 1, title: "Oceanfront Retreat", address: "222 Coastal Hwy, Miami Beach", price: "$890,000", match: "96%", beds: 3, baths: 2, sqft: "2,100", gradient: "from-cyan-400 to-blue-500" },
  { id: 2, title: "Urban Loft Downtown", address: "55 Main Street, Austin", price: "$445,000", match: "91%", beds: 2, baths: 1, sqft: "1,400", gradient: "from-violet-400 to-purple-500" },
  { id: 3, title: "Family Ranch Home", address: "890 Elm Circle, Dallas", price: "$375,000", match: "88%", beds: 4, baths: 3, sqft: "2,800", gradient: "from-emerald-400 to-teal-500" },
];

export default function BuyerDashboard() {
  return (
    <BuyerLayout title="Dashboard" subtitle="Welcome back! Here's your property search overview.">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{stat.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stat.color}`}>{stat.change}</span>
              </div>
              <p className="text-3xl font-bold text-[#0A2647] mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Search Properties", href: "/buyer/dashboard/searches", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", color: "bg-blue-500" },
            { label: "Schedule Viewing", href: "/buyer/dashboard/appointments", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "bg-emerald-500" },
            { label: "View Offers", href: "/buyer/dashboard/offers", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "bg-amber-500" },
            { label: "Mortgage Calculator", href: "/buyer/dashboard/mortgage", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1", color: "bg-purple-500" },
          ].map((action) => (
            <Link key={action.label} href={action.href} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#0A2647]">{action.label}</span>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0A2647]">Recent Activity</h2>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {RECENT_ACTIVITY.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
                  <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0A2647] text-sm">{item.action}</p>
                    <p className="text-slate-500 text-xs truncate">{item.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A2647] mb-4">Search Alerts</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-blue-800">Miami — 3+ beds</p>
                <p className="text-xs text-blue-600 mt-1">Under $600K • 3 new matches</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-sm font-semibold text-emerald-800">Austin — Family homes</p>
                <p className="text-xs text-emerald-600 mt-1">Under $500K • 1 new match</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm font-semibold text-purple-800">NYC — Luxury condos</p>
                <p className="text-xs text-purple-600 mt-1">No new matches today</p>
              </div>
              <Link href="/buyer/dashboard/searches" className="block text-center text-sm text-[#C9A227] hover:text-[#0A2647] font-semibold pt-2">
                Manage Alerts →
              </Link>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0A2647]">Recommended For You</h2>
            <Link href="/buyer/dashboard/searches" className="text-sm text-[#C9A227] hover:text-[#0A2647] font-semibold">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RECOMMENDED.map((prop) => (
              <div key={prop.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
                <div className={`h-40 bg-gradient-to-br ${prop.gradient} flex items-start justify-between p-4`}>
                  <span className="bg-white/90 backdrop-blur text-[#0A2647] px-3 py-1 rounded-lg text-sm font-bold">{prop.price}</span>
                  <span className="bg-[#C9A227] text-[#0A2647] px-2.5 py-1 rounded-lg text-xs font-bold">{prop.match} match</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#0A2647]">{prop.title}</h3>
                  <p className="text-slate-500 text-sm mt-1">{prop.address}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span>{prop.beds} Beds</span>
                    <span>{prop.baths} Baths</span>
                    <span>{prop.sqft} sqft</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}
