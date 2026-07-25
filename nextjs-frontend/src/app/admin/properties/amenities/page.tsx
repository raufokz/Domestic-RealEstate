"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Amenity {
  id: number;
  name: string;
  category: string;
  icon: string;
  used_in_properties: number;
}

const emptyForm = { name: "", category: "", icon: "" };

const iconOptions = ["🏊", "🏋️", "🛗", "🅿️", "🔒", "🌿", "🎪", "👶", "🐕", "📦", "🚿", "❄️", "🔥", "📺", "🛜", "🧹", "🪴", "🚶", "🎯", "⭐"];

const categoryOptions = [
  "Building",
  "Interior",
  "Exterior",
  "Security",
  "Recreation",
  "Convenience",
  "Transportation",
  "Community",
];

export default function AmenitiesPage() {
  const { success, notifyError } = useToast();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchAmenities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ data: Amenity[] }>("/admin/amenities");
      setAmenities(data.data || []);
    } catch {
      try {
        const data = await apiGet<{ data: Amenity[] }>("/admin/properties?filter=amenities");
        setAmenities(data.data || []);
      } catch {
        setAmenities([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAmenities(); }, [fetchAmenities]);

  const filtered = amenities.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || a.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categories = [...new Set(amenities.map((a) => a.category).filter(Boolean))];

  const openCreate = () => { setEditingAmenity(null); setForm(emptyForm); setShowModal(true); setError(""); };
  const openEdit = (a: Amenity) => { setEditingAmenity(a); setForm({ name: a.name, category: a.category || "", icon: a.icon || "" }); setShowModal(true); setError(""); };

  const handleSave = async () => {
    if (!form.name) { setError("Amenity name is required"); return; }
    try {
      setSaving(true);
      if (editingAmenity) {
        await apiPut(`/admin/amenities/${editingAmenity.id}`, form);
      } else {
        await apiPost("/admin/amenities", form);
      }
      setShowModal(false);
      fetchAmenities();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/admin/amenities/${id}`);
      setDeleteConfirm(null);
      success("Amenity deleted.");
      fetchAmenities();
    } catch (e) {
      notifyError(e, "Could not delete this amenity. It may be in use by a property.");
    }
  };

  return (
    <AdminLayout title="Amenities Management">
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input type="text" placeholder="Search amenities..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent">
            <option value="All">All Categories</option>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={openCreate} className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] transition-colors whitespace-nowrap">
            + Add Amenity
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
            <p className="text-gray-500 text-lg">No amenities found</p>
            <p className="text-gray-400 text-sm mt-1">Add your first amenity to get started</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Amenity Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Icon</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Used In Properties</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((amenity) => (
                    <tr key={amenity.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{amenity.name}</td>
                      <td className="px-4 py-3">
                        {amenity.category ? (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{amenity.category}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xl">{amenity.icon || "-"}</td>
                      <td className="px-4 py-3 text-gray-600 text-center">{amenity.used_in_properties ?? 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(amenity)} className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium">Edit</button>
                          <button onClick={() => setDeleteConfirm(amenity.id)} className="text-[#8B1E3F] hover:text-red-700 text-sm font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">Showing {filtered.length} of {amenities.length} amenities</p>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#0A2647]">{editingAmenity ? "Edit Amenity" : "Add Amenity"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {error && <p className="text-[#8B1E3F] text-sm mb-3 bg-red-50 p-2 rounded-lg">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenity Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" placeholder="e.g. Swimming Pool, Gym, Elevator" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]">
                  <option value="">Select category...</option>
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="grid grid-cols-10 gap-2">
                  {iconOptions.map((icon) => (
                    <button key={icon} type="button" onClick={() => setForm({ ...form, icon })} className={`w-10 h-10 text-xl rounded-lg border-2 flex items-center justify-center hover:bg-gray-50 transition-colors ${form.icon === icon ? "border-[#C9A227] bg-yellow-50" : "border-gray-200"}`}>
                      {icon}
                    </button>
                  ))}
                </div>
                <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm" placeholder="Or type a custom emoji/icon" />
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
            <h3 className="text-lg font-semibold text-[#0A2647] mb-2">Delete Amenity</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this amenity? This action cannot be undone.</p>
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
