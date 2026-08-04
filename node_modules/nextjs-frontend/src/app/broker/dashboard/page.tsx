"use client";

import BrokerLayout from "@/components/broker/BrokerLayout";
import Link from "next/link";

const STATS = [
  { label: "Team Agents", value: "12", change: "+2 this quarter", color: "bg-blue-50 text-blue-600" },
  { label: "Total Team Listings", value: "91", change: "+14 this month", color: "bg-emerald-50 text-emerald-600" },
  { label: "Team Revenue", value: "$284K", change: "+22% vs last month", color: "bg-amber-50 text-amber-600" },
  { label: "Team Leads", value: "156", change: "28 new this week", color: "bg-purple-50 text-purple-600" },
];

const TOP_AGENTS = [
  { id: 1, name: "Sarah Johnson", listings: 24, sold: 18, revenue: "$142K", rating: 4.9, avatar: "SJ", status: "Top Performer" },
  { id: 2, name: "Lisa Anderson", listings: 21, sold: 16, revenue: "$124K", rating: 4.9, avatar: "LA", status: "Top Performer" },
  { id: 3, name: "Michael Chen", listings: 19, sold: 14, revenue: "$108K", rating: 4.7, avatar: "MC", status: "Active" },
  { id: 4, name: "Emily Davis", listings: 15, sold: 11, revenue: "$86K", rating: 4.8, avatar: "ED", status: "Active" },
  { id: 5, name: "Robert Wilson", listings: 12, sold: 9, revenue: "$72K", rating: 4.6, avatar: "RW", status: "Active" },
];

const TEAM_ACTIVITY = [
  { id: 1, agent: "Sarah Johnson", action: "Closed a deal", detail: "123 Oak Lane — $485,000", time: "1h ago", color: "bg-green-100 text-green-600", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: 2, agent: "Michael Chen", action: "Added a new listing", detail: "456 Maple Dr — $725,000", time: "3h ago", color: "bg-blue-100 text-blue-600", icon: "M12 4v16m8-8H4" },
  { id: 3, agent: "Emily Davis", action: "Scheduled 3 viewings", detail: "Pine St & Cedar Ave properties", time: "5h ago", color: "bg-amber-100 text-amber-600", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { id: 4, agent: "Lisa Anderson", action: "Generated 5 leads", detail: "Open house at Skyline Blvd", time: "1d ago", color: "bg-purple-100 text-purple-600", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" },
  { id: 5, agent: "Robert Wilson", action: "Offer accepted", detail: "Beachfront Villa — $2.1M", time: "2d ago", color: "bg-emerald-100 text-emerald-600", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

const REVENUE_BY_AGENT = [
  { name: "Sarah Johnson", revenue: 142000, percentage: 25 },
  { name: "Lisa Anderson", revenue: 124000, percentage: 22 },
  { name: "Michael Chen", revenue: 108000, percentage: 19 },
  { name: "Emily Davis", revenue: 86000, percentage: 15 },
  { name: "Robert Wilson", revenue: 72000, percentage: 13 },
];

export default function BrokerDashboard() {
  return (
    <BrokerLayout title="Dashboard" subtitle="Brokerage performance and team overview.">
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
            { label: "Manage Team", href: "/broker/dashboard/team", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "bg-blue-500" },
            { label: "Team Listings", href: "/broker/dashboard/listings", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5", color: "bg-emerald-500", disabled: true },
            { label: "Analytics", href: "/broker/dashboard/analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "bg-amber-500", disabled: true },
            { label: "Website", href: "/broker/dashboard/website", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9", color: "bg-purple-500", disabled: true },
          ].map((action) =>
            action.disabled ? (
              <div
                key={action.label}
                aria-disabled="true"
                title={`${action.label} is not available yet`}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 opacity-50 cursor-not-allowed select-none"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-[#0A2647]">{action.label}</span>
              </div>
            ) : (
              <Link
                key={action.label}
                href={action.href}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:shadow-md hover:border-[#C9A227]/40 transition"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-[#0A2647]">{action.label}</span>
              </Link>
            )
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0A2647]">Top Performing Agents</h2>
              <Link href="/broker/dashboard/team" className="text-sm text-[#C9A227] hover:text-[#0A2647] font-semibold">View All →</Link>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Agent</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Listings</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Sold</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Revenue</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Rating</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {TOP_AGENTS.map((agent) => (
                      <tr key={agent.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#0A2647] rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{agent.avatar}</span>
                            </div>
                            <span className="font-medium text-[#0A2647] text-sm">{agent.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">{agent.listings}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{agent.sold}</td>
                        <td className="px-5 py-3 text-sm font-medium text-[#0A2647]">{agent.revenue}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-[#C9A227]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-medium text-[#0A2647]">{agent.rating}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${agent.status === "Top Performer" ? "bg-[#C9A227]/10 text-[#C9A227]" : "bg-emerald-100 text-emerald-700"}`}>
                            {agent.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Revenue by Agent</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                {REVENUE_BY_AGENT.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">{item.name}</span>
                      <span className="text-sm font-bold text-[#0A2647]">${(item.revenue / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-[#C9A227] h-2 rounded-full transition-all" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Recent Team Activity</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                {TEAM_ACTIVITY.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition">
                    <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#0A2647] text-sm">{item.agent}</span>
                        <span className="text-xs text-slate-400">{item.time}</span>
                      </div>
                      <p className="text-xs text-slate-600">{item.action}</p>
                      <p className="text-xs text-slate-500 truncate">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrokerLayout>
  );
}
