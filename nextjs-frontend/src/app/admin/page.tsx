"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";

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

export default function AdminDashboard() {
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
    <AdminLayout title="Admin Dashboard">
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
        <div className="space-y-6">
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
        </div>
      )}
    </AdminLayout>
  );
}
