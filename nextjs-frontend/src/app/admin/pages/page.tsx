"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface CmsPage {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "published";
}

interface PageForm {
  title: string;
  slug: string;
  status: "draft" | "published";
}

const EMPTY_FORM: PageForm = { title: "", slug: "", status: "draft" };

const statusColors: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CmsPagesPage() {
  const { success, notifyError } = useToast();
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal] = useState<{ mode: "create" | "edit"; page?: CmsPage } | null>(null);
  const [form, setForm] = useState<PageForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<{ data: CmsPage[] }>("/admin/pages");
      setPages(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load pages. Please check the API connection and try again."
      );
      setPages([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setModal({ mode: "create" });
  }

  function openEdit(page: CmsPage) {
    setForm({ title: page.title, slug: page.slug, status: page.status });
    setModal({ mode: "edit", page });
  }

  async function handleSave() {
    if (!form.title.trim()) {
      notifyError(new Error("Page title is required."), "Please add a title.");
      return;
    }
    setSaving(true);
    try {
      const slug = form.slug.trim() || slugify(form.title);
      if (modal?.mode === "create") {
        await apiPost("/admin/pages", { title: form.title.trim(), slug, status: form.status });
        success("Page created.");
      } else if (modal?.page) {
        await apiPut(`/admin/pages/${modal.page.id}`, {
          title: form.title.trim(),
          slug,
          status: form.status,
        });
        success("Page updated.");
      }
      setModal(null);
      await fetchData();
    } catch (e) {
      notifyError(e, "Could not save this page. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(page: CmsPage) {
    setActionLoading(page.id);
    try {
      const next = page.status === "published" ? "draft" : "published";
      await apiPost(`/admin/pages/${page.id}/publish`, { status: next });
      success(`Page ${next === "published" ? "published" : "moved to draft"}.`);
      await fetchData();
    } catch (e) {
      notifyError(e, "Could not change page status.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(page: CmsPage) {
    if (!window.confirm(`Delete "${page.title}"? This cannot be undone.`)) {
      return;
    }
    setActionLoading(page.id);
    try {
      await apiDelete(`/admin/pages/${page.id}`);
      success("Page deleted.");
      await fetchData();
    } catch (e) {
      notifyError(e, "Could not delete this page. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = statusFilter === "All" ? pages : pages.filter((p) => p.status === statusFilter);
  const counts = {
    All: pages.length,
    Draft: pages.filter((p) => p.status === "draft").length,
    Published: pages.filter((p) => p.status === "published").length,
  };

  return (
    <AdminLayout title="CMS Pages">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2">
          {(["All", "Draft", "Published"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-[#0A2647] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {status} ({counts[status]})
            </button>
          ))}
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
        >
          + Create New Page
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading pages...</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && pages.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pages yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first page to get started.</p>
          <button
            onClick={openCreate}
            className="px-6 py-3 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
          >
            Create Page
          </button>
        </div>
      )}

      {/* Pages Table */}
      {!loading && !error && pages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A2647] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Page Title</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{page.title}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">/{page.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs rounded-full capitalize ${statusColors[page.status]}`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => openEdit(page)}
                          className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium"
                        >
                          Edit
                        </button>
                        <a
                          href={`/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        >
                          Preview
                        </a>
                        <button
                          onClick={() => togglePublish(page)}
                          disabled={actionLoading === page.id}
                          className="text-indigo-500 hover:text-indigo-700 text-sm font-medium disabled:opacity-50"
                        >
                          {page.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleDelete(page)}
                          disabled={actionLoading === page.id}
                          className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                        >
                          Delete
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

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-[#0A2647]">
                {modal.mode === "create" ? "Create New Page" : `Edit ${modal.page?.title ?? "Page"}`}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                      slug: prev.slug.trim() ? prev.slug : slugify(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  placeholder="e.g., About Us"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  placeholder="about-us"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as "draft" | "published" }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Page"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
