"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, ApiError } from "@/lib/api";

interface PropertyAnalyticsRow {
  property_id: number;
  title: string;
  views: number;
  inquiries: number;
  clicks: number;
}

interface AnalyticsStats {
  total_views: number;
  total_inquiries: number;
  total_clicks: number;
  tracked_properties: number;
}

interface AnalyticsPayload {
  stats: AnalyticsStats;
  data: PropertyAnalyticsRow[];
  has_data: boolean;
  period: string;
}

interface AnalyticsResponse {
  success?: boolean;
  message?: string;
  data: AnalyticsPayload;
}

const EMPTY_STATS: AnalyticsStats = {
  total_views: 0,
  total_inquiries: 0,
  total_clicks: 0,
  tracked_properties: 0,
};

export default function PropertyAnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats>(EMPTY_STATS);
  const [data, setData] = useState<PropertyAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("30d");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiGet<AnalyticsResponse>(`/admin/properties/analytics?range=${dateRange}`);
      const payload = res.data;
      setStats(payload?.stats ?? EMPTY_STATS);
      setData(Array.isArray(payload?.data) ? payload.data : []);
    } catch (e) {
      // No silent fallback to fabricated data: surface the real error + retry.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load property analytics. Please check the API connection and try again."
      );
      setStats(EMPTY_STATS);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AdminLayout title="Property Analytics">
      <div className="space-y-6">
        {/* Date Range */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">Performance overview</p>
          <div className="flex gap-2">
            {[
              { label: "7D", value: "7d" },
              { label: "30D", value: "30d" },
              { label: "90D", value: "90d" },
              { label: "1Y", value: "365d" },
            ].map((r) => (
              <button
                key={r.value}
                onClick={() => setDateRange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === r.value
                    ? "bg-[#0A2647] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchData}
              className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse h-24" />
            ))}
          </div>
        ) : (
          !error && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Views", value: stats.total_views.toLocaleString(), icon: "👁️", color: "bg-[#0A2647] text-white" },
                { label: "Inquiries", value: stats.total_inquiries.toLocaleString(), icon: "💬", color: "bg-white border border-gray-200" },
                { label: "Clicks", value: stats.total_clicks.toLocaleString(), icon: "🖱️", color: "bg-white border border-gray-200" },
                { label: "Tracked Properties", value: stats.tracked_properties.toLocaleString(), icon: "🏠", color: "bg-[#C9A227]/10 border border-[#C9A227]/30" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl p-5 ${s.color}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div className="min-w-0">
                      <p className={`text-xl font-bold truncate ${s.color.includes("text-white") ? "text-white" : "text-[#0A2647]"}`}>{s.value}</p>
                      <p className={`text-xs ${s.color.includes("text-white") ? "text-white/80" : "text-gray-500"}`}>{s.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Table */}
        {!loading && !error && data.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-[#0A2647]">Top Properties by Views</h3>
              <p className="text-xs text-gray-500 mt-0.5">Aggregated from tracked traffic over the selected period</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Property</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Views</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Inquiries</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((row) => (
                    <tr key={row.property_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{row.views.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{row.inquiries.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{row.clicks.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No analytics data yet</h3>
            <p className="text-gray-500 text-sm">
              Property view and inquiry metrics will appear here once your listings start receiving traffic.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
