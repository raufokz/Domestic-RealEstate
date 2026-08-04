"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiDelete, ApiError, API_BASE } from "@/lib/api";
import { useToast } from "@/components/Toast";
import HowTo from "@/components/ui/HowTo";

interface Export {
  id: number;
  export_type: string;
  format: string;
  row_count: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  file_path?: string | null;
  error_message?: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-700",
};

/** Parse a freeform "key=value, key=value" string into an object; returns undefined when empty. */
function parseFilters(raw: string): Record<string, string> | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const out: Record<string, string> = {};
  for (const part of trimmed.split(",")) {
    const [k, ...rest] = part.split("=");
    const key = k?.trim();
    if (key) out[key] = rest.join("=").trim();
  }
  return Object.keys(out).length ? out : undefined;
}

export default function ExportsPage() {
  const { success, notifyError } = useToast();
  const [exports, setExports] = useState<Export[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ type: "leads", format: "csv", filters: "" });
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<{ data: Export[] }>("/admin/exports");
      setExports(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      // No silent fallback to fabricated data: surface the real error + retry.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load exports. Please check the API connection and try again."
      );
      setExports([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    try {
      await apiPost("/admin/exports", {
        export_type: form.type,
        format: form.format,
        filters: parseFilters(form.filters),
      });
      success("Export queued. It will appear as completed once processing finishes.");
      setShowModal(false);
      setForm({ type: "leads", format: "csv", filters: "" });
      await fetchData();
    } catch (e) {
      // Do not fabricate a fake export row on failure.
      notifyError(e, "Could not create export. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function deleteExport(id: number) {
    setActionLoading(id);
    try {
      await apiDelete(`/admin/exports/${id}`);
      setExports((prev) => prev.filter((e) => e.id !== id));
      success("Export deleted.");
    } catch (e) {
      // Do not remove the row locally when the server delete failed.
      notifyError(e, "Could not delete export. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  async function downloadExport(exp: Export) {
    setActionLoading(exp.id);
    try {
      // Download route is authenticated + streams a file, so we must send the Bearer token.
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch(`${API_BASE}/admin/exports/${exp.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        let msg = "Export not ready for download yet.";
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
      a.download = `export-${exp.id}-${exp.export_type}.${exp.format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      notifyError(e, "Could not download export.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <AdminLayout title="Data Exports">
      <div className="space-y-6">
        <HowTo
          title="How to Export Your Data"
          summary="Download leads, properties, users, contacts, or blog posts as a spreadsheet or PDF report."
          requirements={[
            "A queue worker must be running — exports are processed in the background, not instantly.",
          ]}
          steps={[
            "Click New Export and choose what data you want.",
            { text: "Pick a format: CSV, XLSX, or PDF.", detail: "CSV and XLSX suit spreadsheets; PDF produces a formatted report." },
            { text: "Optionally add filters.", detail: 'Use key=value pairs, e.g. status=active, created_after=2026-01-01' },
            { text: "Submit and wait for processing.", detail: "The row starts as pending, then becomes completed. Refresh to see the current status." },
            "Click Download once the status shows completed.",
          ]}
        />

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {exports.length} export{exports.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition"
          >
            + Create Export
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading exports...</span>
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
        {!loading && !error && exports.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No exports yet</h3>
            <p className="text-gray-500 text-sm mb-6">Create your first export to get started.</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
            >
              Create Export
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && exports.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Export ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Format</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Rows</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {exports.map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">EXP-{String(exp.id).padStart(3, "0")}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">{exp.export_type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 uppercase">{exp.format}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{(exp.row_count ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusColors[exp.status]}`}>{exp.status}</span>
                        {exp.status === "failed" && exp.error_message && (
                          <span className="block text-xs text-red-500 mt-1 max-w-[220px] truncate" title={exp.error_message}>
                            {exp.error_message}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(exp.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {exp.status === "completed" && (
                            <button
                              onClick={() => downloadExport(exp)}
                              disabled={actionLoading === exp.id}
                              className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium disabled:opacity-50"
                            >
                              Download
                            </button>
                          )}
                          <button
                            onClick={() => deleteExport(exp.id)}
                            disabled={actionLoading === exp.id}
                            className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
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
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0A2647]">Create Export</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Export Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  >
                    <option value="leads">Leads</option>
                    <option value="properties">Properties</option>
                    <option value="users">Users</option>
                    <option value="contacts">Contacts</option>
                    <option value="blogs">Blog Posts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <select
                    value={form.format}
                    onChange={(e) => setForm((prev) => ({ ...prev, format: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  >
                    <option value="csv">CSV</option>
                    <option value="xlsx">Excel (XLSX)</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filters (optional)</label>
                  <textarea
                    value={form.filters}
                    onChange={(e) => setForm((prev) => ({ ...prev, filters: e.target.value }))}
                    placeholder="e.g., status=active, created_after=2026-01-01"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Export"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
