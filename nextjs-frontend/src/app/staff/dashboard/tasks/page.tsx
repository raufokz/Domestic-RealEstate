"use client";

import { useState } from "react";
import StaffLayout from "@/components/staff/StaffLayout";

const ALL_TASKS = [
  { id: 1, task: "Review new agent applications", priority: "High", due: "Jul 11, 10:00 AM", status: "Pending", assignedBy: "Admin" },
  { id: 2, task: "Update property listings for compliance", priority: "Medium", due: "Jul 11, 12:00 PM", status: "In Progress", assignedBy: "Sarah K." },
  { id: 3, task: "Process commission payments", priority: "High", due: "Jul 11, 2:00 PM", status: "Pending", assignedBy: "Admin" },
  { id: 4, task: "Respond to buyer escalations", priority: "Medium", due: "Jul 11, 3:30 PM", status: "Pending", assignedBy: "Mike R." },
  { id: 5, task: "Generate weekly performance report", priority: "Low", due: "Jul 11, 5:00 PM", status: "Pending", assignedBy: "Admin" },
  { id: 6, task: "Conduct property walkthrough for 123 Oak Lane", priority: "Medium", due: "Jul 12, 9:00 AM", status: "Pending", assignedBy: "Sarah K." },
  { id: 7, task: "Follow up with John Martinez on closing", priority: "High", due: "Jul 12, 11:00 AM", status: "In Progress", assignedBy: "Admin" },
  { id: 8, task: "Update CRM records for Q2 leads", priority: "Low", due: "Jul 14, 5:00 PM", status: "Completed", assignedBy: "Mike R." },
];

const PRIORITY_FILTER = ["All", "High", "Medium", "Low"];
const STATUS_FILTER = ["All", "Pending", "In Progress", "Completed"];

export default function TasksPage() {
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = ALL_TASKS.filter((t) => {
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <StaffLayout title="My Tasks" subtitle="Manage and track your assigned tasks">
      <div className="space-y-6">
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
          <button className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#b8911f] text-[#0A2647] font-semibold text-sm px-4 py-2 rounded-lg transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
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
                    <td className="px-5 py-4 text-sm text-slate-600">{t.due}</td>
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
                      <div className="flex items-center justify-end gap-1">
                        {t.status !== "Completed" && (
                          <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Complete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button className="p-1.5 text-slate-400 hover:text-[#0A2647] hover:bg-slate-100 rounded-lg transition" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <p className="text-sm text-slate-400">No tasks match the selected filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
