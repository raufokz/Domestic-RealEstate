"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, ApiError, API_BASE } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface ImportBatch {
  id: number;
  import_type: string;
  file_name: string;
  rows_imported: number;
  rows_failed: number;
  status: "pending" | "processing" | "completed" | "failed";
  started_at: string;
  completed_at?: string | null;
  errors_count?: number;
}

interface ImportError {
  row_number: number;
  reason: string;
  row_data?: Record<string, unknown>;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-700",
  processing: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export default function ImportHistoryPage() {
  const { notifyError } = useToast();
  const [imports, setImports] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorsModal, setErrorsModal] = useState<{ batch: ImportBatch; errors: ImportError[]; loading: boolean } | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<{ data: ImportBatch[] }>("/admin/imports");
      setImports(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load import history. Please check the API connection and try again."
      );
      setImports([]);
    } finally {
      setLoading(false);
    }
  }

  async function openErrors(batch: ImportBatch) {
    setErrorsModal({ batch, errors: [], loading: true });
    try {
      const res = await apiGet<{ data: { errors: ImportError[] } }>(`/admin/imports/${batch.id}/errors`);
      setErrorsModal({ batch, errors: Array.isArray(res.data?.errors) ? res.data.errors : [], loading: false });
    } catch (e) {
      notifyError(e, "Could not load errors for this import.");
      setErrorsModal(null);
    }
  }

  async function downloadErrors(batch: ImportBatch) {
    setDownloadingId(batch.id);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch(`${API_BASE}/admin/imports/${batch.id}/errors/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        let msg = "Could not download the error report.";
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
      a.download = `import-${batch.id}-errors.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      notifyError(e, "Could not download the error report.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <AdminLayout title="Import History">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{imports.length} import{imports.length !== 1 ? "s" : ""}</p>
          <button onClick={fetchData} className="px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
            🔄 Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading imports...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchData}
              className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && imports.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">📥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No imports yet</h3>
            <p className="text-gray-500 text-sm">Your import history will appear here.</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && imports.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Import ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">File Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Imported</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Failed</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Started</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Completed</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {imports.map((imp) => (
                    <tr key={imp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">IMP-{String(imp.id).padStart(3, "0")}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">{imp.import_type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{imp.file_name}</td>
                      <td className="px-4 py-3 text-sm text-green-700 font-medium">{(imp.rows_imported ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">
                        {imp.rows_failed > 0 ? (
                          <span className="text-red-600 font-medium">{imp.rows_failed}</span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusColors[imp.status]}`}>{imp.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(imp.started_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {imp.completed_at ? new Date(imp.completed_at).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {imp.rows_failed > 0 && (
                            <>
                              <button
                                onClick={() => openErrors(imp)}
                                className="text-[#8B1E3F] hover:text-[#a0244a] text-sm font-medium"
                              >
                                View Errors ({imp.rows_failed})
                              </button>
                              <button
                                onClick={() => downloadErrors(imp)}
                                disabled={downloadingId === imp.id}
                                className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium disabled:opacity-50"
                              >
                                Download CSV
                              </button>
                            </>
                          )}
                          {imp.rows_failed === 0 && (
                            <span className="text-xs text-gray-400">All rows imported</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Errors Modal */}
        {errorsModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0A2647]">Import Errors</h3>
                  <button onClick={() => setErrorsModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <p className="text-sm text-gray-500 mt-1">{errorsModal.batch.file_name}</p>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {errorsModal.loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C9A227]" />
                    <span className="ml-3 text-gray-500 text-sm">Loading errors...</span>
                  </div>
                ) : errorsModal.errors.length === 0 ? (
                  <p className="text-sm text-gray-500">No detailed error rows are available for this import.</p>
                ) : (
                  <div className="space-y-2">
                    {errorsModal.errors.map((err, idx) => (
                      <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-red-700">Row {err.row_number}</p>
                        <p className="text-sm text-red-700 mt-0.5">{err.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setErrorsModal(null)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Close
                </button>
                {errorsModal.batch.rows_failed > 0 && (
                  <button
                    onClick={() => downloadErrors(errorsModal.batch)}
                    disabled={downloadingId === errorsModal.batch.id}
                    className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] disabled:opacity-50"
                  >
                    Download CSV
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
