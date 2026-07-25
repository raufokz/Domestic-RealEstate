"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet } from "@/lib/api";

interface ChatLog {
  id: number;
  timestamp: string;
  user: string;
  agent: string;
  message: string;
  tokens_used: number;
  status: "success" | "error" | "pending";
}

export default function AIChatLogsPage() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAgent, setFilterAgent] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedLog, setSelectedLog] = useState<ChatLog | null>(null);

  useEffect(() => { fetchLogs(); }, []);

  async function fetchLogs() {
    try {
      setLoading(true);
      const data = await apiGet<{ data: ChatLog[] }>("/admin/ai-chat-logs");
      setLogs(data.data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = logs.filter((log) => {
    if (search && !log.user.toLowerCase().includes(search.toLowerCase()) && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterAgent && log.agent !== filterAgent) return false;
    if (filterStatus && log.status !== filterStatus) return false;
    if (dateFrom && new Date(log.timestamp) < new Date(dateFrom)) return false;
    if (dateTo && new Date(log.timestamp) > new Date(dateTo)) return false;
    return true;
  });

  const agents = [...new Set(logs.map((l) => l.agent))];
  const totalTokens = filtered.reduce((sum, l) => sum + l.tokens_used, 0);

  const statusColors: Record<string, string> = {
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <AdminLayout title="AI Chat Logs">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Logs</p>
            <p className="text-2xl font-bold text-[#0A2647]">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Tokens</p>
            <p className="text-2xl font-bold text-[#0A2647]">{totalTokens.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Error Rate</p>
            <p className="text-2xl font-bold text-[#0A2647]">{filtered.length > 0 ? ((filtered.filter((l) => l.status === "error").length / filtered.length) * 100).toFixed(1) : 0}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user or message..." className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50" />
            <select value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50">
              <option value="">All Agents</option>
              {agents.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50">
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="pending">Pending</option>
            </select>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50" />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading chat logs...</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No chat logs found</h3>
            <p className="text-gray-500 text-sm">Chat logs will appear here once conversations occur.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Timestamp</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Agent</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Message</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tokens</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm">{log.user}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.agent}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{log.message}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.tokens_used}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[log.status] || "bg-gray-100 text-gray-700"}`}>{log.status}</span>
                      </td>
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

        {/* Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0A2647]">Chat Detail</h3>
                  <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500">Timestamp</p><p className="text-sm font-medium">{new Date(selectedLog.timestamp).toLocaleString()}</p></div>
                  <div><p className="text-xs text-gray-500">User</p><p className="text-sm font-medium">{selectedLog.user}</p></div>
                  <div><p className="text-xs text-gray-500">Agent</p><p className="text-sm font-medium">{selectedLog.agent}</p></div>
                  <div><p className="text-xs text-gray-500">Tokens</p><p className="text-sm font-medium">{selectedLog.tokens_used}</p></div>
                  <div><p className="text-xs text-gray-500">Status</p><span className={`px-2 py-1 text-xs rounded-full ${statusColors[selectedLog.status]}`}>{selectedLog.status}</span></div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Full Message</p>
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
