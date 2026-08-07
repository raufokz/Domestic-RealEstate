"use client";

import SellerLayout from "@/components/seller/SellerLayout";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiGet, ApiError } from "@/lib/api";

interface Valuation {
  id: number;
  address: string;
  estimatedValue: string | null;
  status: string;
  requestedAt: string;
}

export default function SellerValuationsPage() {
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<Valuation[]>("/seller/valuations");
      setValuations(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your valuation requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <SellerLayout title="Property Valuations" subtitle="Track your home valuation requests.">
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
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{valuations.length} valuation requests</span>
              <Link href="/sellers/request-valuation" className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
                + Request Valuation
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property Address</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Expected Value</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Requested</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {valuations.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{v.address}</td>
                        <td className="px-5 py-4 text-sm font-bold text-[#0A2647]">
                          {v.estimatedValue ? `$${Number(v.estimatedValue).toLocaleString()}` : "Pending review"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 text-blue-700 capitalize">{v.status}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">{v.requestedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {valuations.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  No valuation requests yet.{" "}
                  <Link href="/sellers/request-valuation" className="text-[#C9A227] font-semibold hover:underline">Request one now</Link>.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SellerLayout>
  );
}
