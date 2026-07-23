"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, ApiError } from "@/lib/api";

interface TestLog {
  id: number;
  tested_by: number | null;
  result: "success" | "failure";
  response_summary: string | null;
  created_at: string;
  tester?: { id: number; name: string; email: string } | null;
}

const PAGE_SIZE = 10;

export default function IntegrationLogsPage() {
  const params = useParams();
  const key = params.key as string;

  const [logs, setLogs] = useState<TestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [key]);

  async function fetchLogs() {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet<{ data: TestLog[] }>(`/admin/integrations/${key}/logs`);
      setLogs(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      // No silent fallback to fabricated data: surface the real error + retry.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load test logs. Please check the API connection and try again."
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(logs.length / PAGE_SIZE);
  const paged = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminLayout title={`${key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} - Test Logs`}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/integrations" className="hover:text-[#0A2647]">Integrations</Link>
          <span>/</span>
          <Link href={`/admin/integrations/${key}`} className="hover:text-[#0A2647] capitalize">{key.replace(/_/g, " ")}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Logs</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading logs...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchLogs}
              className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
            >
              Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No test logs</h3>
            <p className="text-gray-500 text-sm">Run a connection test to see results here.</p>
            <Link href={`/admin/integrations/${key}`} className="mt-4 inline-block px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
              Go to Setup
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0A2647] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Tested By</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Result</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Response Summary</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paged.map((log) => (
                      <tr
                        key={log.id}
                        className={`${log.result === "success" ? "bg-green-50/50 hover:bg-green-50" : "bg-red-50/50 hover:bg-red-50"} transition-colors`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.tester?.name ?? "System"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium ${
                            log.result === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${log.result === "success" ? "bg-green-500" : "bg-red-500"}`} />
                            {log.result === "success" ? "Success" : "Failure"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">{log.response_summary || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, logs.length)} of {logs.length}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
