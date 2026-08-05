"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/realtor/dashboard", active: true, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Leads", href: "/realtor/dashboard/leads", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "Properties", href: "/realtor/dashboard/properties", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { label: "Profile", href: "/realtor/dashboard/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const LEADS = [
  { id: 1, name: "Jessica Park", email: "jessica@email.com", phone: "(555) 123-4567", status: "New", score: 92, source: "Website", time: "2h ago", avatar: "JP" },
  { id: 2, name: "Marcus Williams", email: "marcus@email.com", phone: "(555) 234-5678", status: "Contacted", score: 85, source: "Referral", time: "1d ago", avatar: "MW" },
  { id: 3, name: "Ana Rodriguez", email: "ana@email.com", phone: "(555) 345-6789", status: "Qualified", score: 78, source: "Zillow", time: "3d ago", avatar: "AR" },
  { id: 4, name: "David Kim", email: "david@email.com", phone: "(555) 456-7890", status: "Negotiation", score: 95, source: "Open House", time: "5d ago", avatar: "DK" },
];

const CALENDAR_EVENTS = [
  { id: 1, title: "Client Meeting - Park", time: "9:00 AM", date: "Jul 11", color: "bg-blue-500" },
  { id: 2, title: "Property Showing", time: "11:30 AM", date: "Jul 11", color: "bg-emerald-500" },
  { id: 3, title: "Offer Review Call", time: "2:00 PM", date: "Jul 12", color: "bg-amber-500" },
  { id: 4, title: "Team Sync", time: "4:00 PM", date: "Jul 12", color: "bg-purple-500" },
];

const PIPELINE = [
  { stage: "New", count: 12, color: "bg-blue-500" },
  { stage: "Contacted", count: 8, color: "bg-cyan-500" },
  { stage: "Qualified", count: 5, color: "bg-emerald-500" },
  { stage: "Negotiation", count: 3, color: "bg-amber-500" },
  { stage: "Closed", count: 2, color: "bg-green-600" },
];

export default function RealtorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A2647] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <Logo size="md" />
          <span className="text-white font-bold">Domestic RE</span>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${item.active ? "bg-[#C9A227]/10 text-[#C9A227]" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#0A2647]">Agent Dashboard</h1>
              <p className="text-slate-500 text-sm">Overview of your real estate business</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/realtors/join"
              className="bg-white hover:bg-slate-100 text-[#0A2647] font-bold text-xs px-3 py-2 rounded-xl shadow-sm border border-slate-200 transition flex items-center gap-1.5"
            >
              <span>Create Free Profile</span>
            </Link>
            <Link
              href="/register?role=agent"
              className="bg-[#C9A227] hover:bg-[#b8911f] text-[#0A2647] font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition flex items-center gap-1.5 border border-[#C9A227]/30"
            >
              <span>Purchase Plan</span>
            </Link>
            <Link
              href="/realtor/dashboard/profile"
              className="bg-[#0A2647] hover:bg-[#0d3366] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <span>Edit Profile</span>
            </Link>
            <button className="relative p-2 text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C9A227] rounded-full" />
            </button>
            <Link href="/realtor/dashboard/profile" className="w-9 h-9 bg-[#0A2647] rounded-full flex items-center justify-center hover:opacity-90 transition">
              <span className="text-white text-sm font-bold">SJ</span>
            </Link>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Profile Completeness & Setup Banner */}
          <div className="bg-gradient-to-r from-[#0A2647] to-[#143B6B] rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
            <div className="space-y-2 max-w-xl z-10">
              <div className="flex items-center gap-2">
                <span className="bg-[#C9A227] text-[#0A2647] text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  85% Complete
                </span>
                <span className="text-xs text-slate-300">MLS Board: MIAMI REALTORS®</span>
              </div>
              <h2 className="text-lg font-extrabold text-white">Complete Your Agent Profile to Unlock Premium Leads</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Verified agent profiles with headshots, MLS licenses, and specialties receive up to 4.2x more client inquiries and lead assignments on the platform.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10 w-full md:w-auto flex-wrap md:flex-nowrap justify-end">
              <Link
                href="/realtors/join"
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition whitespace-nowrap"
              >
                Join Network Free
              </Link>
              <Link
                href="/register?role=agent"
                className="bg-[#C9A227] hover:bg-[#b8911f] text-[#0A2647] font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition whitespace-nowrap"
              >
                Purchase Plan & Upgrade →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Leads", value: "30", change: "+8 this week", color: "bg-blue-50 text-blue-600", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
              { label: "Active Listings", value: "8", change: "+2 this month", color: "bg-emerald-50 text-emerald-600", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" },
              { label: "This Month Closings", value: "3", change: "+1 from last month", color: "bg-amber-50 text-amber-600", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Revenue", value: "$48.5K", change: "+15% vs last month", color: "bg-purple-50 text-purple-600", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{stat.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stat.color}`}>{stat.change}</span>
                </div>
                <p className="text-3xl font-bold text-[#0A2647] mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A2647] mb-4">Lead Pipeline</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-end gap-3 h-32">
                {PIPELINE.map((stage) => (
                  <div key={stage.stage} className="flex-1 flex flex-col items-center">
                    <span className="text-sm font-bold text-[#0A2647] mb-2">{stage.count}</span>
                    <div className={`w-full rounded-t-lg ${stage.color}`} style={{ height: `${(stage.count / 12) * 100}%` }} />
                    <span className="text-xs text-slate-500 mt-2">{stage.stage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Recent Leads</h2>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Lead</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Score</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Source</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {LEADS.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#0A2647] rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{lead.avatar}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-[#0A2647] text-sm">{lead.name}</p>
                              <p className="text-slate-500 text-xs">{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-sm font-bold ${lead.score >= 90 ? "text-green-600" : lead.score >= 70 ? "text-amber-600" : "text-slate-500"}`}>
                            {lead.score}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">{lead.source}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            lead.status === "New" ? "bg-blue-100 text-blue-700" :
                            lead.status === "Contacted" ? "bg-cyan-100 text-cyan-700" :
                            lead.status === "Qualified" ? "bg-green-100 text-green-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>{lead.status}</span>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-400 text-right">{lead.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Calendar</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                {CALENDAR_EVENTS.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition">
                    <div className={`w-1 h-10 rounded-full ${event.color}`} />
                    <div>
                      <p className="font-semibold text-[#0A2647] text-sm">{event.title}</p>
                      <p className="text-slate-500 text-xs">{event.date} · {event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
