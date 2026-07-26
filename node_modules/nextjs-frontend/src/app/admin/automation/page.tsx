"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Workflow {
  id: number;
  name: string;
  trigger_type: string;
  description?: string | null;
  is_active?: boolean;
  status?: "active" | "inactive";
  run_count: number;
  last_run_at?: string | null;
}

const triggerColors: Record<string, string> = {
  new_lead: "bg-blue-100 text-blue-800",
  lead_created: "bg-blue-100 text-blue-800",
  status_changed: "bg-indigo-100 text-indigo-800",
  property_approved: "bg-green-100 text-green-800",
  scheduled_time: "bg-yellow-100 text-yellow-800",
  form_submitted: "bg-gray-100 text-gray-800",
};

function normalize(w: Workflow): Workflow {
  return {
    ...w,
    status: w.is_active || w.status === "active" ? "active" : "inactive",
  };
}

export default function AutomationPage() {
  const { success, notifyError } = useToast();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    trigger_type: "new_lead",
  });
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<Workflow[] | { data: Workflow[] }>("/admin/automation/workflows");
      const list = Array.isArray(data) ? data : data.data || [];
      setWorkflows(list.map(normalize));
    } catch (err) {
      notifyError(err, "Workflows could not be loaded.");
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    void fetchWorkflows();
  }, [fetchWorkflows]);

  async function handleToggle(workflow: Workflow) {
    try {
      await apiPost(`/admin/automation/workflows/${workflow.id}/toggle`, {});
      success("Workflow status updated.", "Automation");
      await fetchWorkflows();
    } catch (err) {
      notifyError(err, "Workflow toggle failed.");
    }
  }

  async function handleCreate() {
    try {
      setCreating(true);
      await apiPost("/admin/automation/workflows", newWorkflow);
      success("Workflow created.", "Automation");
      setShowModal(false);
      setNewWorkflow({ name: "", description: "", trigger_type: "new_lead" });
      await fetchWorkflows();
    } catch (err) {
      notifyError(err, "Workflow could not be created.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this workflow?")) return;
    try {
      setDeleting(id);
      await apiDelete(`/admin/automation/workflows/${id}`);
      success("Workflow deleted.", "Automation");
      await fetchWorkflows();
    } catch (err) {
      notifyError(err, "Workflow could not be deleted.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <AdminLayout title="Automation Workflows">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{workflows.length} workflow(s)</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold"
          >
            + Create Workflow
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading workflows...</div>
        ) : workflows.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No workflows yet</h3>
            <p className="text-gray-500 text-sm mb-6">Create your first automation workflow.</p>
            <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-gold text-navy rounded-lg text-sm font-semibold">
              Create Workflow
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm">Workflow</th>
                  <th className="px-4 py-3 text-left text-sm">Trigger</th>
                  <th className="px-4 py-3 text-left text-sm">Status</th>
                  <th className="px-4 py-3 text-left text-sm">Runs</th>
                  <th className="px-4 py-3 text-left text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {workflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/automation/${workflow.id}`} className="font-medium text-navy">
                        {workflow.name}
                      </Link>
                      {workflow.description && (
                        <p className="text-xs text-slate-500 truncate max-w-xs">{workflow.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${triggerColors[workflow.trigger_type] || "bg-slate-100"}`}>
                        {workflow.trigger_type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(workflow)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          workflow.status === "active" ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transform ${
                            workflow.status === "active" ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm">{workflow.run_count ?? 0}</td>
                    <td className="px-4 py-3 space-x-2">
                      <Link href={`/admin/automation/${workflow.id}`} className="text-sm text-gold font-medium">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(workflow.id)}
                        disabled={deleting === workflow.id}
                        className="text-sm text-red-600 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
              <h3 className="text-lg font-bold text-navy">Create Workflow</h3>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Name"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow((p) => ({ ...p, name: e.target.value }))}
              />
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Description"
                rows={3}
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow((p) => ({ ...p, description: e.target.value }))}
              />
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={newWorkflow.trigger_type}
                onChange={(e) => setNewWorkflow((p) => ({ ...p, trigger_type: e.target.value }))}
              >
                <option value="new_lead">New Lead</option>
                <option value="form_submitted">Form Submitted</option>
                <option value="status_changed">Status Changed</option>
                <option value="property_approved">Property Approved</option>
                <option value="appointment_booked">Appointment Booked</option>
                <option value="contract_signed">Contract Signed</option>
                <option value="newsletter_subscribed">Newsletter Subscribed</option>
                <option value="scheduled_time">Scheduled Time</option>
              </select>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newWorkflow.name || creating}
                  className="px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
