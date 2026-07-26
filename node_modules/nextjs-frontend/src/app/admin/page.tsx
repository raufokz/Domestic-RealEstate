"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { apiGet } from "@/lib/api";
import NotificationBell from "@/components/admin/NotificationBell";

interface DashboardStats {
  total_users: number;
  total_agents: number;
  total_properties: number;
  active_properties: number;
  total_leads: number;
  new_leads: number;
  hot_leads: number;
  total_enquiries: number;
  pending_approvals: number;
  pending_agents: number;
  service_requests_new: number;
  contracts_pending: number;
  invoices_unpaid: number;
  invoices_total_unpaid: number;
  newsletter_subscribers: number;
  total_blogs: number;
  total_testimonials: number;
  total_faqs: number;
  active_campaigns: number;
}

interface DashboardData {
  stats: DashboardStats;
  recent_leads: any[];
  recent_properties: any[];
  recent_service_requests: any[];
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", active: true, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Users", href: "/admin/users", icon: "M12 4.354a4 4 0 110 7.292 4 4 0 010-7.292zM15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { label: "Leads", href: "/admin/leads", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "Properties", href: "/admin/properties", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { label: "Agents", href: "/admin/agents", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { label: "Blog", href: "/admin/blog", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
  { label: "SEO Pages", href: "/admin/seo", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
  { label: "Enquiries", href: "/admin/enquiries", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { label: "Settings", href: "/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  { label: "Integrations", href: "/admin/integrations", icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1H3a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" },
  { label: "AI Blog", href: "/admin/ai-blog", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { label: "Activity Logs", href: "/admin/logs", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      const data = await apiGet<DashboardData>("/admin/dashboard");
      setDashboardData(data);
      setError("");
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  const stats = dashboardData?.stats;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A2647] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} overflow-y-auto`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <Logo size="md" />
          <div>
            <span className="text-white font-bold text-sm block">Admin Panel</span>
            <span className="text-slate-400 text-xs">Domestic RE</span>
          </div>
        </div>
        <nav className="px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${item.active ? "bg-[#C9A227]/10 text-[#C9A227]" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="truncate">{item.label}</span>
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
              <h1 className="text-xl font-bold text-[#0A2647]">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm">Platform overview and management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchDashboard} className="p-2 text-slate-400 hover:text-slate-600" title="Refresh">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <NotificationBell />
            <div className="w-9 h-9 bg-[#0A2647] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AD</span>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A227]" />
              <span className="ml-3 text-slate-500">Loading dashboard...</span>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700 mb-3">{error}</p>
              <button onClick={fetchDashboard} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && stats && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: "Total Users", value: stats.total_users.toLocaleString(), change: "All time", color: "bg-blue-50 text-blue-600" },
                  { label: "Properties", value: stats.total_properties.toLocaleString(), change: `${stats.active_properties} active`, color: "bg-emerald-50 text-emerald-600" },
                  { label: "Leads", value: stats.total_leads.toLocaleString(), change: `${stats.new_leads} new`, color: "bg-amber-50 text-amber-600" },
                  { label: "Revenue", value: `$${(stats.invoices_total_unpaid / 1000).toFixed(0)}K`, change: `${stats.invoices_unpaid} unpaid`, color: "bg-purple-50 text-purple-600" },
                  { label: "Conversion Rate", value: "4.8%", change: "+0.3% vs last month", color: "bg-rose-50 text-rose-600" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-500">{stat.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stat.color}`}>{stat.change}</span>
                    </div>
                    <p className="text-2xl font-bold text-[#0A2647]">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h2 className="text-lg font-bold text-[#0A2647] mb-4">Recent Leads</h2>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Name</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Email</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                            <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {dashboardData?.recent_leads?.map((lead) => (
                            <tr key={lead.id} className="hover:bg-slate-50 transition">
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#0A2647] flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      {lead.first_name?.[0]}{lead.last_name?.[0]}
                                    </span>
                                  </div>
                                  <span className="font-medium text-[#0A2647] text-sm">{lead.first_name} {lead.last_name}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-sm text-slate-600">{lead.email}</td>
                              <td className="px-5 py-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                  lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {lead.status}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-xs text-slate-400 text-right">
                                {new Date(lead.created_at).toLocaleDateString()}
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
                    <h2 className="text-lg font-bold text-[#0A2647] mb-4">Quick Stats</h2>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Hot Leads</span>
                        <span className="text-sm font-medium text-red-600">{stats.hot_leads}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Pending Approvals</span>
                        <span className="text-sm font-medium text-yellow-600">{stats.pending_approvals}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Service Requests</span>
                        <span className="text-sm font-medium text-blue-600">{stats.service_requests_new}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Newsletter Subscribers</span>
                        <span className="text-sm font-medium text-[#0A2647]">{stats.newsletter_subscribers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Active Campaigns</span>
                        <span className="text-sm font-medium text-purple-600">{stats.active_campaigns}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#0A2647] mb-4">Content</h2>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Blog Posts</span>
                        <span className="text-sm font-medium text-[#0A2647]">{stats.total_blogs}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Testimonials</span>
                        <span className="text-sm font-medium text-[#0A2647]">{stats.total_testimonials}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">FAQs</span>
                        <span className="text-sm font-medium text-[#0A2647]">{stats.total_faqs}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
