"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface WorkflowDetail {
  id: number;
  name: string;
  description: string;
  trigger_type: string;
  status: "active" | "inactive";
  conditions: { field: string; operator: string; value: string }[];
  actions: { type: string; config: Record<string, string> }[];
  run_count: number;
  created_at: string;
}

interface RunLog {
  id: number;
  trigger_event: string;
  status: "success" | "failure" | "running";
  action_results: { action: string; status: string; detail: string }[];
  timestamp: string;
  duration_ms?: number;
}

const PAGE_SIZE = 10;

const statusColors: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  failure: "bg-red-100 text-red-800",
  running: "bg-yellow-100 text-yellow-800",
  skipped: "bg-gray-100 text-gray-600",
};

export default function WorkflowDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { success, notifyError } = useToast();
  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"config" | "edit" | "logs">("config");
  const [editForm, setEditForm] = useState({ name: "", description: "", trigger_type: "" });
  const [saving, setSaving] = useState(false);
  const [logPage, setLogPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");
      setNotFound(false);
      const [wfRes, logsRes] = await Promise.all([
        apiGet<{ data: WorkflowDetail }>(`/admin/automation/workflows/${id}`),
        apiGet<{ data: RunLog[] }>(`/admin/automation/workflows/${id}/logs`),
      ]);
      setWorkflow(wfRes.data);
      setLogs(logsRes.data || []);
      setEditForm({ name: wfRes.data.name, description: wfRes.data.description, trigger_type: wfRes.data.trigger_type });
    } catch (e) {
      // No silent fallback to fake data.
      if (e instanceof ApiError && e.status === 404) {
        setNotFound(true);
      } else {
        setError(
          e instanceof ApiError
            ? e.message
            : "Could not load this workflow. Please check the API connection and try again."
        );
      }
      setWorkflow(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      // Reuse the real PUT endpoint (there is no /update route).
      await apiPut(`/admin/automation/workflows/${id}`, editForm);
      setWorkflow((prev) => (prev ? { ...prev, ...editForm } : prev));
      setActiveTab("config");
      success("Workflow updated.", "Automation");
    } catch (e) {
      notifyError(e, "Could not save workflow changes.");
    } finally {
      setSaving(false);
    }
  }

  const totalPages = Math.ceil(logs.length / PAGE_SIZE);
  const pagedLogs = logs.slice((logPage - 1) * PAGE_SIZE, logPage * PAGE_SIZE);

  if (loading) {
    return (
      <AdminLayout title="Workflow Detail">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading workflow...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Workflow">
        <div className="bg-red-50 border border-red-200 rounded-xl p-16 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load workflow</h3>
          <p className="text-red-700 text-sm mb-6">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={fetchData} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
              Retry
            </button>
            <Link href="/admin/automation" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
              Back to Workflows
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (notFound || !workflow) {
    return (
      <AdminLayout title="Workflow Not Found">
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <div className="text-4xl mb-4">❓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Workflow not found</h3>
          <Link href="/admin/automation" className="mt-4 inline-block px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
            Back to Workflows
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={workflow.name}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/automation" className="hover:text-[#0A2647]">Automation</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{workflow.name}</span>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex border-b border-gray-200">
            {(["config", "edit", "logs"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-[#C9A227] text-[#0A2647]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "config" ? "Configuration" : tab === "edit" ? "Edit" : `Run History (${logs.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Config Tab */}
        {activeTab === "config" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#0A2647]">Details</h3>
                <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${workflow.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                  {workflow.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Trigger</p>
                  <p className="text-sm font-medium text-slate-800">{workflow.trigger_type.replace(/_/g, " ")}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Total Runs</p>
                  <p className="text-sm font-medium text-slate-800">{workflow.run_count.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Created</p>
                  <p className="text-sm font-medium text-slate-800">{new Date(workflow.created_at).toLocaleDateString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Actions</p>
                  <p className="text-sm font-medium text-slate-800">{workflow.actions.length} configured</p>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#0A2647] mb-4">Conditions</h3>
              {workflow.conditions.length === 0 ? (
                <p className="text-sm text-gray-500">No conditions — triggers on all events.</p>
              ) : (
                <div className="space-y-2">
                  {workflow.conditions.map((cond, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-mono text-[#0A2647]">{cond.field}</span>
                      <span className="px-2 py-0.5 bg-[#8B1E3F] text-white text-xs rounded">{cond.operator}</span>
                      <span className="text-sm text-gray-700">{cond.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#0A2647] mb-4">Actions</h3>
              <div className="space-y-3">
                {workflow.actions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-[#C9A227] rounded-lg flex items-center justify-center text-[#0A2647] font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{action.type.replace(/_/g, " ")}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {Object.entries(action.config).map(([k, v]) => (
                          <span key={k} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Edit Tab */}
        {activeTab === "edit" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#0A2647] mb-4">Edit Workflow</h3>
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
                <select
                  value={editForm.trigger_type}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, trigger_type: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                >
                  <option value="new_lead">New Lead</option>
                  <option value="form_submitted">Form Submitted</option>
                  <option value="status_changed">Status Changed</option>
                  <option value="property_approved">Property Approved</option>
                  <option value="appointment_booked">Appointment Booked</option>
                  <option value="contract_signed">Contract Signed</option>
                  <option value="newsletter_subscribed">Newsletter Subscribed</option>
                  <option value="contact_imported">Contact Imported</option>
                  <option value="scheduled_time">Scheduled Time</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setActiveTab("config")}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <>
            {logs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-16 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No run history</h3>
                <p className="text-gray-500 text-sm">This workflow hasn&apos;t been triggered yet.</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#0A2647] text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Trigger Event</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Action Results</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Duration</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pagedLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{log.trigger_event}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[log.status]}`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                {log.action_results.map((ar, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ar.status === "success" ? "bg-green-500" : ar.status === "failure" ? "bg-red-500" : "bg-gray-400"}`} />
                                    <span className="text-xs text-gray-600 truncate max-w-xs">{ar.action}: {ar.detail}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {log.duration_ms ? (log.duration_ms >= 1000 ? `${(log.duration_ms / 1000).toFixed(1)}s` : `${log.duration_ms}ms`) : "—"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
                    <p className="text-sm text-gray-500">
                      Showing {(logPage - 1) * PAGE_SIZE + 1}–{Math.min(logPage * PAGE_SIZE, logs.length)} of {logs.length}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                        disabled={logPage === 1}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setLogPage((p) => Math.min(totalPages, p + 1))}
                        disabled={logPage === totalPages}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
