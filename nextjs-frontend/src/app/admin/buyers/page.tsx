"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Buyer {
  id: number;
  name: string;
  email: string;
  phone: string;
  budget_min: number;
  budget_max: number;
  property_preferences: string;
  status: string;
  avatar: string;
}

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Inactive: "bg-gray-100 text-gray-800",
  Suspended: "bg-red-100 text-red-800",
};

const emptyForm = { name: "", email: "", phone: "", budget_min: "", budget_max: "", property_preferences: "", status: "Active" };

export default function BuyersPage() {
  const { success, notifyError } = useToast();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchBuyers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ data: Buyer[] }>("/admin/users?role=buyer");
      setBuyers(data.data || []);
    } catch {
      setBuyers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBuyers(); }, [fetchBuyers]);

  const filtered = buyers.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return "-";
    const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
  };

  const openCreate = () => { setEditingBuyer(null); setForm(emptyForm); setShowModal(true); setError(""); };
  const openEdit = (b: Buyer) => { setEditingBuyer(b); setForm({ name: b.name, email: b.email, phone: b.phone || "", budget_min: b.budget_min ? String(b.budget_min) : "", budget_max: b.budget_max ? String(b.budget_max) : "", property_preferences: b.property_preferences || "", status: b.status }); setShowModal(true); setError(""); };

  const handleSave = async () => {
    if (!form.name || !form.email) { setError("Name and email are required"); return; }
    try {
      setSaving(true);
      const payload = { ...form, role: "buyer", budget_min: form.budget_min ? Number(form.budget_min) : null, budget_max: form.budget_max ? Number(form.budget_max) : null };
      if (editingBuyer) {
        await apiPut(`/admin/users/${editingBuyer.id}`, payload);
      } else {
        await apiPost("/admin/users", payload);
      }
      setShowModal(false);
      fetchBuyers();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/admin/users/${id}`);
      setDeleteConfirm(null);
      success("Account deleted.");
      fetchBuyers();
    } catch (e) {
      // Keep the row and the confirm dialog when the server refused the delete.
      notifyError(e, "Could not delete this account. Please try again.");
    }
  };

  return (
    <AdminLayout title="Buyer Management">
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input type="text" placeholder="Search buyers by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent">
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
          <button onClick={openCreate} className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] transition-colors whitespace-nowrap">
            + Add Buyer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No buyers found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Budget Range</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Preferences</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((buyer) => (
                    <tr key={buyer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center text-[#0A2647] font-bold text-sm">
                            {buyer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{buyer.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{buyer.email}</td>
                      <td className="px-4 py-3 text-gray-600">{buyer.phone || "-"}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{formatBudget(buyer.budget_min, buyer.budget_max)}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm max-w-[180px] truncate">{buyer.property_preferences || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs rounded-full ${statusColors[buyer.status] || statusColors.Inactive}`}>{buyer.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(buyer)} className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium">Edit</button>
                          <button onClick={() => setDeleteConfirm(buyer.id)} className="text-[#8B1E3F] hover:text-red-700 text-sm font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">Showing {filtered.length} of {buyers.length} buyers</p>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#0A2647]">{editingBuyer ? "Edit Buyer" : "Add Buyer"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {error && <p className="text-[#8B1E3F] text-sm mb-3 bg-red-50 p-2 rounded-lg">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Min</label>
                  <input type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Max</label>
                  <input type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Preferences</label>
                <textarea value={form.property_preferences} onChange={(e) => setForm({ ...form, property_preferences: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" rows={3} placeholder="e.g. 3BR apartment, downtown, near schools" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]">
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Suspended</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-[#0A2647] mb-2">Delete Buyer</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this buyer? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-[#8B1E3F] text-white rounded-lg font-semibold hover:bg-red-800">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
