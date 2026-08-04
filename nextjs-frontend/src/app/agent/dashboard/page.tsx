"use client";

import AgentLayout from "@/components/agent/AgentLayout";
import { useFetch } from "@/hooks/useFetch";
import { initials } from "@/lib/name";
import Link from "next/link";

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  created_at: string | null;
  lead: { id: number; full_name: string | null; lead_number: string | null; status: string } | null;
}

interface DashboardPayload {
  active_listings: number;
  pending_listings: number;
  sold_properties: number;
  draft_listings: number;
  total_listings: number;
  total_assigned_leads: number;
  new_leads: number;
  converted_leads: number;
  pipeline: Record<string, number>;
  purchased_marketplace_leads: number;
  pay_at_closing_leads: number;
  new_messages: number;
  open_tasks: number;
  upcoming_appointments: number;
  recent_activity: RecentActivity[];
  earnings:
    | { enabled: boolean; total: number; commissions: number; closed_deals_volume: number; closed_deals: number; this_month: number }
    | { enabled: false };
}

const PIPELINE_STAGES = [
  { key: "new", label: "New", color: "bg-blue-500" },
  { key: "contacted", label: "Contacted", color: "bg-cyan-500" },
  { key: "qualified", label: "Qualified", color: "bg-emerald-500" },
  { key: "scheduled", label: "Scheduled", color: "bg-teal-500" },
  { key: "negotiation", label: "Negotiation", color: "bg-amber-500" },
  { key: "converted", label: "Converted", color: "bg-green-600" },
  { key: "lost", label: "Lost", color: "bg-slate-400" },
];

function money(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AgentDashboard() {
  const { data, loading, error } = useFetch<DashboardPayload>("/agent/dashboard");

  if (loading) {
    return (
      <AgentLayout title="Dashboard" subtitle="Overview of your real estate business">
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
              <div className="h-6 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      </AgentLayout>
    );
  }

  if (error) {
    return (
      <AgentLayout title="Dashboard" subtitle="Overview of your real estate business">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">{error}</div>
      </AgentLayout>
    );
  }

  const d = data as DashboardPayload;
  const pipelineTotal = Math.max(
    1,
    PIPELINE_STAGES.reduce((acc, s) => acc + (d.pipeline[s.key] || 0), 0)
  );

  const stats = [
    { label: "Active Listings", value: String(d.active_listings), sub: `${d.total_listings} total`, color: "bg-emerald-50 text-emerald-600", href: "/agent/dashboard/properties" },
    { label: "Pending Approval", value: String(d.pending_listings), sub: `${d.draft_listings} drafts`, color: "bg-amber-50 text-amber-600", href: "/agent/dashboard/properties" },
    { label: "Sold Properties", value: String(d.sold_properties), sub: "closed deals", color: "bg-purple-50 text-purple-600", href: "/agent/dashboard/properties" },
    { label: "Assigned Leads", value: String(d.total_assigned_leads), sub: `${d.new_leads} new this period`, color: "bg-blue-50 text-blue-600", href: "/agent/dashboard/leads" },
    { label: "Converted", value: String(d.converted_leads), sub: "won deals", color: "bg-cyan-50 text-cyan-600", href: "/agent/dashboard/leads" },
    { label: "Marketplace Leads", value: String(d.purchased_marketplace_leads), sub: "purchased", color: "bg-rose-50 text-rose-600", href: "/marketplace" },
    { label: "Pay-at-Closing", value: String(d.pay_at_closing_leads), sub: "claims", color: "bg-orange-50 text-orange-600", href: "/agent/dashboard/pay-at-closing" },
    { label: "New Messages", value: String(d.new_messages), sub: "unread", color: "bg-indigo-50 text-indigo-600", href: "/agent/dashboard/messages" },
    { label: "Open Tasks", value: String(d.open_tasks), sub: "pending", color: "bg-teal-50 text-teal-600", href: "/agent/dashboard/leads" },
    { label: "Appointments", value: String(d.upcoming_appointments), sub: "upcoming", color: "bg-fuchsia-50 text-fuchsia-600", href: "/agent/dashboard/calendar" },
  ];

  return (
    <AgentLayout title="Dashboard" subtitle="Overview of your real estate business">
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs text-slate-500">{stat.label}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stat.color}`}>{stat.sub}</span>
              </div>
              <p className="text-2xl font-bold text-[#0A2647] mt-1">{stat.value}</p>
            </Link>
          ))}

          <div className="bg-gradient-to-br from-[#0A2647] to-[#123c6e] rounded-xl p-4 text-white">
            <span className="text-xs text-slate-300">Earnings</span>
            {d.earnings.enabled ? (
              <>
                <p className="text-2xl font-bold mt-1">{money(d.earnings.total)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {d.earnings.commissions} commissions · {d.earnings.closed_deals} closed · {money(d.earnings.this_month)} this month
                </p>
              </>
            ) : (
              <p className="text-sm font-medium mt-2 text-slate-300">Hidden by admin</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Lead Pipeline</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-end gap-2 sm:gap-3 h-32">
              {PIPELINE_STAGES.map((stage) => {
                const count = d.pipeline[stage.key] || 0;
                return (
                  <div key={stage.key} className="flex-1 flex flex-col items-center">
                    <span className="text-sm font-bold text-[#0A2647] mb-2">{count}</span>
                    <div
                      className={`w-full rounded-t-lg ${stage.color} transition-all`}
                      style={{ height: `${Math.max(count > 0 ? (count / pipelineTotal) * 100 : 0, 4)}%` }}
                    />
                    <span className="text-[10px] sm:text-xs text-slate-500 mt-2">{stage.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0A2647]">Recent Activity</h2>
              <Link href="/agent/dashboard/leads" className="text-sm text-[#C9A227] hover:text-[#0A2647] font-semibold">View Leads →</Link>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {d.recent_activity.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No activity yet on your assigned leads.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {d.recent_activity.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition">
                      <div className="w-9 h-9 bg-[#0A2647] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {a.lead?.full_name ? initials(a.lead.full_name) : "•"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate">{a.description || a.type}</p>
                        <p className="text-xs text-slate-400">
                          {a.lead?.full_name ? `${a.lead.full_name} · ${a.lead.lead_number || "lead"}` : "Lead"}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(a.created_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A2647] mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/marketplace" className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-lg bg-[#C9A227] flex items-center justify-center text-[#0A2647] font-black">$</div>
                <div>
                  <p className="text-sm font-semibold text-[#0A2647]">Buy Marketplace Leads</p>
                  <p className="text-xs text-slate-500">Pay-per-lead exclusive opportunities</p>
                </div>
              </Link>
              <Link href="/agent/dashboard/pay-at-closing" className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black">%</div>
                <div>
                  <p className="text-sm font-semibold text-[#0A2647]">Claim Pay-at-Closing Leads</p>
                  <p className="text-xs text-slate-500">Commission due when the deal closes</p>
                </div>
              </Link>
              <Link href="/agent/dashboard/properties/new" className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-lg bg-[#0A2647] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0A2647]">Add Property</p>
                  <p className="text-xs text-slate-500">List a new property for sale</p>
                </div>
              </Link>
              <Link href="/agent/dashboard/calendar" className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0A2647]">Schedule Appointment</p>
                  <p className="text-xs text-slate-500">Showings, open houses, reminders</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
}
