"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface PropertyType {
  id: number;
  name: string;
  slug: string;
  description: string;
  properties_count: number;
  status: string;
}

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Inactive: "bg-gray-100 text-gray-800",
};

const emptyForm = { name: "", slug: "", description: "", status: "Active" };

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function PropertyTypesPage() {
  const { success, notifyError } = useToast();
  const [types, setTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<PropertyType | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);

  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ data: PropertyType[] }>("/admin/property-types");
      setTypes(data.data || []);
    } catch {
      try {
        const data = await apiGet<{ data: PropertyType[] }>("/admin/properties?filter=types");
        setTypes(data.data || []);
      } catch {
        setTypes([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTypes(); }, [fetchTypes]);

  const filtered = types.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setEditingType(null); setForm(emptyForm); setShowModal(true); setError(""); setAutoSlug(true); };
  const openEdit = (t: PropertyType) => { setEditingType(t); setForm({ name: t.name, slug: t.slug, description: t.description || "", status: t.status }); setShowModal(true); setError(""); setAutoSlug(false); };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({ ...prev, name: value, slug: autoSlug ? slugify(value) : prev.slug }));
  };

  const handleSlugChange = (value: string) => {
    setAutoSlug(false);
    setForm((prev) => ({ ...prev, slug: value }));
  };

  const handleSave = async () => {
    if (!form.name) { setError("Type name is required"); return; }
    try {
      setSaving(true);
      const payload = { ...form, slug: form.slug || slugify(form.name) };
      if (editingType) {
        await apiPut(`/admin/property-types/${editingType.id}`, payload);
      } else {
        await apiPost("/admin/property-types", payload);
      }
      setShowModal(false);
      fetchTypes();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/admin/property-types/${id}`);
      setDeleteConfirm(null);
      success("Property type deleted.");
      fetchTypes();
    } catch (e) {
      notifyError(e, "Could not delete this property type. It may be in use by a property.");
    }
  };

  return (
    <AdminLayout title="Property Types">
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input type="text" placeholder="Search property types..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
          </div>
          <button onClick={openCreate} className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] transition-colors whitespace-nowrap">
            + Add Type
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
            <p className="text-gray-500 text-lg">No property types found</p>
            <p className="text-gray-400 text-sm mt-1">Add your first property type to get started</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Properties Count</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((type) => (
                    <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{type.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-mono">{type.slug}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm max-w-[250px] truncate">{type.description || "-"}</td>
                      <td className="px-4 py-3 text-gray-600 text-center">{type.properties_count ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs rounded-full ${statusColors[type.status] || statusColors.Inactive}`}>{type.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(type)} className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium">Edit</button>
                          <button onClick={() => setDeleteConfirm(type.id)} className="text-[#8B1E3F] hover:text-red-700 text-sm font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">Showing {filtered.length} of {types.length} types</p>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#0A2647]">{editingType ? "Edit Property Type" : "Add Property Type"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {error && <p className="text-[#8B1E3F] text-sm mb-3 bg-red-50 p-2 rounded-lg">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type Name *</label>
                <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" placeholder="e.g. Apartment, Villa, Plot" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => handleSlugChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] font-mono text-sm" placeholder="auto-generated-from-name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" rows={3} placeholder="Brief description of this property type" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]">
                  <option>Active</option>
                  <option>Inactive</option>
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
            <h3 className="text-lg font-semibold text-[#0A2647] mb-2">Delete Property Type</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this property type? This action cannot be undone.</p>
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
