"use client";

import AgentLayout from "@/components/agent/AgentLayout";
import { useFetch } from "@/hooks/useFetch";

interface AnalyticsData {
  total_leads: number;
  converted_leads: number;
  conversion_rate: number;
  total_listings: number;
  total_views: number;
  total_inquiries: number;
  revenue: number;
}

export default function AgentAnalyticsPage() {
  const { data: stats } = useFetch<AnalyticsData>("/admin/stats");

  const metrics = [
    { label: "Total Leads", value: stats?.total_leads?.toString() || "0", icon: "👥", change: "+8 this week", changeColor: "text-green-600" },
    { label: "Converted Leads", value: stats?.converted_leads?.toString() || "0", icon: "✅", change: "+2 this month", changeColor: "text-green-600" },
    { label: "Conversion Rate", value: `${stats?.conversion_rate || 0}%`, icon: "📈", change: "+0.3% vs last month", changeColor: "text-green-600" },
    { label: "Active Listings", value: stats?.total_listings?.toString() || "0", icon: "🏠", change: "+2 new", changeColor: "text-green-600" },
    { label: "Total Views", value: stats?.total_views?.toString() || "0", icon: "👁️", change: "+120 this week", changeColor: "text-green-600" },
    { label: "Total Inquiries", value: stats?.total_inquiries?.toString() || "0", icon: "✉️", change: "+15 this week", changeColor: "text-green-600" },
    { label: "Revenue", value: `$${((stats?.revenue || 0) / 1000).toFixed(1)}K`, icon: "💰", change: "+12% this month", changeColor: "text-green-600" },
    { label: "Avg. Response Time", value: "2.4h", icon: "⏱️", change: "-15min vs last week", changeColor: "text-green-600" },
  ];

  const topListings = [
    { title: "Luxury Beachfront Villa", views: 1243, inquiries: 28, status: "Active" },
    { title: "Modern Downtown Loft", views: 892, inquiries: 15, status: "Active" },
    { title: "Penthouse Suite", views: 2105, inquiries: 42, status: "Active" },
    { title: "Mountain Retreat", views: 3210, inquiries: 56, status: "Sold" },
  ];

  const leadSources = [
    { source: "Website", count: 35, percentage: 35 },
    { source: "Referral", count: 25, percentage: 25 },
    { source: "Zillow", count: 18, percentage: 18 },
    { source: "Open House", count: 12, percentage: 12 },
    { source: "Social Media", count: 10, percentage: 10 },
  ];

  return (
    <AgentLayout title="Analytics" subtitle="Track your performance and growth">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">{m.label}</span>
                <span className="text-lg">{m.icon}</span>
              </div>
              <p className="text-2xl font-bold text-[#0A2647]">{m.value}</p>
              <p className={`text-xs mt-1 ${m.changeColor}`}>{m.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-[#0A2647] mb-4">Lead Sources</h3>
            <div className="space-y-3">
              {leadSources.map((source) => (
                <div key={source.source} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-28">{source.source}</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#C9A227] rounded-full transition-all" style={{ width: `${source.percentage}%` }} />
                  </div>
                  <span className="text-sm font-medium text-slate-800 w-12 text-right">{source.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-[#0A2647] mb-4">Top Performing Listings</h3>
            <div className="space-y-3">
              {topListings.map((listing, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#0A2647] rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">#{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#0A2647] text-sm truncate">{listing.title}</p>
                    <p className="text-xs text-slate-500">{listing.views} views · {listing.inquiries} inquiries</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${listing.status === "Active" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{listing.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-[#0A2647] mb-4">Performance Over Time</h3>
          <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center border border-dashed border-slate-200">
            <div className="text-center">
              <svg className="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm text-slate-400">Performance chart coming soon</p>
              <p className="text-xs text-slate-300 mt-1">Will show leads, views, and revenue trends</p>
            </div>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
}
