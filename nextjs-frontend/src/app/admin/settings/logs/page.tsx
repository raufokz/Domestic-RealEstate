"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, ApiError } from "@/lib/api";

interface LogEntry {
  id: number;
  timestamp: string;
  level: "info" | "warning" | "error";
  channel: string;
  message: string;
  user: string | null;
  ip_address: string | null;
}

const levelConfig: Record<string, string> = {
  info: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
};

const channelColors: Record<string, string> = {
  auth: "bg-green-100 text-green-800",
  security: "bg-red-100 text-red-800",
  api: "bg-purple-100 text-purple-800",
  leads: "bg-blue-100 text-blue-800",
  automation: "bg-indigo-100 text-indigo-800",
  email: "bg-yellow-100 text-yellow-800",
  database: "bg-orange-100 text-orange-800",
  backup: "bg-teal-100 text-teal-800",
};

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => { fetchLogs(); }, []);

  async function fetchLogs() {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet<{ data: LogEntry[] }>("/admin/logs");
      setLogs(data.data || []);
    } catch (e) {
      // No silent fallback to fake data.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load system logs. Please check the API connection and try again."
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = logs.filter((log) => {
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && !(log.user && log.user.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filterLevel && log.level !== filterLevel) return false;
    if (filterChannel && log.channel !== filterChannel) return false;
    if (dateFrom && new Date(log.timestamp) < new Date(dateFrom)) return false;
    if (dateTo && new Date(log.timestamp) > new Date(dateTo)) return false;
    return true;
  });

  const channels = [...new Set(logs.map((l) => l.channel))];

  return (
    <AdminLayout title="System Logs">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Entries</p>
            <p className="text-2xl font-bold text-[#0A2647]">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Errors</p>
            <p className="text-2xl font-bold text-red-600">{filtered.filter((l) => l.level === "error").length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Warnings</p>
            <p className="text-2xl font-bold text-yellow-600">{filtered.filter((l) => l.level === "warning").length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Info</p>
            <p className="text-2xl font-bold text-blue-600">{filtered.filter((l) => l.level === "info").length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search message or user..." className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50" />
            <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50">
              <option value="">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <select value={filterChannel} onChange={(e) => setFilterChannel(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50">
              <option value="">All Channels</option>
              {channels.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50" />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading logs...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button onClick={fetchLogs} className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No log entries found</h3>
            <p className="text-gray-500 text-sm">System logs will appear here.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Timestamp</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Level</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Channel</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Message</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">IP Address</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${levelConfig[log.level]}`}>{log.level}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${channelColors[log.channel] || "bg-gray-100 text-gray-700"}`}>{log.channel}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-md truncate">{log.message}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{log.user || "\u2014"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{log.ip_address || "\u2014"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedLog(log)} className="text-sm text-[#C9A227] hover:text-[#0A2647] font-medium">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0A2647]">Log Detail</h3>
                  <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Timestamp</p>
                    <p className="text-sm font-medium">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Level</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${levelConfig[selectedLog.level]}`}>{selectedLog.level}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Channel</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${channelColors[selectedLog.channel] || "bg-gray-100 text-gray-700"}`}>{selectedLog.channel}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">User</p>
                    <p className="text-sm font-medium">{selectedLog.user || "\u2014"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">IP Address</p>
                    <p className="text-sm font-medium font-mono">{selectedLog.ip_address || "\u2014"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Message</p>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">{selectedLog.message}</div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button onClick={() => setSelectedLog(null)} className="px-4 py-2.5 bg-[#0A2647] text-white rounded-lg text-sm font-semibold hover:bg-[#0A2647]/90">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
