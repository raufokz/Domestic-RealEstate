"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  posts_count: number;
}

export default function BlogCategoriesPage() {
  const { success, notifyError } = useToast();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BlogCategory | null>(null);
  const [form, setForm] = useState<{ name: string; slug: string }>({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<{ data: BlogCategory[] }>("/admin/blog-categories");
      setCategories(data.data || []);
    } catch (e) {
      // No silent fallback to fake data.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load blog categories. Please check the API connection and try again."
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", slug: "" });
    setShowModal(true);
  }

  function openEdit(cat: BlogCategory) {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        await apiPut(`/admin/blog-categories/${editing.id}`, form);
        success("Category updated.", "Blog");
      } else {
        await apiPost("/admin/blog-categories", form);
        success("Category created.", "Blog");
      }
      setShowModal(false);
      setEditing(null);
      await fetchData(); // reflect real persisted state
    } catch (e) {
      notifyError(e, "Could not save the category.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm("Delete this category?")) return;
    setActionLoading(id);
    try {
      await apiDelete(`/admin/blog-categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      success("Category deleted.", "Blog");
    } catch (e) {
      // Do NOT remove it from the UI if the delete failed.
      notifyError(e, "Could not delete the category.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <AdminLayout title="Blog Categories">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {loading ? "Loading…" : `${categories.length} categories`}
          </p>
          <button onClick={openCreate} className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            + Create Category
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading categories...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button onClick={fetchData} className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">📂</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-500 text-sm mb-6">Create your first blog category.</p>
            <button onClick={openCreate} className="px-6 py-3 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
              Create Category
            </button>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Posts</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{cat.slug}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#0A2647]">{cat.posts_count}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(cat)} className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium">Edit</button>
                          <button onClick={() => deleteCategory(cat.id)} disabled={actionLoading === cat.id} className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50">
                            {actionLoading === cat.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0A2647]">{editing ? "Edit Category" : "Create Category"}</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input type="text" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="auto-generated from name" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
                  <p className="text-xs text-gray-400 mt-1">Leave blank to auto-generate from the name.</p>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={!form.name || saving} className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Save Changes" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
