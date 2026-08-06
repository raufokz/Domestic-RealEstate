"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import AgentLayout from "@/components/agent/AgentLayout";
import { useFetch } from "@/hooks/useFetch";
import { fullName, initials } from "@/lib/name";
import { apiPost, apiPut } from "@/lib/api";
import { useToast } from "@/components/Toast";
import Link from "next/link";

interface LeadDetail {
  id: number;
  lead_number: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone: string;
  status: string;
  score: number;
  source: string;
  type: string;
  priority: string;
  budget_min: number;
  budget_max: number;
  preferred_location: string;
  notes: string;
  created_at: string;
  activities: Array<{
    id: number;
    type: string;
    description: string;
    created_at: string;
  }>;
  tasks: Array<{
    id: number;
    title: string;
    status: string;
    due_date: string;
  }>;
}

export default function LeadDetailPage() {
  const { success, notifyError } = useToast();
  const params = useParams();
  const id = params?.id;
  const { data: lead, loading, refetch } = useFetch<LeadDetail>(`/leads/${id}`, !!id);
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setAddingNote(true);
    try {
      await apiPost(`/leads/${id}/notes`, { content: note });
      setNote("");
      success("Note added.");
      refetch();
    } catch (e) {
      // Keep the typed note so the agent does not lose their work.
      notifyError(e, "Could not save this note. Your text is still here — please try again.");
    } finally {
      setAddingNote(false);
    }
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim()) return;
    setAddingTask(true);
    try {
      await apiPost(`/leads/${id}/tasks`, { title: taskTitle, due_date: new Date().toISOString().split("T")[0] });
      setTaskTitle("");
      success("Task created.");
      refetch();
    } catch (e) {
      notifyError(e, "Could not create this task. Please try again.");
    } finally {
      setAddingTask(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    setNewStatus(status);
    try {
      await apiPut(`/leads/${id}/status`, { status });
      success("Lead status updated.");
      refetch();
    } catch (e) {
      // Do not leave the UI showing a status the server never accepted.
      notifyError(e, "Could not update the lead status. Please try again.");
    } finally {
      setNewStatus("");
    }
  };

  return (
    <AgentLayout title="Lead Detail" subtitle={fullName(lead) || "Loading..."}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/agent/dashboard/leads" className="text-sm text-slate-500 hover:text-[#0A2647]">← Back to Leads</Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">Loading lead details...</div>
        ) : !lead ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">Lead not found</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#0A2647] rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">{initials(fullName(lead))}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#0A2647]">{fullName(lead) || "Unknown Lead"}</h2>
                    <p className="text-slate-500 text-sm">{lead.lead_number}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-3xl font-bold ${lead.score >= 80 ? "text-green-600" : lead.score >= 60 ? "text-amber-600" : "text-slate-500"}`}>{lead.score}</span>
                    <p className="text-xs text-slate-500">AI Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-800 truncate">{lead.email}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-800">{lead.phone || "—"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Type</p>
                    <p className="text-sm font-medium text-slate-800 capitalize">{lead.type}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Source</p>
                    <p className="text-sm font-medium text-slate-800">{lead.source}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-[#0A2647] mb-4">Activity Timeline</h3>
                {lead.activities && lead.activities.length > 0 ? (
                  <div className="space-y-4">
                    {lead.activities.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs">
                            {activity.type === "note" ? "📝" : activity.type === "task" ? "✅" : activity.type === "status" ? "🔄" : "📞"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-700">{activity.description}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(activity.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No activities yet. Add a note or task to get started.</p>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-[#0A2647] mb-4">Add Note</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Type your note here..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none text-sm resize-none"
                />
                <button
                  onClick={handleAddNote}
                  disabled={addingNote || !note.trim()}
                  className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
                >
                  {addingNote ? "Adding..." : "Add Note"}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-[#0A2647] mb-4">Status</h3>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-[#0A2647] mb-4">Tasks</h3>
                {lead.tasks && lead.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {lead.tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                        <span className={`w-2 h-2 rounded-full ${task.status === "completed" ? "bg-green-500" : "bg-amber-500"}`} />
                        <span className="text-sm text-slate-700 flex-1">{task.title}</span>
                        <span className="text-xs text-slate-400">{task.due_date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 mb-3">No tasks yet</p>
                )}
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Add a task..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  />
                  <button
                    onClick={handleAddTask}
                    disabled={addingTask || !taskTitle.trim()}
                    className="px-3 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-medium hover:bg-[#0d3366] transition disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-[#0A2647] mb-4">Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Priority</span>
                    <span className={`text-sm font-medium capitalize ${
                      lead.priority === "high" ? "text-red-600" : lead.priority === "medium" ? "text-amber-600" : "text-slate-600"
                    }`}>{lead.priority || "Normal"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Budget</span>
                    <span className="text-sm font-medium text-slate-800">
                      {lead.budget_min && lead.budget_max
                        ? `$${(lead.budget_min / 1000).toFixed(0)}K - $${(lead.budget_max / 1000).toFixed(0)}K`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Location</span>
                    <span className="text-sm font-medium text-slate-800">{lead.preferred_location || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Created</span>
                    <span className="text-sm font-medium text-slate-800">{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AgentLayout>
  );
}
