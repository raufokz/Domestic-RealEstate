"use client";

import BrokerLayout from "@/components/broker/BrokerLayout";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api";

interface BrokerDashboardData {
  team_agents: number;
  team_listings: number;
  team_revenue: number;
  team_leads: number;
  top_agents: unknown[];
  team_activity: unknown[];
  team_linked: boolean;
}

export default function BrokerDashboard() {
  const [data, setData] = useState<BrokerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<BrokerDashboardData>("/broker/dashboard");
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
    <BrokerLayout title="Dashboard" subtitle="Brokerage performance and team overview.">
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
        ) : !data?.team_linked ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="text-4xl mb-3">🏢</div>
            <h3 className="text-lg font-bold text-[#0A2647] mb-2">Team Roster Isn&apos;t Linked Yet</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Agent profiles currently only store a free-text brokerage name, not a real link to a broker
              account, so a live team roster and performance rollup can&apos;t be shown here yet.
            </p>
            <Link href="/admin/agents" className="inline-block mt-6 px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
              View All Agents
            </Link>
          </div>
        ) : null}
      </div>
    </BrokerLayout>
  );
}
