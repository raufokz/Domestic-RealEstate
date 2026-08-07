"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api";

interface AnalyticsData {
  saved_properties_count: number;
  saved_properties_total_value: number;
  saved_properties_avg_price: number;
  investor_inquiries_submitted: number;
  note: string;
}

export default function InvestorAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<AnalyticsData>("/investor/analytics");
      setData(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <InvestorLayout title="Investment Activity" subtitle="Your real activity on the platform.">
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
        ) : data ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <span className="text-sm text-slate-500">Saved Properties</span>
                <p className="text-2xl font-bold text-[#0A2647] mt-2">{data.saved_properties_count}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <span className="text-sm text-slate-500">Total Tracked Value</span>
                <p className="text-2xl font-bold text-[#0A2647] mt-2">${data.saved_properties_total_value.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <span className="text-sm text-slate-500">Avg. Saved Price</span>
                <p className="text-2xl font-bold text-[#0A2647] mt-2">${data.saved_properties_avg_price.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <span className="text-sm text-slate-500">Inquiries Submitted</span>
                <p className="text-2xl font-bold text-[#0A2647] mt-2">{data.investor_inquiries_submitted}</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
              {data.note}
            </div>

            {data.saved_properties_count === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                Save some{" "}
                <Link href="/investor/dashboard/opportunities" className="text-[#C9A227] font-semibold hover:underline">opportunities</Link>{" "}
                to start tracking activity here.
              </div>
            )}
          </>
        ) : null}
      </div>
    </InvestorLayout>
  );
}
