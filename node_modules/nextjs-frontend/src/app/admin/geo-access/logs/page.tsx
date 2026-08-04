"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { apiGet, ApiError, API_BASE } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface GeoLogEntry {
  id: number;
  ip_address: string;
  country_code: string | null;
  country_name: string | null;
  city: string | null;
  asn: number | null;
  isp: string | null;
  is_vpn: boolean;
  is_tor: boolean;
  is_datacenter: boolean;
  reason: string;
  url: string | null;
  method: string | null;
  user_agent: string | null;
  created_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

const reasonLabels: Record<string, string> = {
  country_blocked: "Country Blocked",
  tor_exit_node: "Tor Exit Node",
  datacenter_asn: "Datacenter/VPN",
  blacklisted: "Blacklisted",
};

const reasonColors: Record<string, string> = {
  country_blocked: "bg-amber-100 text-amber-800",
  tor_exit_node: "bg-purple-100 text-purple-800",
  datacenter_asn: "bg-red-100 text-red-800",
  blacklisted: "bg-slate-200 text-slate-700",
};

function readAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export default function GeoAccessLogsPage() {
  const { notifyError } = useToast();
  const [logs, setLogs] = useState<GeoLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<GeoLogEntry | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", "25");
      if (search) params.set("search", search);
      if (reason) params.set("reason", reason);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const res = await apiGet<PaginatedResponse<GeoLogEntry>>(`/admin/geo-access-logs?${params.toString()}`);
      setLogs(res.data);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load geo access logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, reason, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [search, reason, dateFrom, dateTo]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (reason) params.set("reason", reason);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const token = readAuthToken();
      const res = await fetch(`${API_BASE}/admin/geo-access-logs/export?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`Export failed (${res.status}).`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `geo-access-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      notifyError(e, "Could not export logs.");
    } finally {
      setExporting(false);
    }
  };

  const columns: ColumnDef<GeoLogEntry>[] = [
    {
      key: "created_at",
      label: "Timestamp",
      render: (l) => <span className="text-slate-500 text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</span>,
    },
    { key: "ip_address", label: "IP", render: (l) => <span className="font-mono font-semibold text-slate-800">{l.ip_address}</span> },
    {
      key: "country",
      label: "Country",
      render: (l) => <span className="text-slate-600">{l.country_name || l.country_code || "—"}</span>,
    },
    {
      key: "reason",
      label: "Reason",
      render: (l) => (
        <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${reasonColors[l.reason] || "bg-slate-100 text-slate-600"}`}>
          {reasonLabels[l.reason] || l.reason}
        </span>
      ),
    },
    {
      key: "flags",
      label: "Flags",
      render: (l) => (
        <div className="flex gap-1">
          {l.is_tor && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">TOR</span>}
          {l.is_datacenter && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">DC</span>}
          {l.is_vpn && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">VPN</span>}
        </div>
      ),
    },
    { key: "url", label: "URL", render: (l) => <span className="text-slate-500 text-xs max-w-xs truncate block">{l.url || "—"}</span> },
    {
      key: "actions",
      label: "",
      render: (l) => (
        <button onClick={() => setSelectedLog(l)} className="text-xs font-semibold text-[#C9A227] hover:text-[#0A2647]">
          View
        </button>
      ),
    },
  ];

  return (
    <AdminLayout title="Geo Access Control — Logs">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Blocked (this view)</p>
            <p className="text-2xl font-bold text-[#0A2647]">{total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:col-span-3 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-gray-500 mb-1">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50"
              >
                <option value="">All Reasons</option>
                <option value="country_blocked">Country Blocked</option>
                <option value="tor_exit_node">Tor Exit Node</option>
                <option value="datacenter_asn">Datacenter/VPN</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50" />
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
          </div>
        </div>

        <AdminDataTable
          columns={columns}
          rows={logs}
          loading={loading}
          error={error}
          onRetry={fetchLogs}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by IP, URL, or user agent…"
          page={page}
          lastPage={lastPage}
          total={total}
          onPageChange={setPage}
          emptyMessage="No blocked requests logged yet."
        />

        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#0A2647]">Blocked Request Detail</h3>
                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Timestamp</p>
                    <p className="text-sm font-medium">{new Date(selectedLog.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">IP Address</p>
                    <p className="text-sm font-medium font-mono">{selectedLog.ip_address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Country</p>
                    <p className="text-sm font-medium">{selectedLog.country_name || selectedLog.country_code || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">City</p>
                    <p className="text-sm font-medium">{selectedLog.city || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ASN / ISP</p>
                    <p className="text-sm font-medium">{selectedLog.asn ? `AS${selectedLog.asn}` : "—"} {selectedLog.isp || ""}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Reason</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${reasonColors[selectedLog.reason] || "bg-slate-100 text-slate-600"}`}>
                      {reasonLabels[selectedLog.reason] || selectedLog.reason}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Requested URL</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 break-all">{selectedLog.url || "—"}</div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">User Agent</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 break-all">{selectedLog.user_agent || "—"}</div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button onClick={() => setSelectedLog(null)} className="px-4 py-2.5 bg-[#0A2647] text-white rounded-lg text-sm font-semibold hover:bg-[#0A2647]/90">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
