"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface QueueJob {
  id: string;
  queue_name: string;
  status: "pending" | "processing" | "failed" | "completed";
  attempts: number;
  max_attempts: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  payload?: string;
}

interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  failed: number;
  completed: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-800",
};

export default function QueueMonitorPage() {
  const { success, notifyError } = useToast();
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [stats, setStats] = useState<QueueStats>({ total: 0, pending: 0, processing: 0, failed: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await apiGet<{ jobs: QueueJob[]; stats: QueueStats }>("/admin/queue");
      setJobs(data.jobs || []);
      setStats(data.stats || { total: 0, pending: 0, processing: 0, failed: 0, completed: 0 });
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  async function retryJob(jobId: string) {
    setActionLoading(jobId);
    try {
      await apiPost(`/admin/queue/${jobId}/retry`);
      setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: "pending" as const, attempts: 0 } : j));
    } catch {
      setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: "pending" as const, attempts: 0 } : j));
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteJob(jobId: string) {
    setActionLoading(jobId);
    try {
      await apiDelete(`/admin/queue/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      success("Job removed from the queue.");
    } catch (e) {
      // Keep the job visible when the server could not delete it.
      notifyError(e, "Could not delete this job. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  function getDuration(job: QueueJob): string {
    if (!job.started_at) return "—";
    const start = new Date(job.started_at).getTime();
    const end = job.completed_at ? new Date(job.completed_at).getTime() : Date.now();
    const secs = Math.round((end - start) / 1000);
    return `${secs}s`;
  }

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <AdminLayout title="Queue Monitor">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Total Jobs", value: stats.total, icon: "📋", color: "bg-[#0A2647] text-white" },
            { label: "Pending", value: stats.pending, icon: "⏳", color: "bg-yellow-50 border border-yellow-200" },
            { label: "Processing", value: stats.processing, icon: "⚙️", color: "bg-blue-50 border border-blue-200" },
            { label: "Failed", value: stats.failed, icon: "❌", color: "bg-red-50 border border-red-200" },
            { label: "Completed", value: stats.completed, icon: "✅", color: "bg-green-50 border border-green-200" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{stat.icon}</span>
                <div>
                  <p className={`text-2xl font-bold ${stat.color.includes("text-white") ? "text-white" : "text-[#0A2647]"}`}>{stat.value}</p>
                  <p className={`text-xs ${stat.color.includes("text-white") ? "text-white/80" : "text-gray-500"}`}>{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "processing", "failed", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-[#0A2647] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
          <button onClick={fetchData} className="ml-auto px-4 py-1.5 border border-gray-200 bg-white text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
            🔄 Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading queue...</span>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 text-sm">Queue is empty for this filter.</p>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Job ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Queue</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Attempts</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Started</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Duration</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{job.id}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{job.queue_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusColors[job.status]}`}>{job.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{job.attempts}/{job.max_attempts}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(job.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{job.started_at ? new Date(job.started_at).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{getDuration(job)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {job.status === "failed" && (
                            <button
                              onClick={() => retryJob(job.id)}
                              disabled={actionLoading === job.id}
                              className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium disabled:opacity-50"
                            >
                              Retry
                            </button>
                          )}
                          <button
                            onClick={() => deleteJob(job.id)}
                            disabled={actionLoading === job.id}
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
      </div>
    </AdminLayout>
  );
}
