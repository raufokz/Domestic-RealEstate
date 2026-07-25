"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface LeadAssignee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface LeadActivity {
  id: number;
  type: string;
  description: string;
  created_at: string;
  performer: LeadAssignee | null;
}

interface LeadNote {
  id: number;
  note: string;
  pinned: boolean;
  created_at: string;
  creator: LeadAssignee | null;
}

interface LeadTask {
  id: number;
  title: string;
  status: string;
  due_date: string | null;
  priority: string;
}

interface Lead {
  id: number;
  lead_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: string;
  score: number;
  source: string | null;
  type: string;
  priority: string;
  budget_min: number | null;
  budget_max: number | null;
  timeline: string | null;
  motivation: string | null;
  assigned_to: number | null;
  created_at: string;
  assignee: LeadAssignee | null;
  activities: LeadActivity[];
  notes: LeadNote[];
  tasks: LeadTask[];
  assignments: { id: number; agent: LeadAssignee; assigned_at: string }[];
}

interface Agent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

const STATUS_OPTIONS = ["new", "contacted", "qualified", "scheduled", "negotiation", "converted", "lost", "archived"];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-green-100 text-green-700",
  scheduled: "bg-purple-100 text-purple-700",
  negotiation: "bg-orange-100 text-orange-700",
  converted: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
  archived: "bg-slate-100 text-slate-500",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  normal: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-500",
  urgent: "bg-red-200 text-red-800",
};

const ACTIVITY_ICONS: Record<string, string> = {
  created: "new",
  assigned: "person",
  note: "note",
  status_change: "status",
  email: "email",
  call: "phone",
};

