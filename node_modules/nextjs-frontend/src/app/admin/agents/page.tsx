"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface AgentUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

interface Agent {
  id: number;
  headline: string | null;
  bio: string | null;
  license_number: string | null;
  brokerage_name: string | null;
  status: string;
  rating: number | null;
  sales_count: number | null;
  is_featured: boolean;
  is_published: boolean;
  user?: AgentUser | null;
}

interface Paginated {
  data: Agent[];
  current_page: number;
  last_page: number;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  license_number: "",
  brokerage_name: "",
  headline: "",
  bio: "",
  status: "approved",
  is_featured: false,
  is_published: true,
};

export default function AgentsPage() {
  const { success, notifyError } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const data = await apiGet<Paginated>(`/admin/agents?${params}`);
      setAgents(data.data || []);
    } catch (err) {
      notifyError(err, "Agents could not be loaded.");
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, notifyError]);

  useEffect(() => {
    void fetchAgents();
  }, [fetchAgents]);

  const filtered = agents.filter((a) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      a.user?.name?.toLowerCase().includes(q) ||
      a.user?.email?.toLowerCase().includes(q) ||
      a.brokerage_name?.toLowerCase().includes(q) ||
      a.license_number?.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (a: Agent) => {
    setEditing(a);
    setForm({
      name: a.user?.name || "",
      email: a.user?.email || "",
      phone: a.user?.phone || "",
      license_number: a.license_number || "",
      brokerage_name: a.brokerage_name || "",
      headline: a.headline || "",
      bio: a.bio || "",
      status: a.status || "approved",
      is_featured: !!a.is_featured,
      is_published: !!a.is_published,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      notifyError(new Error("Name and email are required."));
      return;
    }
    try {
      setSaving(true);
      if (editing) {
        await apiPut(`/admin/agents/${editing.id}`, form);
        success("Agent updated.", "Agents");
      } else {
        await apiPost("/admin/agents", form);
        success("Agent created.", "Agents");
      }
      setShowModal(false);
      await fetchAgents();
    } catch (err) {
      notifyError(err, "Agent could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (id: number, status: string) => {
    try {
      await apiPut(`/admin/agents/${id}`, {
        status,
        is_published: status === "approved",
      });
      success(`Agent marked ${status}.`, "Agents");
      await fetchAgents();
    } catch (err) {
      notifyError(err, "Agent status update failed.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this agent profile?")) return;
    try {
      await apiDelete(`/admin/agents/${id}`);
      success("Agent deleted.", "Agents");
      await fetchAgents();
    } catch (err) {
      notifyError(err, "Agent could not be deleted.");
    }
  };

  const statusColor: Record<string, string> = {
    approved: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    suspended: "bg-red-100 text-red-800",
    rejected: "bg-gray-100 text-gray-800",
  };

  return (
    <AdminLayout title="Agent Management">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search agents..."
          className="flex-1 px-4 py-2 border rounded-lg text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="suspended">Suspended</option>
        </select>
        <button onClick={openCreate} className="px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold">
          + Add Agent
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading agents...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500">No agents yet. Add your first agent.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm">Agent</th>
                <th className="px-4 py-3 text-left text-sm">License</th>
                <th className="px-4 py-3 text-left text-sm">Brokerage</th>
                <th className="px-4 py-3 text-left text-sm">Status</th>
                <th className="px-4 py-3 text-left text-sm">Sales</th>
                <th className="px-4 py-3 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{a.user?.name || "—"}</p>
                    <p className="text-xs text-slate-500">{a.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">{a.license_number || "—"}</td>
                  <td className="px-4 py-3 text-sm">{a.brokerage_name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusColor[a.status] || "bg-slate-100"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{a.sales_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {a.status === "pending" && (
                        <>
                          <button onClick={() => setStatus(a.id, "approved")} className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                            Approve
                          </button>
                          <button onClick={() => setStatus(a.id, "rejected")} className="px-2 py-1 bg-red-600 text-white text-xs rounded">
                            Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => openEdit(a)} className="px-2 py-1 border text-xs rounded">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="px-2 py-1 border border-red-200 text-red-600 text-xs rounded">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-navy">{editing ? "Edit Agent" : "Add Agent"}</h3>
            {(["name", "email", "phone", "license_number", "brokerage_name", "headline"] as const).map((f) => (
              <div key={f}>
                <label className="block text-sm mb-1 capitalize">{f.replace("_", " ")}</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form[f]}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <label className="block text-sm mb-1">Bio</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Status</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
