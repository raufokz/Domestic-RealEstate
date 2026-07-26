"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiDelete, ApiError, API_BASE } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Backup {
  id: string;
  filename: string;
  date: string;
  size: string;
  type: "auto" | "manual";
  status: "completed" | "in_progress" | "failed";
}

export default function BackupPage() {
  const { success, notifyError } = useToast();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  async function fetchBackups() {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet<{ data: Backup[] }>("/admin/backups");
      setBackups(data.data || []);
    } catch (e) {
      // No silent fallback to fake data.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load backups. Please check the API connection and try again."
      );
      setBackups([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBackup() {
    try {
      setCreating(true);
      await apiPost("/admin/backups/create");
      success("Backup created.", "Backup");
      await fetchBackups();
    } catch (e) {
      // Real failures surface honestly — no fabricated backup row.
      notifyError(e, "Could not create the backup.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRestore(id: string) {
    try {
      setRestoring(id);
      await apiPost(`/admin/backups/${id}/restore`);
      success("Restore requested.", "Backup");
    } catch (e) {
      // Backend intentionally disables panel restore for safety — show that message.
      notifyError(e, "Restore is not available from the panel.");
    } finally {
      setRestoring(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this backup file? This cannot be undone.")) return;
    try {
      setDeleting(id);
      await apiDelete(`/admin/backups/${id}`);
      setBackups((prev) => prev.filter((b) => b.id !== id));
      success("Backup deleted.", "Backup");
    } catch (e) {
      notifyError(e, "Could not delete the backup.");
    } finally {
      setDeleting(null);
    }
  }

  async function handleDownload(b: Backup) {
    try {
      const res = await fetch(`${API_BASE}/admin/backups/${b.id}/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}` },
      });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = b.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      notifyError(e, "Could not download the backup.");
    }
  }

  const lastBackup = backups[0];

  return (
    <AdminLayout title="Backup & Restore">
      <div className="space-y-6 max-w-4xl">
        {/* Overview Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#0A2647]">System Backup</h2>
              <p className="text-sm text-gray-500 mt-1">
                Last backup: {lastBackup ? new Date(lastBackup.date).toLocaleString() : "Never"}
                {lastBackup && <span className="ml-2 text-gray-400">({lastBackup.size})</span>}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreateBackup} disabled={creating} className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50 flex items-center gap-2">
                {creating ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0A2647]" /> Creating...</>
                ) : (
                  "⚡ Create Backup Now"
                )}
              </button>
              {lastBackup && (
                <button onClick={() => handleDownload(lastBackup)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  ⬇ Download Latest
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Honest note about restore */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            Backups are database dumps stored on the server. For safety, restoring a backup is done
            manually — download the <span className="font-mono">.sql</span> file and import it, rather
            than restoring from the panel.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading backups...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button onClick={fetchBackups} className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && backups.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#0A2647]">Backups</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">File</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Size</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {backups.map((backup) => (
                    <tr key={backup.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-sm font-mono text-gray-700">{backup.filename}</td>
                      <td className="px-6 py-3 text-sm text-gray-900">{new Date(backup.date).toLocaleString()}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{backup.size}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{backup.status}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleDownload(backup)} className="text-sm text-[#C9A227] hover:text-[#0A2647] font-medium">Download</button>
                          <button onClick={() => handleRestore(backup.id)} disabled={restoring === backup.id} className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50">
                            {restoring === backup.id ? "..." : "Restore"}
                          </button>
                          <button onClick={() => handleDelete(backup.id)} disabled={deleting === backup.id} className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50">
                            {deleting === backup.id ? "Deleting…" : "Delete"}
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

        {!loading && !error && backups.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">💾</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No backups yet</h3>
            <p className="text-gray-500 text-sm mb-6">Create your first backup to secure your database.</p>
            <button onClick={handleCreateBackup} disabled={creating} className="px-6 py-3 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
              {creating ? "Creating..." : "Create Backup"}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