function LoadingSkeleton() {
  return (
    <AdminLayout title="Lead Detail">
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-40" />
                  <div className="h-3 bg-slate-100 rounded w-32" />
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-8 bg-slate-200 rounded w-12 ml-auto" />
                  <div className="h-3 bg-slate-100 rounded w-16 ml-auto" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg space-y-1">
                    <div className="h-3 bg-slate-200 rounded w-12" />
                    <div className="h-4 bg-slate-100 rounded w-20" />
                  </div>
                ))}
              </div>
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <div className="h-5 bg-slate-200 rounded w-32" />
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-12 bg-slate-50 rounded-lg" />
                ))}
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <div className="h-5 bg-slate-200 rounded w-24" />
                <div className="h-10 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminLeadDetailPage() {
  const { success, notifyError } = useToast();
  const params = useParams();
  const id = params?.id;

  const [lead, setLead] = useState<Lead | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [note, setNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchLead = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet<Lead>(`/leads/${id}`);
      setLead(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load lead";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAgents = useCallback(async () => {
    try {
      const data = await apiGet<Agent[] | { data: Agent[] }>("/admin/agents");
      setAgents(Array.isArray(data) ? data : (data as { data: Agent[] }).data ?? []);
    } catch {
      setAgents([]);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await fetchLead();
      await fetchAgents();
    })();
  }, [fetchLead, fetchAgents]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !lead) return;
    try {
      const updated = await apiPut<Lead>(`/leads/${id}/status`, { status: newStatus });
      setLead((prev) => (prev ? { ...prev, status: updated.status } : prev));
      success("Lead status updated.", "CRM");
    } catch (err: unknown) {
      notifyError(err, "CRM is not working because the lead status could not be updated.");
    }
  };

  const handleAddNote = async () => {
    if (!id || !note.trim() || submitting) return;
    try {
      setSubmitting(true);
      await apiPost(`/leads/${id}/notes`, { note: note.trim() });
      setNote("");
      await fetchLead();
      success("Note added.", "CRM");
    } catch (err: unknown) {
      notifyError(err, "CRM is not working because the note could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTask = async () => {
    if (!id || !taskTitle.trim() || submitting) return;
    try {
      setSubmitting(true);
      const body: Record<string, unknown> = { title: taskTitle.trim() };
      if (taskDueDate) body.due_date = taskDueDate;
      await apiPost(`/leads/${id}/tasks`, body);
      setTaskTitle("");
      setTaskDueDate("");
      await fetchLead();
      success("Task created.", "CRM");
    } catch (err: unknown) {
      notifyError(err, "CRM is not working because the task could not be created.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!id || !selectedAgent || submitting) return;
    try {
      setSubmitting(true);
      await apiPost(`/leads/${id}/assign`, { agent_id: Number(selectedAgent) });
      setSelectedAgent("");
      await fetchLead();
      success("Lead assigned.", "CRM");
    } catch (err: unknown) {
      notifyError(err, "CRM is not working because the lead could not be assigned.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (error || !lead) {
    return (
      <AdminLayout title="Lead Detail">
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-red-600 mb-4">{error || "Lead not found"}</p>
          <button onClick={fetchLead} className="px-4 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-medium hover:bg-[#0d3366] transition">Retry</button>
        </div>
      </AdminLayout>
    );
  }

  const scoreColor = lead.score >= 80 ? "text-green-600" : lead.score >= 60 ? "text-amber-600" : "text-slate-500";
  const scoreBarColor = lead.score >= 80 ? "bg-green-500" : lead.score >= 60 ? "bg-amber-500" : "bg-slate-400";
  const displayName = `${lead.first_name} ${lead.last_name}`;
  const initials = `${lead.first_name?.[0] ?? ""}${lead.last_name?.[0] ?? ""}`;

  return (
    <AdminLayout title="Lead Detail">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Header + Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#0A2647] rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">{initials}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-[#0A2647]">{displayName}</h2>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[lead.status] ?? "bg-slate-100 text-slate-500"}`}>{lead.status}</span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${PRIORITY_COLORS[lead.priority] ?? "bg-slate-100 text-slate-500"}`}>{lead.priority}</span>
                  </div>
                  <p className="text-slate-500 text-sm">{lead.lead_number}</p>
                </div>
                <div className="text-right">
                  <span className={`text-3xl font-bold ${scoreColor}`}>{lead.score ?? 0}</span>
                  <p className="text-xs text-slate-500">AI Score</p>
                </div>
              </div>

              {/* Score bar */}
              <div className="mb-6">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${scoreBarColor}`} style={{ width: `${Math.min(lead.score ?? 0, 100)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Email", value: lead.email || "—" },
                  { label: "Phone", value: lead.phone || "—" },
                  { label: "Type", value: lead.type },
                  { label: "Source", value: lead.source || "—" },
                  { label: "Budget", value: lead.budget_min != null && lead.budget_max != null ? `$${(Number(lead.budget_min) / 1000).toFixed(0)}K - $${(Number(lead.budget_max) / 1000).toFixed(0)}K` : "—" },
                  { label: "Location", value: lead.motivation || "—" },
                  { label: "Timeline", value: lead.timeline || "—" },
                  { label: "Created", value: new Date(lead.created_at).toLocaleDateString() },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-sm font-medium text-slate-800 truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#0A2647] mb-4">Activity Timeline</h3>
              {lead.activities?.length ? (
                <div className="space-y-4">
                  {lead.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs">{ACTIVITY_ICONS[activity.type] ? "📋" : "📋"}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{activity.description}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {activity.performer ? `${activity.performer.first_name} ${activity.performer.last_name} — ` : ""}
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No activities yet.</p>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#0A2647] mb-4">Notes</h3>
              {lead.notes?.length ? (
                <div className="space-y-3 mb-4">
                  {lead.notes.map((n) => (
                    <div key={n.id} className={`p-3 rounded-lg ${n.pinned ? "bg-amber-50 border border-amber-200" : "bg-slate-50"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600">{n.creator ? `${n.creator.first_name} ${n.creator.last_name}` : "System"}</span>
                        <span className="text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-700">{n.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 mb-4">No notes yet.</p>
              )}
              <div className="flex gap-2">
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddNote()} placeholder="Add a note..." className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
                <button onClick={handleAddNote} disabled={submitting || !note.trim()} className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">Add Note</button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#0A2647] mb-4">Status</h3>
              <select value={lead.status} onChange={(e) => handleStatusChange(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Tasks */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#0A2647] mb-4">Tasks</h3>
              {lead.tasks?.length ? (
                <div className="space-y-2 mb-3">
                  {lead.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <span className={`w-2 h-2 rounded-full ${task.status === "completed" ? "bg-green-500" : task.status === "in_progress" ? "bg-blue-500" : "bg-amber-500"}`} />
                      <span className="text-sm text-slate-700 flex-1">{task.title}</span>
                      {task.due_date && <span className="text-xs text-slate-400">{new Date(task.due_date).toLocaleDateString()}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 mb-3">No tasks yet.</p>
              )}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTask()} placeholder="Add task..." className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
                  <button onClick={handleAddTask} disabled={submitting || !taskTitle.trim()} className="px-3 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-medium hover:bg-[#0d3366] transition disabled:opacity-50">Add</button>
                </div>
                <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
              </div>
            </div>

            {/* Assignment */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#0A2647] mb-4">Assignment</h3>
              {lead.assignee ? (
                <div className="p-3 bg-slate-50 rounded-lg mb-3">
                  <p className="text-xs text-slate-500">Currently assigned to</p>
                  <p className="text-sm font-medium text-slate-800">{lead.assignee.first_name} {lead.assignee.last_name}</p>
                  <p className="text-xs text-slate-400">{lead.assignee.email}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-400 mb-3">Unassigned</p>
              )}
              <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm mb-3">
                <option value="">Reassign to...</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>
                ))}
              </select>
              <button onClick={handleAssign} disabled={submitting || !selectedAgent} className="w-full px-4 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-medium hover:bg-[#0d3366] transition disabled:opacity-50">Reassign Lead</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
