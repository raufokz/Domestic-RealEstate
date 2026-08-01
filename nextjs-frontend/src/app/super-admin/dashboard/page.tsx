"use client";

import SuperAdminLayout from "@/components/super-admin/SuperAdminLayout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface SystemData {
  totalUsers: number;
  revenue: string;
  properties: number;
  activeSessions: number;
  apiResponseTime: string;
  databaseSize: string;
  queueLength: number;
  cacheHitRate: string;
  recentActivity: Array<{
    id: number;
    action: string;
    detail: string;
    time: string;
    type: string;
  }>;
}

const FALLBACK_DATA: SystemData = {
  totalUsers: 0,
  revenue: "$0.00",
  properties: 0,
  activeSessions: 0,
  apiResponseTime: "0ms",
  databaseSize: "0 GB",
  queueLength: 0,
  cacheHitRate: "0%",
  recentActivity: [],
};

export default function SuperAdminDashboard() {
  const [data, setData] = useState<SystemData>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet<SystemData>("/super-admin/dashboard");
        setData(result);
      } catch {
        setData(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const STATS = [
    { label: "Total Users", value: data.totalUsers.toLocaleString(), change: data.totalUsers > 0 ? "Active Users" : "No users yet", color: "bg-blue-50 text-blue-600" },
    { label: "Revenue", value: data.revenue, change: data.revenue !== "$0.00" ? "Platform Revenue" : "No revenue yet", color: "bg-emerald-50 text-emerald-600" },
    { label: "Properties", value: data.properties.toLocaleString(), change: data.properties > 0 ? "Listed properties" : "No properties yet", color: "bg-amber-50 text-amber-600" },
    { label: "Active Sessions", value: String(data.activeSessions), change: "Real-time", color: "bg-purple-50 text-purple-600" },
  ];

  const HEALTH = [
    { label: "API Response Time", value: data.apiResponseTime, status: "healthy", color: "bg-green-50 border-green-200", dot: "bg-green-500" },
    { label: "Database Size", value: data.databaseSize, status: "normal", color: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
    { label: "Queue Length", value: String(data.queueLength), status: data.queueLength > 50 ? "warning" : "healthy", color: data.queueLength > 50 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200", dot: data.queueLength > 50 ? "bg-amber-500" : "bg-green-500" },
    { label: "Cache Hit Rate", value: data.cacheHitRate, status: "healthy", color: "bg-green-50 border-green-200", dot: "bg-green-500" },
  ];

  const ACTIVITY_ICONS: Record<string, { color: string; icon: string }> = {
    user: { color: "bg-blue-100 text-blue-600", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    payment: { color: "bg-emerald-100 text-emerald-600", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1" },
    property: { color: "bg-amber-100 text-amber-600", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" },
    system: { color: "bg-purple-100 text-purple-600", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  };

  return (
    <SuperAdminLayout title="Super Admin Dashboard" subtitle="System administration & monitoring">
      <div className="space-y-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
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
                  <div key={item.label} className={`rounded-xl border p-5 ${item.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
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
                  { label: "User Management", href: "/super-admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z", color: "bg-blue-500" },
                  { label: "Revenue", href: "/super-admin/revenue", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1", color: "bg-emerald-500" },
                  { label: "Properties", href: "/super-admin/properties", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5", color: "bg-amber-500" },
                  { label: "System Settings", href: "/super-admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", color: "bg-purple-500" },
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
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Recent Activity</h2>
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {data.recentActivity.map((item) => {
                  const iconStyle = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.system;
                  return (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
                      <div className={`w-9 h-9 rounded-lg ${iconStyle.color} flex items-center justify-center flex-shrink-0`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconStyle.icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0A2647] text-sm">{item.action}</p>
                        <p className="text-slate-500 text-xs truncate">{item.detail}</p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{item.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
}
