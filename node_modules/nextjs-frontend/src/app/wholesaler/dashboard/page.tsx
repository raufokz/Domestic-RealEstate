"use client";

import WholesalerLayout from "@/components/wholesaler/WholesalerLayout";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api";

interface DealProperty {
  id: number;
  title: string;
  address: string;
  city: string | null;
  state: string | null;
  asking_price: number | null;
  arv: number | null;
  status: "draft" | "new" | "under_contract" | "assigned" | "closed";
  created_at: string;
  assigned_buyer?: { id: number; name: string } | null;
}

interface DashboardData {
  stats: {
    active_deals: number;
    total_buyers: number;
    deals_closed: number;
    avg_assignment_fee: number;
  };
  recent_deals: DealProperty[];
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-500",
  new: "bg-blue-100 text-blue-700",
  under_contract: "bg-amber-100 text-amber-700",
  assigned: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-500",
};

function formatMoney(n: number | null): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function WholesalerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<DashboardData>("/wholesaler/dashboard");
      setData(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const stats = data
    ? [
        { label: "Active Deals", value: String(data.stats.active_deals), color: "bg-blue-50 text-blue-600" },
        { label: "Total Buyers", value: String(data.stats.total_buyers), color: "bg-emerald-50 text-emerald-600" },
        { label: "Deals Closed", value: String(data.stats.deals_closed), color: "bg-purple-50 text-purple-600" },
        { label: "Avg. Assignment Fee", value: formatMoney(data.stats.avg_assignment_fee), color: "bg-amber-50 text-amber-600" },
      ]
    : [];

  return (
    <WholesalerLayout title="Wholesaler Dashboard" subtitle="Manage your deals and buyer network.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-700 text-sm">{error}</p>
            <button onClick={fetchDashboard} className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:opacity-90">
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
                  <span className="text-sm text-slate-500">{stat.label}</span>
                  <p className="text-3xl font-bold text-[#0A2647] mt-2">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Submit Deal", href: "/wholesaler/dashboard/submit-deal", icon: "M12 4v16m8-8H4", color: "bg-[#C9A227]" },
                { label: "View Deals", href: "/wholesaler/dashboard/deals", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "bg-blue-500" },
                { label: "Manage Buyers", href: "/wholesaler/dashboard/buyers", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "bg-emerald-500" },
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

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#0A2647]">Recent Deals</h2>
                <Link href="/wholesaler/dashboard/deals" className="text-sm text-[#C9A227] hover:text-[#0A2647] font-semibold">View All →</Link>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {(data?.recent_deals.length ?? 0) === 0 ? (
                  <div className="py-16 text-center text-slate-500 text-sm">
                    No deals yet. <Link href="/wholesaler/dashboard/submit-deal" className="text-[#0A2647] font-semibold hover:underline">Submit your first deal</Link>.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Deal</th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Asking Price</th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">ARV</th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                          <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Submitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data?.recent_deals.map((deal) => (
                          <tr key={deal.id} className="hover:bg-slate-50 transition">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-[#0A2647] text-sm">{deal.title}</p>
                              <p className="text-slate-500 text-xs">{[deal.address, deal.city, deal.state].filter(Boolean).join(", ")}</p>
                            </td>
                            <td className="px-5 py-4 text-sm font-medium text-[#0A2647]">{formatMoney(deal.asking_price)}</td>
                            <td className="px-5 py-4 text-sm font-medium text-emerald-600">{formatMoney(deal.arv)}</td>
                            <td className="px-5 py-4">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[deal.status]}`}>{deal.status.replace("_", " ")}</span>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-400 text-right">{new Date(deal.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </WholesalerLayout>
  );
}
