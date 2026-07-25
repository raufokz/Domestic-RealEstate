"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/realtor/dashboard", active: false, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Leads", href: "/realtor/dashboard/leads", active: true, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "Properties", href: "/realtor/dashboard/properties", active: false, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" },
  { label: "Profile", href: "/realtor/dashboard/profile", active: false, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const KANBAN_COLUMNS = [
  {
    title: "New",
    color: "border-blue-500",
    headerBg: "bg-blue-500",
    leads: [
      { id: 1, name: "Sarah Thompson", score: 88, source: "Website", time: "1h ago", phone: "(555) 111-2222", priority: "high", avatar: "ST" },
      { id: 2, name: "James Wilson", score: 72, source: "Zillow", time: "3h ago", phone: "(555) 333-4444", priority: "medium", avatar: "JW" },
    ],
  },
  {
    title: "Contacted",
    color: "border-cyan-500",
    headerBg: "bg-cyan-500",
    leads: [
      { id: 3, name: "Emily Park", score: 91, source: "Referral", time: "1d ago", phone: "(555) 555-6666", priority: "high", avatar: "EP" },
      { id: 4, name: "Michael Brown", score: 65, source: "Social", time: "2d ago", phone: "(555) 777-8888", priority: "low", avatar: "MB" },
    ],
  },
  {
    title: "Qualified",
    color: "border-emerald-500",
    headerBg: "bg-emerald-500",
    leads: [
      { id: 5, name: "Lisa Anderson", score: 95, source: "Open House", time: "3d ago", phone: "(555) 999-0000", priority: "high", avatar: "LA" },
    ],
  },
  {
    title: "Scheduled",
    color: "border-amber-500",
    headerBg: "bg-amber-500",
    leads: [
      { id: 6, name: "David Kim", score: 82, source: "Website", time: "4d ago", phone: "(555) 123-4321", priority: "medium", avatar: "DK" },
    ],
  },
  {
    title: "Negotiation",
    color: "border-orange-500",
    headerBg: "bg-orange-500",
    leads: [
      { id: 7, name: "Rachel Green", score: 97, source: "Referral", time: "5d ago", phone: "(555) 234-5432", priority: "high", avatar: "RG" },
    ],
  },
  {
    title: "Converted",
    color: "border-green-600",
    headerBg: "bg-green-600",
    leads: [
      { id: 8, name: "Tom Harris", score: 90, source: "Zillow", time: "1w ago", phone: "(555) 345-6543", priority: "high", avatar: "TH" },
    ],
  },
];

export default function LeadsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

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
              <h1 className="text-xl font-bold text-[#0A2647]">Lead Pipeline</h1>
              <p className="text-slate-500 text-sm">Track and manage your leads through the pipeline</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="text-sm border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-[#C9A227] outline-none">
              <option value="all">All Types</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="investor">Investor</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-[#C9A227] outline-none">
              <option value="all">All Status</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </header>

        <div className="p-6">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map((column) => (
              <div key={column.title} className="w-72 flex-shrink-0">
                <div className={`rounded-t-xl border-t-4 ${column.color} bg-white rounded-b-xl border border-slate-200`}>
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${column.headerBg}`} />
                      <h3 className="font-semibold text-[#0A2647] text-sm">{column.title}</h3>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{column.leads.length}</span>
                  </div>
                  <div className="p-3 space-y-3 min-h-[200px]">
                    {column.leads.map((lead) => (
                      <div key={lead.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100 hover:shadow-md transition cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-[#0A2647] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{lead.avatar}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[#0A2647] text-sm truncate">{lead.name}</h4>
                            <p className="text-slate-500 text-xs">{lead.phone}</p>
                          </div>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${lead.score >= 90 ? "bg-green-100 text-green-700" : lead.score >= 70 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                            {lead.score}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{lead.source}</span>
                            <span className="text-xs text-slate-300">·</span>
                            <span className="text-xs text-slate-400">{lead.time}</span>
                          </div>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            lead.priority === "high" ? "bg-red-100 text-red-600" :
                            lead.priority === "medium" ? "bg-yellow-100 text-yellow-600" :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            {lead.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-100">
                          <button className="flex-1 text-xs text-slate-500 hover:text-[#0A2647] hover:bg-white rounded py-1 transition flex items-center justify-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call
                          </button>
                          <button className="flex-1 text-xs text-slate-500 hover:text-[#0A2647] hover:bg-white rounded py-1 transition flex items-center justify-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </button>
                          <button className="flex-1 text-xs text-slate-500 hover:text-[#0A2647] hover:bg-white rounded py-1 transition flex items-center justify-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Note
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
