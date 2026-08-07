"use client";

import LenderLayout from "@/components/lender/LenderLayout";
import { useEffect, useState, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api";

interface DashboardData {
  total_applications: number;
  pending_applications: number;
  approved_applications: number;
  total_requested_volume: number;
  lender_linked: boolean;
  recent_applications: Array<{
    id: number;
    borrower: string;
    lender: string;
    amount: number;
    rate: string | null;
    status: string;
    date: string;
  }>;
}

export default function LenderDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<DashboardData>("/lender/dashboard");
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
    { label: "Total Applications", value: String(data.total_applications), color: "bg-blue-50 text-blue-600" },
    { label: "Pending", value: String(data.pending_applications), color: "bg-amber-50 text-amber-600" },
    { label: "Approved", value: String(data.approved_applications), color: "bg-emerald-50 text-emerald-600" },
    { label: "Requested Volume", value: `$${data.total_requested_volume.toLocaleString()}`, color: "bg-purple-50 text-purple-600" },
  ] : [];

  return (
    <LenderLayout title="Dashboard" subtitle="Mortgage applications submitted by buyers on the platform.">
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
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              These are platform-wide mortgage applications self-reported by buyers — they are not yet assigned
              to individual lender accounts, so every lender currently sees the same list.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
                  <span className="text-sm text-slate-500">{stat.label}</span>
                  <p className="text-3xl font-bold text-[#0A2647] mt-2">{stat.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Recent Applications</h2>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Borrower</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Lender</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Rate</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data?.recent_applications ?? []).map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4"><span className="font-semibold text-[#0A2647] text-sm">{app.borrower}</span></td>
                          <td className="px-5 py-4 text-sm text-slate-600">{app.lender}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">${app.amount.toLocaleString()}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">{app.rate ? `${app.rate}%` : "—"}</td>
                          <td className="px-5 py-4">
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 text-blue-700">{app.status}</span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500">{app.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(data?.recent_applications ?? []).length === 0 && (
                  <div className="p-8 text-center text-slate-400">No mortgage applications submitted yet.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </LenderLayout>
  );
}
