"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface AgentProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  user?: { name: string; email: string };
  status: string;
}

interface AgentPerformance {
  id: number;
  name: string;
  total_leads: number;
  converted_leads: number;
  conversion_rate: string;
}

interface AnalyticsData {
  agents: AgentPerformance[];
}

interface PaginatedData {
  data: AgentProfile[];
  total: number;
}

const CHART_COLORS = ["#C9A227", "#0A2647", "#1a3a5c", "#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AgentPerformancePage() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [performance, setPerformance] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [agentsRes, analyticsRes] = await Promise.all([
        apiGet<PaginatedData>("/admin/agents"),
        apiGet<AnalyticsData>("/admin/analytics"),
      ]);
      setAgents(agentsRes.data || []);
      setPerformance(analyticsRes.agents || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function findAgentProfile(perf: AgentPerformance) {
    return agents.find((a) => a.id === perf.id);
  }

  const chartData = performance
    .filter((a) => a.total_leads > 0)
    .sort((a, b) => parseFloat(b.conversion_rate) - parseFloat(a.conversion_rate))
    .slice(0, 8)
    .map((a) => ({
      name: a.name,
      rate: parseFloat(a.conversion_rate),
      leads: a.total_leads,
      converted: a.converted_leads,
    }));

  const leaderboard = [...performance].sort(
    (a, b) => b.converted_leads - a.converted_leads
  );

  const totalLeads = performance.reduce((sum, a) => sum + a.total_leads, 0);
  const totalConverted = performance.reduce((sum, a) => sum + a.converted_leads, 0);
  const avgConversion = totalLeads > 0 ? ((totalConverted / totalLeads) * 100).toFixed(1) : "0";

  if (loading) {
    return (
      <AdminLayout title="Agent Performance">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading performance data...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Agent Performance">
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <div className="text-4xl mb-4">&#9888;&#65039;</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load data</h3>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Agent Performance">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500 font-medium">Total Agents</p>
            <p className="text-3xl font-bold text-[#0A2647] mt-1">{performance.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500 font-medium">Total Leads Assigned</p>
            <p className="text-3xl font-bold text-[#0A2647] mt-1">{totalLeads}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500 font-medium">Avg Conversion Rate</p>
            <p className="text-3xl font-bold text-[#C9A227] mt-1">{avgConversion}%</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#0A2647] mb-4">Top Agents by Conversion Rate</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => [`${value}%`, "Conversion Rate"]}
                    labelFormatter={(label) => `Agent: ${label}`}
                  />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-[#0A2647]">Agent Leaderboard</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A2647] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Agent</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Leads Assigned</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Converted</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaderboard.map((perf, index) => {
                  const profile = findAgentProfile(perf);
                  const agentStatus = profile?.status || "active";
                  return (
                    <tr key={perf.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-bold text-[#C9A227]">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center text-[#0A2647] font-bold text-sm">
                            {getInitials(perf.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{perf.name}</p>
                            <p className="text-xs text-gray-500">{profile?.user?.email || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full ${
                            agentStatus === "active"
                              ? "bg-green-100 text-green-800"
                              : agentStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {agentStatus.charAt(0).toUpperCase() + agentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {perf.total_leads}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {perf.converted_leads}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs rounded-full font-semibold ${
                            parseFloat(perf.conversion_rate) >= 50
                              ? "bg-green-100 text-green-800"
                              : parseFloat(perf.conversion_rate) >= 25
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {perf.conversion_rate}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-gray-500">
                      No agent performance data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
