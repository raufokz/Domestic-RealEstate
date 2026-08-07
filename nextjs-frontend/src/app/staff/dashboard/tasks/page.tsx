"use client";

import { useState, useEffect, useCallback } from "react";
import StaffLayout from "@/components/staff/StaffLayout";
import { apiGet, apiPut, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Task {
  id: number;
  task: string;
  priority: string;
  due: string | null;
  status: string;
  assignedBy: string;
}

const PRIORITY_FILTER = ["All", "High", "Medium", "Low"];
const STATUS_FILTER = ["All", "Pending", "In Progress", "Completed"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [busyId, setBusyId] = useState<number | null>(null);
  const { notifyError } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<Task[]>("/staff/dashboard/tasks");
      setTasks(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = tasks.filter((t) => {
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    return true;
  });

  async function handleComplete(id: number) {
    setBusyId(id);
    try {
      await apiPut(`/staff/dashboard/tasks/${id}`, { status: "completed" });
      fetchData();
    } catch (e) {
      notifyError(e, "Could not update this task.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <StaffLayout title="My Tasks" subtitle="Manage and track your assigned tasks">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
            {error}
            <button onClick={fetchData} className="ml-3 underline font-semibold">Retry</button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Priority</label>
                  <div className="flex items-center gap-1">
                    {PRIORITY_FILTER.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriorityFilter(p)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                          priorityFilter === p
                            ? "bg-[#0A2647] text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                  <div className="flex items-center gap-1">
                    {STATUS_FILTER.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                          statusFilter === s
                            ? "bg-[#0A2647] text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Task</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Priority</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Due Date</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Assigned By</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              t.priority === "High" ? "bg-red-500" :
                              t.priority === "Medium" ? "bg-amber-400" :
                              "bg-slate-300"
                            }`} />
                            <span className="font-medium text-[#0A2647] text-sm">{t.task}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            t.priority === "High" ? "bg-red-100 text-red-700" :
                            t.priority === "Medium" ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{t.due || "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            t.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                            t.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{t.assignedBy}</td>
                        <td className="px-5 py-4 text-right">
                          {t.status !== "Completed" && (
                            <button
                              onClick={() => handleComplete(t.id)}
                              disabled={busyId === t.id}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-50"
                              title="Mark complete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center">
                          <p className="text-sm text-slate-400">{tasks.length === 0 ? "No tasks assigned to you yet." : "No tasks match the selected filters."}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </StaffLayout>
  );
}
