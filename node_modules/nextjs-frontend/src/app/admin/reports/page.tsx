"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiDelete, ApiError, API_BASE } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface ReportExport {
  id: number;
  export_type: string;
  format: string;
  row_count: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  error_message?: string | null;
}

const reportTypes = [
  { id: "leads", label: "Leads", description: "Lead pipeline, sources, and conversion metrics", icon: "🎯" },
  { id: "sales", label: "Sales", description: "Sales performance, pipeline value, and close rates", icon: "💰" },
  { id: "revenue", label: "Revenue", description: "Revenue breakdown by source, period, and service", icon: "📈" },
  { id: "agent-performance", label: "Agent Performance", description: "Individual agent metrics, KPIs, and rankings", icon: "🧑‍💼" },
  { id: "property-analytics", label: "Property Analytics", description: "Listings, views, inquiries, and market trends", icon: "🏠" },
];

const typeToExport: Record<string, string> = {
  leads: "leads",
  sales: "deals",
  revenue: "invoices",
  "agent-performance": "agent_leads",
  "property-analytics": "properties",
};

const formatOptions = [
  { id: "pdf", label: "PDF", extension: ".pdf", icon: "📄" },
  { id: "xlsx", label: "Excel", extension: ".xlsx", icon: "📊" },
  { id: "csv", label: "CSV", extension: ".csv", icon: "📋" },
];

const typeColors: Record<string, string> = {
  leads: "bg-blue-100 text-blue-800",
  deals: "bg-emerald-100 text-emerald-800",
  invoices: "bg-purple-100 text-purple-800",
  agent_leads: "bg-amber-100 text-amber-800",
  properties: "bg-rose-100 text-rose-800",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-700",
};

function reportLabel(exportType: string): string {
  return reportTypes.find((rt) => typeToExport[rt.id] === exportType)?.label ?? exportType;
}

export default function ReportsPage() {
  const { success, notifyError } = useToast();
  const [selectedType, setSelectedType] = useState("leads");
  const [format, setFormat] = useState("pdf");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState<ReportExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<{ data: ReportExport[] }>("/admin/exports");
      const all = Array.isArray(res.data) ? res.data : [];
      const ours = all.filter((e) => Object.values(typeToExport).includes(e.export_type));
      setReports(ours);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load reports. Please check the API connection and try again."
      );
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const filters: Record<string, string> = {};
      if (dateFrom) filters.created_after = dateFrom;
      if (dateTo) filters.created_before = dateTo;
      await apiPost("/admin/exports", {
        export_type: typeToExport[selectedType],
        format,
        filters: Object.keys(filters).length ? filters : undefined,
      });
      success("Report queued. It will appear below once processing finishes.");
      await fetchReports();
    } catch (e) {
      notifyError(e, "Could not generate this report. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function downloadReport(exp: ReportExport) {
    setActionLoading(exp.id);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch(`${API_BASE}/admin/exports/${exp.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        let msg = "Report is not ready for download yet.";
        try {
          const body = await res.json();
          if (body?.message) msg = body.message;
        } catch {
          /* keep default */
        }
        throw new ApiError(msg, res.status);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${exp.id}-${exp.export_type}.${exp.format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      notifyError(e, "Could not download this report.");
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteReport(id: number) {
    setActionLoading(id);
    try {
      await apiDelete(`/admin/exports/${id}`);
      setReports((prev) => prev.filter((r) => r.id !== id));
      success("Report deleted.");
    } catch (e) {
      notifyError(e, "Could not delete this report.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <AdminLayout title="Reports">
      <div className="space-y-6">
        {/* Report Generator */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-[#0A2647] mb-1">Generate Report</h3>
          <p className="text-sm text-slate-500 mb-6">Select report type, date range, and output format</p>

          {/* Report Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#0A2647] mb-3">Report Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {reportTypes.map((rt) => (
                <button
                  key={rt.id}
                  onClick={() => setSelectedType(rt.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedType === rt.id
                      ? "border-[#C9A227] bg-[#C9A227]/5 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-2xl">{rt.icon}</span>
                  <p className={`font-semibold text-sm mt-2 ${selectedType === rt.id ? "text-[#0A2647]" : "text-slate-700"}`}>
                    {rt.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-[#0A2647] mb-2">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0A2647] mb-2">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0A2647] mb-2">Output Format</label>
              <div className="flex gap-2">
                {formatOptions.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      format === f.id
                        ? "bg-[#0A2647] text-white border-[#0A2647]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="mr-1">{f.icon}</span> {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-bold hover:bg-[#b8911f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "Generate Report"
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Reports are processed in the background by the queue worker. PDF and Excel formats produce formatted files; CSV is plain tabular data.
          </p>
        </div>

        {/* Recent Reports Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#0A2647]">Recent Reports</h3>
              <p className="text-sm text-slate-500 mt-0.5">{reports.length} report{reports.length !== 1 ? "s" : ""} generated</p>
            </div>
            <button onClick={fetchReports} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
              <span className="ml-3 text-gray-500">Loading reports...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 m-6 text-center">
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchReports}
                className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Report Name</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Type</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Format</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Rows</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Generated</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#0A2647]/10 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#0A2647]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-[#0A2647]">
                            {reportLabel(r.export_type)} Report #{r.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${typeColors[r.export_type] || "bg-slate-100 text-slate-700"}`}>
                          {reportLabel(r.export_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 uppercase">{r.format}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{(r.row_count ?? 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
                        {r.status === "failed" && r.error_message && (
                          <span className="block text-xs text-red-500 mt-1 max-w-[220px] truncate" title={r.error_message}>
                            {r.error_message}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === "completed" && (
                            <button
                              onClick={() => downloadReport(r)}
                              disabled={actionLoading === r.id}
                              className="px-3 py-1.5 text-xs font-semibold text-[#0A2647] bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                              Download
                            </button>
                          )}
                          <button
                            onClick={() => deleteReport(r.id)}
                            disabled={actionLoading === r.id}
                            className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reports.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-slate-400 text-sm">No reports generated yet. Create your first report above.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
