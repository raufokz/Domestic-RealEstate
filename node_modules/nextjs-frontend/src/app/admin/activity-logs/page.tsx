"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, ApiError } from "@/lib/api";

interface ActivityLog {
  id: number;
  action: string;
  subject_type: string | null;
  subject_id: number | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user: { id: number; name: string; email: string } | null;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

function subjectLabel(log: ActivityLog): string {
  if (!log.subject_type) return "—";
  return log.subject_type.split("\\").pop() + (log.subject_id ? ` #${log.subject_id}` : "");
}

function actionColor(action: string): string {
  if (action.startsWith("created")) return "bg-emerald-100 text-emerald-800";
  if (action.startsWith("updated")) return "bg-blue-100 text-blue-800";
  if (action.startsWith("deleted")) return "bg-red-100 text-red-800";
  if (action.startsWith("restored")) return "bg-amber-100 text-amber-800";
  return "bg-gray-100 text-gray-800";
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<PaginatedResponse<ActivityLog>>(`/admin/activity-logs?page=${page}`);
      setLogs(res.data);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load activity logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <AdminLayout title="Activity Logs">
      <p className="text-sm text-slate-500 mb-4">
        A real-time audit trail of admin actions (create/update/delete/restore) across the platform — {total} recorded.
      </p>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : error ? (
          <div className="text-center py-16 px-6">
            <p className="text-red-600 text-sm font-medium mb-3">{error}</p>
            <button onClick={fetchLogs} className="text-xs font-bold text-[#0A2647] underline">
              Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-sm text-slate-400">
            No activity logged yet — actions on models wired to the audit trail (e.g. Blog) will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A2647] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Details</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{log.user?.name ?? "System"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs rounded-full ${actionColor(log.action)}`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{subjectLabel(log)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate font-mono">
                      {log.details ? JSON.stringify(log.details) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm font-mono">{log.ip_address ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && lastPage > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Page {page} of {lastPage}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
