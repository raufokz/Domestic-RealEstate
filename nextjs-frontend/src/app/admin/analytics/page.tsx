"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Skeleton from "@/components/Skeleton";
import { apiGet } from "@/lib/api";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  period_days: number;
  page_views: {
    total: number;
    unique_visitors: number;
    by_day: { date: string; views: number }[];
    top_pages: { path: string; views: number }[];
    referer_sources: { referer: string; count: number }[];
  };
  leads: {
    total: number;
    by_day: { date: string; count: number }[];
    by_source: { source: string; count: number }[];
    by_status: { status: string; count: number }[];
    by_type: { type: string; count: number }[];
    conversion_rate: string;
  };
  properties: {
    total: number;
    active: number;
    by_type: { property_type_id: number; count: number }[];
  };
  campaigns: {
    total: number;
    total_sent: number;
    total_opens: number;
    total_clicks: number;
    open_rate: string;
    click_rate: string;
  };
  agents: {
    id: number;
    name: string;
    total_leads: number;
    converted_leads: number;
    conversion_rate: string;
  }[];
  revenue: {
    total_invoices: number;
    total_collected: number;
  };
  blog: {
    total_blog_views: number;
    by_day: { date: string; views: number }[];
    top_posts: { blog_id: number; views: number }[];
    referer_sources: { referer: string; count: number }[];
  };
}

const NAVY = "#0A2647";
const GOLD = "#C9A227";
const BURGUNDY = "#8B1E3F";
const COLORS = [NAVY, GOLD, BURGUNDY, "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const periods = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
];

export default function AnalyticsReportingPage() {
  const [activeDays, setActiveDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [blogData, setBlogData] = useState<AnalyticsData['blog'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPageData = useCallback(async (days: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<AnalyticsData>(`/admin/analytics?days=${days}`);
      setData(result);
    } catch (err: any) {
      setError(err?.message || "Failed to load analytics data");
    }
  }, []);

  const fetchBlogData = useCallback(async (days: number) => {
    setError(null);
    try {
      const result = await apiGet<{ blog: AnalyticsData['blog'] }>(`/admin/blog-analytics?days=${days}`);
      setBlogData(result.blog);
    } catch (err: any) {
      setError(err?.message || "Failed to load blog analytics data");
    }
  }, []);

  useEffect(() => {
    fetchPageData(activeDays);
    fetchBlogData(activeDays);
  }, [activeDays, fetchPageData, fetchBlogData]);

  useEffect(() => {
    fetchData(activeDays);
  }, [activeDays, fetchData]);

  useEffect(() => {
    fetchData(activeDays);
  }, [activeDays, fetchData]);

  const handlePeriodChange = (days: number) => {
    setActiveDays(days);
  };

  return (
    <AdminLayout title="Analytics & Reporting">
      <div className="space-y-6">
        {/* Period Selector */}
<div className="flex flex-wrap items-center gap-2">
          {periods.map((p) => (
            <button
              key={p.days}
              onClick={() => handlePeriodChange(p.days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeDays === p.days
                  ? "bg-[#0A2647] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            key="blog"
            onClick={() => setActiveDays(30)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeDays === 30 ? "bg-[#0A2647] text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            Blog
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <AnalyticsSkeleton />
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Page Views" value={data.page_views.total.toLocaleString()} />
              <KpiCard label="Unique Visitors" value={data.page_views.unique_visitors.toLocaleString()} />
              <KpiCard label="Total Leads" value={data.leads.total.toLocaleString()} />
              <KpiCard label="Conversion Rate" value={data.leads.conversion_rate} />
              <KpiCard label="Active Properties" value={data.properties.active.toLocaleString()} sub={`${data.properties.total} total`} />
              <KpiCard label="Campaigns Sent" value={data.campaigns.total.toLocaleString()} sub={`Open rate: ${data.campaigns.open_rate}`} />
              <KpiCard label="Revenue Collected" value={`$${Number(data.revenue.total_collected || 0).toLocaleString()}`} sub={`${data.revenue.total_invoices} invoices`} />
              <KpiCard label="Agents" value={String(data.agents.length)} />
              <KpiCard label="Blog Views" value={data.blog?.total_blog_views.toLocaleString() ?? '0'} />
            </div>

            {/* Page Views Trend & Leads by Source */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Page Views Trend">
                {data.page_views.by_day.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.page_views.by_day}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }}
                      />
                      <Line type="monotone" dataKey="views" stroke={NAVY} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No page view data for this period" />
                )}
              </ChartCard>

              <ChartCard title="Leads by Source">
                {data.leads.by_source.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.leads.by_source}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="source" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }}
                      />
                      <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No lead source data for this period" />
                )}
              </ChartCard>
            </div>

            {/* Leads by Status & Agent Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Leads by Status">
                {data.leads.by_status.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.leads.by_status}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }: { name?: string | number; percent?: number }) => `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                        labelLine={{ strokeWidth: 1 }}
                      >
                        {data.leads.by_status.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No lead status data" />
                )}
              </ChartCard>

              <ChartCard title="Agent Performance">
                {data.agents.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.agents} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} stroke="#94A3B8" />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }}
                      />
                      <Legend />
                      <Bar dataKey="total_leads" name="Total Leads" fill={NAVY} radius={[0, 4, 4, 0]} />
                      <Bar dataKey="converted_leads" name="Converted" fill={GOLD} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No agent data available" />
                )}
              </ChartCard>
            </div>

            {/* Leads by Day */}
            <ChartCard title="Leads Over Time" fullWidth>
              {data.leads.by_day.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.leads.by_day}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }}
                    />
                    <Line type="monotone" dataKey="count" stroke={BURGUNDY} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No lead data for this period" />
              )}
            </ChartCard>

            {/* Top Pages & Referrer Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-[#0A2647]">Top Pages</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Path</th>
                        <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-3">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.page_views.top_pages.length > 0 ? (
                        data.page_views.top_pages.map((p) => (
                          <tr key={p.path} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3 text-sm font-mono text-slate-700">{p.path}</td>
                            <td className="px-6 py-3 text-sm text-slate-700 font-medium text-right">{p.views.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-6 py-8 text-center text-sm text-slate-400">No page data</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-[#0A2647]">Referrer Sources</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Referrer</th>
                        <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-3">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.page_views.referer_sources.length > 0 ? (
                        data.page_views.referer_sources.map((r) => (
                          <tr key={r.referer} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3 text-sm text-slate-700 truncate max-w-[300px]">{r.referer}</td>
                            <td className="px-6 py-3 text-sm text-slate-700 font-medium text-right">{r.count.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-6 py-8 text-center text-sm text-slate-400">No referrer data</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <span className="text-sm text-slate-500">{label}</span>
      <p className="text-2xl font-bold text-[#0A2647] mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children, fullWidth }: { title: string; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${fullWidth ? "col-span-1 lg:col-span-2" : ""}`}>
      <h3 className="text-lg font-bold text-[#0A2647] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-5">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    </>
  );
}
