"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const reportTypes = [
  { id: "leads", label: "Leads", description: "Lead pipeline, sources, and conversion metrics", icon: "🎯" },
  { id: "sales", label: "Sales", description: "Sales performance, pipeline value, and close rates", icon: "💰" },
  { id: "revenue", label: "Revenue", description: "Revenue breakdown by source, period, and service", icon: "📈" },
  { id: "agent-performance", label: "Agent Performance", description: "Individual agent metrics, KPIs, and rankings", icon: "🧑‍💼" },
  { id: "property-analytics", label: "Property Analytics", description: "Listings, views, inquiries, and market trends", icon: "🏠" },
];

const formatOptions = [
  { id: "pdf", label: "PDF", extension: ".pdf", icon: "📄" },
  { id: "excel", label: "Excel", extension: ".xlsx", icon: "📊" },
  { id: "csv", label: "CSV", extension: ".csv", icon: "📋" },
];

const recentReports = [
  { id: 1, name: "Lead Pipeline Summary", type: "Leads", generated: "2026-07-10 14:32", size: "245 KB", status: "completed" },
  { id: 2, name: "Monthly Revenue Report", type: "Revenue", generated: "2026-07-09 09:15", size: "1.2 MB", status: "completed" },
  { id: 3, name: "Agent Performance - Q2 2026", type: "Agent Performance", generated: "2026-07-08 16:45", size: "890 KB", status: "completed" },
  { id: 4, name: "Property Analytics July", type: "Property Analytics", generated: "2026-07-07 11:20", size: "1.8 MB", status: "completed" },
  { id: 5, name: "Sales Funnel Report", type: "Sales", generated: "2026-07-06 13:50", size: "320 KB", status: "completed" },
  { id: 6, name: "Weekly Leads Summary", type: "Leads", generated: "2026-07-05 08:00", size: "156 KB", status: "completed" },
  { id: 7, name: "Revenue by Source - June", type: "Revenue", generated: "2026-07-04 10:30", size: "780 KB", status: "completed" },
  { id: 8, name: "Property Listings Report", type: "Property Analytics", generated: "2026-07-03 15:10", size: "2.1 MB", status: "completed" },
];

const typeColors: Record<string, string> = {
  Leads: "bg-blue-100 text-blue-800",
  Sales: "bg-emerald-100 text-emerald-800",
  Revenue: "bg-purple-100 text-purple-800",
  "Agent Performance": "bg-amber-100 text-amber-800",
  "Property Analytics": "bg-rose-100 text-rose-800",
};

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState("leads");
  const [format, setFormat] = useState("pdf");
  const [dateFrom, setDateFrom] = useState("2026-06-01");
  const [dateTo, setDateTo] = useState("2026-07-11");
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState(recentReports);

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      const typeLabel = reportTypes.find((t) => t.id === selectedType)?.label || "";
      const newReport = {
        id: Date.now(),
        name: `${typeLabel} Report - ${new Date().toLocaleDateString()}`,
        type: typeLabel,
        generated: new Date().toLocaleString("sv-SE", { hour: "2-digit", minute: "2-digit" }).replace(" ", " "),
        size: `${Math.floor(Math.random() * 2000 + 100)} KB`,
        status: "completed" as const,
      };
      setReports((prev) => [newReport, ...prev]);
      setGenerating(false);
    }, 2000);
  }

  function handleDelete(id: number) {
    setReports((prev) => prev.filter((r) => r.id !== id));
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
        </div>

        {/* Recent Reports Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#0A2647]">Recent Reports</h3>
              <p className="text-sm text-slate-500 mt-0.5">{reports.length} reports generated</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Export All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Report Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Generated</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Size</th>
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
                        <span className="text-sm font-medium text-[#0A2647]">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${typeColors[r.type] || "bg-slate-100 text-slate-700"}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{r.generated}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{r.size}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-3 py-1.5 text-xs font-semibold text-[#0A2647] bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reports.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm">No reports generated yet. Create your first report above.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
