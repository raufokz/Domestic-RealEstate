"use client";

import TitleLayout from "@/components/title/TitleLayout";
import { useEffect, useState, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api";

interface DashboardData {
  active_closings: number;
  completed_this_month: number;
  title_linked: boolean;
  recent_closings: Array<{
    id: number;
    property: string;
    buyer: string;
    amount: number;
    closing_date: string | null;
    status: string;
  }>;
}

export default function TitleDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<DashboardData>("/title/dashboard");
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

  return (
    <TitleLayout title="Dashboard" subtitle="Accepted offers heading toward closing.">
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
              This platform doesn&apos;t yet have a dedicated title/escrow order system — the list below is every
              accepted offer platform-wide (each one needs title work), not filtered to your title company.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <span className="text-sm text-slate-500">Active Closings</span>
                <p className="text-3xl font-bold text-[#0A2647] mt-2">{data?.active_closings ?? 0}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <span className="text-sm text-slate-500">Closing This Month</span>
                <p className="text-3xl font-bold text-[#0A2647] mt-2">{data?.completed_this_month ?? 0}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Accepted Offers</h2>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Buyer</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Closing Date</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data?.recent_closings ?? []).map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{row.property}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">{row.buyer}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">${row.amount.toLocaleString()}</td>
                          <td className="px-5 py-4 text-sm text-slate-500">{row.closing_date || "Not set"}</td>
                          <td className="px-5 py-4">
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 text-blue-700">{row.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(data?.recent_closings ?? []).length === 0 && (
                  <div className="p-8 text-center text-slate-400">No accepted offers yet.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </TitleLayout>
  );
}
