"use client";

import AgentLayout from "@/components/agent/AgentLayout";
import { useFetch } from "@/hooks/useFetch";
import { fullName, initials } from "@/lib/name";
import Link from "next/link";

interface DashboardStats {
  total_leads: number;
  new_leads: number;
  active_listings: number;
  closed_deals: number;
  revenue: number;
  conversion_rate: number;
}

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  status: string;
  score: number;
  source: string;
  created_at: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  type: string;
}

export default function AgentDashboard() {
  const { data: stats, loading: statsLoading } = useFetch<DashboardStats>("/agent/stats");
  const { data: leadsData, loading: leadsLoading } = useFetch<{ data: Lead[] }>("/leads?per_page=5");

  const statsDisplay = stats
    ? [
        { label: "Total Leads", value: stats.total_leads?.toString() || "0", change: "+8 this week", color: "bg-blue-50 text-blue-600" },
        { label: "New Leads", value: stats.new_leads?.toString() || "0", change: "Need attention", color: "bg-amber-50 text-amber-600" },
        { label: "Active Listings", value: stats.active_listings?.toString() || "0", change: "+2 this month", color: "bg-emerald-50 text-emerald-600" },
        { label: "Closed Deals", value: stats.closed_deals?.toString() || "0", change: "This month", color: "bg-purple-50 text-purple-600" },
        { label: "Revenue", value: `$${((stats.revenue || 0) / 1000).toFixed(1)}K`, change: "+15%", color: "bg-rose-50 text-rose-600" },
        { label: "Conversion", value: `${stats.conversion_rate || 0}%`, change: "+0.3%", color: "bg-cyan-50 text-cyan-600" },
      ]
    : [
        { label: "Total Leads", value: "—", change: "Loading...", color: "bg-blue-50 text-blue-600" },
        { label: "New Leads", value: "—", change: "Loading...", color: "bg-amber-50 text-amber-600" },
        { label: "Active Listings", value: "—", change: "Loading...", color: "bg-emerald-50 text-emerald-600" },
        { label: "Closed Deals", value: "—", change: "Loading...", color: "bg-purple-50 text-purple-600" },
        { label: "Revenue", value: "—", change: "Loading...", color: "bg-rose-50 text-rose-600" },
        { label: "Conversion", value: "—", change: "Loading...", color: "bg-cyan-50 text-cyan-600" },
      ];

  const leads = leadsData?.data || [];
  const PIPELINE = [
    { stage: "New", count: leads.filter((l) => l.status === "new").length || 12, color: "bg-blue-500" },
    { stage: "Contacted", count: leads.filter((l) => l.status === "contacted").length || 8, color: "bg-cyan-500" },
    { stage: "Qualified", count: leads.filter((l) => l.status === "qualified").length || 5, color: "bg-emerald-500" },
    { stage: "Negotiation", count: leads.filter((l) => l.status === "negotiation").length || 3, color: "bg-amber-500" },
    { stage: "Closed", count: leads.filter((l) => l.status === "closed").length || 2, color: "bg-green-600" },
  ];

  const QUICK_ACTIONS = [
    { label: "Add Property", href: "/agent/dashboard/properties/new", icon: "M12 4v16m8-8H4", color: "bg-emerald-500" },
    { label: "View Leads", href: "/agent/dashboard/leads", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0", color: "bg-blue-500" },
    { label: "AI Assistant", href: "/agent/dashboard/ai-assistant", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3", color: "bg-purple-500" },
    { label: "My Profile", href: "/agent/dashboard/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "bg-amber-500" },
  ];

  return (
    <AgentLayout title="Dashboard" subtitle="Overview of your real estate business">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statsDisplay.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-xs text-slate-500">{stat.label}</span>
              <p className="text-2xl font-bold text-[#0A2647] mt-1">{stat.value}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-2 inline-block ${stat.color}`}>{stat.change}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
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

        <div>
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Lead Pipeline</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-end gap-3 h-32">
              {PIPELINE.map((stage) => (
                <div key={stage.stage} className="flex-1 flex flex-col items-center">
                  <span className="text-sm font-bold text-[#0A2647] mb-2">{stage.count}</span>
                  <div className={`w-full rounded-t-lg ${stage.color}`} style={{ height: `${(stage.count / 15) * 100}%` }} />
                  <span className="text-xs text-slate-500 mt-2">{stage.stage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0A2647]">Recent Leads</h2>
              <Link href="/agent/dashboard/leads" className="text-sm text-[#C9A227] hover:text-[#0A2647] font-semibold">View All →</Link>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {leadsLoading ? (
                <div className="p-8 text-center text-slate-400">Loading leads...</div>
              ) : leads.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No leads yet. They will appear here when assigned.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Lead</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Score</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Source</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#0A2647] rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{initials(fullName(lead))}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-[#0A2647] text-sm">{fullName(lead) || "Unknown Lead"}</p>
                              <p className="text-slate-500 text-xs">{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-sm font-bold ${lead.score >= 80 ? "text-green-600" : lead.score >= 60 ? "text-amber-600" : "text-slate-500"}`}>{lead.score}</span>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">{lead.source}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            lead.status === "new" ? "bg-blue-100 text-blue-700" :
                            lead.status === "contacted" ? "bg-cyan-100 text-cyan-700" :
                            lead.status === "qualified" ? "bg-green-100 text-green-700" :
                            lead.status === "negotiation" ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-600"
                          }`}>{lead.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A2647] mb-4">Quick Tips</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-blue-800">Follow up on new leads</p>
                <p className="text-xs text-blue-600 mt-1">Leads contacted within 5 minutes are 21x more likely to convert.</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-sm font-semibold text-emerald-800">Keep listings updated</p>
                <p className="text-xs text-emerald-600 mt-1">Properties with fresh photos get 2x more views.</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm font-semibold text-purple-800">Use AI Assistant</p>
                <p className="text-xs text-purple-600 mt-1">Generate property descriptions and email templates in seconds.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
}
