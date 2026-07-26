"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface CronJob {
  id: number;
  command: string;
  frequency: string;
  last_run: string | null;
  next_run: string | null;
  is_active: boolean;
}

export default function CronJobsPage() {
  const { success, notifyError } = useToast();
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [runningJob, setRunningJob] = useState<number | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet<{ data: CronJob[] }>("/admin/cron-jobs");
      setJobs(data.data || []);
    } catch (e) {
      // No silent fallback to fake data.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load scheduled tasks. Please check the API connection and try again."
      );
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunNow(job: CronJob) {
    try {
      setRunningJob(job.id);
      await apiPost(`/admin/cron-jobs/${job.id}/run`);
      success("Scheduler run triggered.", "Cron");
      await fetchJobs();
    } catch (e) {
      notifyError(e, "Could not run the scheduler.");
    } finally {
      setRunningJob(null);
    }
  }

  const activeCount = jobs.filter((j) => j.is_active).length;

  return (
    <AdminLayout title="Scheduled Tasks">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            These are the scheduled tasks defined in the application scheduler. They run via the server
            cron entry <span className="font-mono">php artisan schedule:run</span>. Tasks are defined in
            code and are enabled by default.
          </p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {loading ? "Loading…" : `${jobs.length} task${jobs.length !== 1 ? "s" : ""} · ${activeCount} active`}
          </p>
          <button onClick={fetchJobs} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            ↻ Refresh
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading tasks...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button onClick={fetchJobs} className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No scheduled tasks</h3>
            <p className="text-gray-500 text-sm">Scheduled tasks will appear here.</p>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Command</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Frequency</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Last Run</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">{job.command}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{job.frequency}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{job.last_run ? new Date(job.last_run).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full ${job.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${job.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                          {job.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRunNow(job)}
                          disabled={runningJob === job.id}
                          className="text-sm text-[#C9A227] hover:text-[#0A2647] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {runningJob === job.id ? "Running..." : "Run Scheduler"}
                        </button>
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
