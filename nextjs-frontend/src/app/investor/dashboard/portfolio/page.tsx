"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api";

interface PortfolioResponse {
  data: unknown[];
  available: boolean;
  message: string;
}

export default function InvestorPortfolioPage() {
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<PortfolioResponse>("/investor/portfolio");
      setData(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your portfolio.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <InvestorLayout title="My Portfolio" subtitle="Properties you've acquired through the platform.">
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
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="text-4xl mb-3">🏗️</div>
            <h3 className="text-lg font-bold text-[#0A2647] mb-2">Acquired-Property Tracking Isn&apos;t Available Yet</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">{data?.message}</p>
            <Link href="/investor/dashboard/saved-properties" className="inline-block mt-6 px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
              View Saved Properties
            </Link>
          </div>
        )}
      </div>
    </InvestorLayout>
  );
}
