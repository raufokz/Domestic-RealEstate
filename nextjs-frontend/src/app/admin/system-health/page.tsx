"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";

interface HealthComponent {
  name: string;
  key: string;
  status: "healthy" | "degraded" | "down" | "not_configured";
  last_check: string | null;
  uptime: number;
  response_time: number | null;
}

interface FailureRecord {
  id: number;
  component: string;
  error: string;
  occurred_at: string;
}

interface DashboardStats {
  total_users: number;
  total_agents: number;
  total_properties: number;
  active_properties: number;
  total_leads: number;
  new_leads: number;
  hot_leads: number;
  total_enquiries: number;
  pending_approvals: number;
  pending_agents: number;
  service_requests_new: number;
  contracts_pending: number;
  invoices_unpaid: number;
  invoices_total_unpaid: number;
  newsletter_subscribers: number;
  total_blogs: number;
  active_campaigns: number;
}

interface AggregatedStats {
  leads_by_status: { status: string; count: number }[];
  leads_by_type: { type: string; count: number }[];
  properties_by_status: { status: string; count: number }[];
  new_users: number;
  revenue_collected: number;
}

const COMPONENTS: { name: string; key: string; icon: string }[] = [
  { name: "Database", key: "database", icon: "\uD83D\uDCBE" },
  { name: "Redis Cache", key: "redis", icon: "\u26A1" },
  { name: "Queue Worker", key: "queue_worker", icon: "\uD83D\uDCE6" },
  { name: "Email Queue", key: "email_queue", icon: "\u2709\uFE0F" },
  { name: "AI API (Gemini)", key: "ai_gemini", icon: "\uD83E\uDD16" },
  { name: "AI API (OpenAI)", key: "ai_openai", icon: "\uD83D\uDCA1" },
  { name: "Google Maps", key: "google_maps", icon: "\uD83D\uDDFA\uFE0F" },
  { name: "Twilio", key: "twilio", icon: "\uD83D\uDCF1" },
  { name: "SendGrid", key: "sendgrid", icon: "\uD83D\uD8E8" },
  { name: "Cloudinary", key: "cloudinary", icon: "\u2601\uFE0F" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    healthy: "bg-green-100 text-green-700",
    degraded: "bg-amber-100 text-amber-700",
    down: "bg-red-100 text-red-700",
    not_configured: "bg-slate-100 text-slate-500",
  };
  const labels: Record<string, string> = {
    healthy: "Healthy",
    degraded: "Degraded",
    down: "Down",
    not_configured: "Not Configured",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${styles[status] || styles.not_configured}`}>
      {labels[status] || status}
    </span>
  );
}

const FALLBACK_COMPONENTS: HealthComponent[] = COMPONENTS.map((c) => ({
  name: c.name,
  key: c.key,
  status: "not_configured" as const,
  last_check: null,
  uptime: 0,
  response_time: null,
}));

export default function SystemHealthPage() {
  const [components, setComponents] = useState<HealthComponent[]>(FALLBACK_COMPONENTS);
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingAll, setTestingAll] = useState(false);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [aggStats, setAggStats] = useState<AggregatedStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadHealth();
    loadDashboardStats();
  }, []);

  async function loadHealth() {
    setLoading(true);
    try {
      const data = await apiGet<{ components: HealthComponent[]; failures: FailureRecord[] }>("/admin/system-health");
      if (data.components) setComponents(data.components);
      if (data.failures) setFailures(data.failures);
    } catch {
      /* use fallback */
    }
    setLoading(false);
  }

  async function loadDashboardStats() {
    setStatsLoading(true);
    try {
      const [dash, stats] = await Promise.all([
        apiGet<{ stats: DashboardStats }>("/admin/dashboard"),
        apiGet<AggregatedStats>("/admin/stats"),
      ]);
      if (dash.stats) setDashStats(dash.stats);
      if (stats) setAggStats(stats);
    } catch {
      /* use fallback null state */
    }
    setStatsLoading(false);
  }

  async function runAllTests() {
    setTestingAll(true);
    try {
      const data = await apiPost<{ components: HealthComponent[] }>("/admin/system-health/test-all", {});
      if (data.components) setComponents(data.components);
    } catch {
      /* silent */
    }
    setTestingAll(false);
  }

  async function testComponent(key: string) {
    setTestingKey(key);
    try {
      const data = await apiPost<{ component: HealthComponent }>(`/admin/system-health/test/${key}`, {});
      if (data.component) {
        setComponents((prev) => prev.map((c) => (c.key === key ? data.component : c)));
      }
    } catch {
      setComponents((prev) =>
        prev.map((c) => (c.key === key ? { ...c, status: "down" as const, last_check: new Date().toISOString() } : c))
      );
    }
    setTestingKey(null);
  }

  const healthyCount = components.filter((c) => c.status === "healthy").length;
  const degradedCount = components.filter((c) => c.status === "degraded").length;
  const downCount = components.filter((c) => c.status === "down").length;
  const avgResponseTime = components.filter((c) => c.response_time !== null).reduce((sum, c) => sum + (c.response_time || 0), 0) / (components.filter((c) => c.response_time !== null).length || 1);

  return (
    <AdminLayout title="System Health">
      {/* Real Dashboard Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#0A2647]">Platform Statistics</h2>
          <button onClick={loadDashboardStats} className="text-xs font-medium text-[#C9A227] hover:text-[#b8911f] transition-colors">
            {statsLoading ? "Loading..." : "Refresh Stats"}
          </button>
        </div>
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse h-20" />
            ))}
          </div>
        ) : dashStats ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Total Users</p>
                <p className="text-2xl font-bold text-[#0A2647]">{dashStats.total_users}</p>
                <p className="text-xs text-slate-400">{dashStats.total_agents} agents</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Properties</p>
                <p className="text-2xl font-bold text-[#0A2647]">{dashStats.total_properties}</p>
                <p className="text-xs text-green-500">{dashStats.active_properties} active</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Leads</p>
                <p className="text-2xl font-bold text-[#0A2647]">{dashStats.total_leads}</p>
                <p className="text-xs text-amber-500">{dashStats.new_leads} new, {dashStats.hot_leads} hot</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Campaigns</p>
                <p className="text-2xl font-bold text-[#0A2647]">{dashStats.active_campaigns}</p>
                <p className="text-xs text-slate-400">active</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Invoices</p>
                <p className="text-2xl font-bold text-[#0A2647]">{dashStats.invoices_unpaid}</p>
                <p className="text-xs text-slate-400">${dashStats.invoices_total_unpaid} unpaid</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Pending</p>
                <p className="text-2xl font-bold text-[#0A2647]">{dashStats.pending_approvals + dashStats.pending_agents + dashStats.contracts_pending}</p>
                <p className="text-xs text-slate-400">approvals + contracts</p>
              </div>
            </div>
            {aggStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-2">Leads by Status</p>
                  <div className="flex flex-wrap gap-2">
                    {aggStats.leads_by_status.map((s) => (
                      <span key={s.status} className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">{s.status}: {s.count}</span>
                    ))}
                    {aggStats.leads_by_status.length === 0 && <span className="text-xs text-slate-400">No data</span>}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-2">Properties by Status</p>
                  <div className="flex flex-wrap gap-2">
                    {aggStats.properties_by_status.map((s) => (
                      <span key={s.status} className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">{s.status}: {s.count}</span>
                    ))}
                    {aggStats.properties_by_status.length === 0 && <span className="text-xs text-slate-400">No data</span>}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-2">Revenue (30d)</p>
                  <p className="text-xl font-bold text-green-600">${aggStats.revenue_collected.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{aggStats.new_users} new users this period</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center text-slate-400 text-sm">
            Unable to load dashboard stats. Make sure you are logged in as admin.
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-1">Healthy</p>
          <p className="text-2xl font-bold text-green-600">{healthyCount}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-1">Degraded</p>
          <p className="text-2xl font-bold text-amber-600">{degradedCount}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-1">Down</p>
          <p className="text-2xl font-bold text-red-600">{downCount}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-1">Avg Response</p>
          <p className="text-2xl font-bold text-[#0A2647]">{avgResponseTime > 0 ? `${Math.round(avgResponseTime)}ms` : "\u2014"}</p>
        </div>
      </div>

      {/* Header + Run All Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#0A2647]">Component Status</h2>
          <p className="text-sm text-slate-500">Real-time monitoring of all system components</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadHealth} className="px-4 py-2 text-sm font-medium text-[#0A2647] border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            \u21BB Refresh
          </button>
          <button
            onClick={runAllTests}
            disabled={testingAll}
            className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
          >
            {testingAll ? "Running Tests..." : "\u25B6 Run All Tests"}
          </button>
        </div>
      </div>

      {/* Component Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {components.map((comp) => {
            const meta = COMPONENTS.find((c) => c.key === comp.key);
            return (
              <div key={comp.key} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta?.icon || "\u2699\uFE0F"}</span>
                    <div>
                      <h3 className="font-semibold text-[#0A2647]">{comp.name}</h3>
                      <StatusBadge status={comp.status} />
                    </div>
                  </div>
                  <button
                    onClick={() => testComponent(comp.key)}
                    disabled={testingKey === comp.key}
                    className="text-xs font-medium text-[#C9A227] hover:text-[#b8911f] disabled:opacity-50 transition-colors"
                  >
                    {testingKey === comp.key ? "Testing..." : "Retest"}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500">Last Check</p>
                    <p className="text-sm font-medium text-slate-700">
                      {comp.last_check ? new Date(comp.last_check).toLocaleTimeString() : "\u2014"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Uptime</p>
                    <p className="text-sm font-medium text-slate-700">{comp.uptime > 0 ? `${comp.uptime}%` : "\u2014"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Response</p>
                    <p className="text-sm font-medium text-slate-700">{comp.response_time !== null ? `${comp.response_time}ms` : "\u2014"}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Error Rate Summary */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#0A2647]">Error Rate Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-xl font-bold text-[#0A2647]">{components.length}</p>
            <p className="text-xs text-slate-500">Total Components</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xl font-bold text-green-600">{healthyCount}</p>
            <p className="text-xs text-slate-500">Passing</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-xl font-bold text-amber-600">{degradedCount + downCount}</p>
            <p className="text-xs text-slate-500">Failing</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-xl font-bold text-[#0A2647]">
              {components.length > 0 ? `${Math.round((healthyCount / components.length) * 100)}%` : "0%"}
            </p>
            <p className="text-xs text-slate-500">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Recent Failures */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-[#0A2647]">Recent Failures</h3>
        </div>
        {failures.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No recent failures recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Component</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Error</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Occurred</th>
                </tr>
              </thead>
              <tbody>
                {failures.map((f) => (
                  <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-[#0A2647]">{f.component}</td>
                    <td className="px-5 py-3 text-red-600 text-xs font-mono">{f.error}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{new Date(f.occurred_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
