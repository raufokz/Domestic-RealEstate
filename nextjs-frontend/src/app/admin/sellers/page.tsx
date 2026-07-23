"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Seller {
  id: number;
  name: string;
  email: string;
  phone: string;
  property_address: string;
  listing_status: string;
  status: string;
  avatar: string;
}

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Inactive: "bg-gray-100 text-gray-800",
  Suspended: "bg-red-100 text-red-800",
};

const listingStatusColors: Record<string, string> = {
  Listed: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Sold: "bg-blue-100 text-blue-800",
  Withdrawn: "bg-gray-100 text-gray-800",
};

const emptyForm = { name: "", email: "", phone: "", property_address: "", listing_status: "Pending", status: "Active" };

export default function SellersPage() {
  const { success, notifyError } = useToast();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ data: Seller[] }>("/admin/users?role=seller");
      setSellers(data.data || []);
    } catch {
      setSellers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSellers(); }, [fetchSellers]);

  const filtered = sellers.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()) || (s.property_address || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreate = () => { setEditingSeller(null); setForm(emptyForm); setShowModal(true); setError(""); };
  const openEdit = (s: Seller) => { setEditingSeller(s); setForm({ name: s.name, email: s.email, phone: s.phone || "", property_address: s.property_address || "", listing_status: s.listing_status || "Pending", status: s.status }); setShowModal(true); setError(""); };

  const handleSave = async () => {
    if (!form.name || !form.email) { setError("Name and email are required"); return; }
    try {
      setSaving(true);
      if (editingSeller) {
        await apiPut(`/admin/users/${editingSeller.id}`, { ...form, role: "seller" });
      } else {
        await apiPost("/admin/users", { ...form, role: "seller" });
      }
      setShowModal(false);
      fetchSellers();
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
      fetchSellers();
    } catch (e) {
      // Keep the row and the confirm dialog when the server refused the delete.
      notifyError(e, "Could not delete this account. Please try again.");
    }
  };

  return (
    <AdminLayout title="Seller Management">
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input type="text" placeholder="Search sellers by name, email or address..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent">
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
          <button onClick={openCreate} className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] transition-colors whitespace-nowrap">
            + Add Seller
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
            <p className="text-gray-500 text-lg">No sellers found</p>
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
                    <th className="px-4 py-3 text-left text-sm font-semibold">Property Address</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Listing Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((seller) => (
                    <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center text-[#0A2647] font-bold text-sm">
                            {seller.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{seller.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{seller.email}</td>
                      <td className="px-4 py-3 text-gray-600">{seller.phone || "-"}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm max-w-[200px] truncate">{seller.property_address || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs rounded-full ${listingStatusColors[seller.listing_status] || listingStatusColors.Pending}`}>{seller.listing_status || "Pending"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(seller)} className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium">Edit</button>
                          <button onClick={() => setDeleteConfirm(seller.id)} className="text-[#8B1E3F] hover:text-red-700 text-sm font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">Showing {filtered.length} of {sellers.length} sellers</p>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#0A2647]">{editingSeller ? "Edit Seller" : "Add Seller"}</h3>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
                <input type="text" value={form.property_address} onChange={(e) => setForm({ ...form, property_address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Status</label>
                <select value={form.listing_status} onChange={(e) => setForm({ ...form, listing_status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]">
                  <option>Pending</option>
                  <option>Listed</option>
                  <option>Sold</option>
                  <option>Withdrawn</option>
                </select>
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
            <h3 className="text-lg font-semibold text-[#0A2647] mb-2">Delete Seller</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this seller? This action cannot be undone.</p>
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
