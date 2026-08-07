"use client";

import SuperAdminLayout from "@/components/super-admin/SuperAdminLayout";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api";

interface DashboardStats {
  total_users: number;
  total_properties: number;
  active_properties: number;
  total_leads: number;
  new_leads: number;
  invoices_total_unpaid: number;
}

interface DashboardData {
  stats: DashboardStats;
  recent_leads: Array<{ id: number; first_name: string; last_name: string; type: string; created_at: string }>;
}

interface SystemHealth {
  database: string;
  queue: { pending: number | null; failed: number | null };
  disk_usage: { used_percent: number | null };
  memory: { used: string };
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardRes, healthRes] = await Promise.all([
        apiGet<DashboardData>("/admin/dashboard"),
        apiGet<{ data: SystemHealth }>("/admin/system-health"),
      ]);
      setData(dashboardRes);
      setHealth(healthRes.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = data?.stats;

  const STATS = stats ? [
    { label: "Total Users", value: stats.total_users.toLocaleString(), change: "Registered accounts", color: "bg-blue-50 text-blue-600" },
    { label: "Unpaid Invoices", value: `$${stats.invoices_total_unpaid.toLocaleString()}`, change: "Outstanding", color: "bg-emerald-50 text-emerald-600" },
    { label: "Properties", value: stats.total_properties.toLocaleString(), change: `${stats.active_properties} active`, color: "bg-amber-50 text-amber-600" },
    { label: "New Leads", value: stats.new_leads.toLocaleString(), change: `${stats.total_leads} total`, color: "bg-purple-50 text-purple-600" },
  ] : [];

  const HEALTH = health ? [
    { label: "Database", value: health.database === "connected" ? "Connected" : "Disconnected", healthy: health.database === "connected" },
    { label: "Disk Usage", value: health.disk_usage.used_percent != null ? `${health.disk_usage.used_percent}%` : "—", healthy: (health.disk_usage.used_percent ?? 0) < 85 },
    { label: "Queue Pending", value: health.queue.pending != null ? String(health.queue.pending) : "—", healthy: (health.queue.pending ?? 0) < 100 },
    { label: "Memory Used", value: health.memory.used, healthy: true },
  ] : [];

  return (
    <SuperAdminLayout title="Super Admin Dashboard" subtitle="System administration & monitoring">
      <div className="space-y-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
            {error}
            <button onClick={fetchData} className="ml-3 underline font-semibold">Retry</button>
          </div>
        ) : (
          <>
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

            <div>
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">System Health</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {HEALTH.map((item) => (
                  <div key={item.label} className={`rounded-xl border p-5 ${item.healthy ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.healthy ? "bg-green-500" : "bg-amber-500"}`} />
                      <span className="text-sm font-medium text-slate-600">{item.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-[#0A2647]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "User Management", href: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z", color: "bg-blue-500" },
                  { label: "Analytics", href: "/admin/analytics", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1", color: "bg-emerald-500" },
                  { label: "Properties", href: "/admin/properties", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5", color: "bg-amber-500" },
                  { label: "System Settings", href: "/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", color: "bg-purple-500" },
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
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Recent Leads</h2>
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {(data?.recent_leads ?? []).map((lead) => (
                  <div key={lead.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0A2647] text-sm">{lead.first_name} {lead.last_name}</p>
                      <p className="text-slate-500 text-xs truncate capitalize">{lead.type} lead</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
                {(data?.recent_leads ?? []).length === 0 && (
                  <div className="p-8 text-center text-slate-400">No recent leads.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
}
