"use client";

import StaffLayout from "@/components/staff/StaffLayout";
import { useEffect, useState, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api";

interface DashboardData {
  pending_tasks: number;
  assigned_leads: number;
  completed_today: number;
  recent_tasks: Array<{ id: number; title: string; priority: string; due: string | null; status: string }>;
}

export default function StaffDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<DashboardData>("/staff/dashboard");
      setData(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const STATS = data ? [
    { label: "Pending Tasks", value: String(data.pending_tasks), color: "bg-amber-50 text-amber-600" },
    { label: "Assigned Leads", value: String(data.assigned_leads), color: "bg-blue-50 text-blue-600" },
    { label: "Completed Today", value: String(data.completed_today), color: "bg-emerald-50 text-emerald-600" },
  ] : [];

  return (
    <StaffLayout title="Dashboard" subtitle="Daily operations and task management">
      <div className="space-y-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
                  <span className="text-sm text-slate-500">{stat.label}</span>
                  <p className="text-2xl font-bold text-[#0A2647] mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-lg font-bold text-[#0A2647] mb-4">Upcoming Tasks</h2>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {(data?.recent_tasks ?? []).map((task) => (
                    <div key={task.id} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.priority === "High" ? "bg-red-500" :
                        task.priority === "Medium" ? "bg-amber-400" :
                        "bg-slate-300"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#0A2647] text-sm">{task.title}</p>
                        <p className="text-xs text-slate-500">Due: {task.due || "No due date"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          task.priority === "High" ? "bg-red-100 text-red-700" :
                          task.priority === "Medium" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">{task.status}</span>
                      </div>
                    </div>
                  ))}
                  {(data?.recent_tasks ?? []).length === 0 && (
                    <div className="p-8 text-center text-slate-400">No tasks assigned to you yet.</div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#0A2647] mb-4">Quick Actions</h2>
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                  {[
                    { label: "Add New Task", icon: "M12 4v16m8-8H4" },
                    { label: "View All Leads", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" },
                    { label: "Generate Report", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                    { label: "Send Follow-up", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                  ].map((action) => (
                    <span
                      key={action.label}
                      aria-disabled="true"
                      title={`${action.label} is not available yet`}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed select-none"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                      </svg>
                      {action.label}
                      <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400 border border-slate-300 rounded px-1.5 py-0.5">
                        Soon
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </StaffLayout>
  );
}
