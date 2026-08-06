"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

interface Template {
  id: number;
  name: string;
  category: string;
  platform: string | null;
  content_template: string;
  variables: string[];
}

const categories = [
  { value: "listing", label: "Listing" },
  { value: "blog", label: "Blog" },
  { value: "testimonial", label: "Testimonial" },
  { value: "market_report", label: "Market Report" },
  { value: "tip", label: "Tip" },
  { value: "event", label: "Event" },
  { value: "open_house", label: "Open House" },
  { value: "general", label: "General" },
];

const platformOptions = [
  { value: "all", label: "All Platforms" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "youtube", label: "YouTube" },
];

function extractVariables(text: string): string[] {
  const matches = text.match(/\{(\w+)\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace(/[{}]/g, "")))];
}

export default function SocialTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "general", platform: "all", content: "" });
  const [editId, setEditId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const res = await apiGet<Template[]>("/social/templates");
      setTemplates(Array.isArray(res) ? res : []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    const variables = extractVariables(formData.content);
    const payload = { name: formData.name, category: formData.category, platform: formData.platform, content_template: formData.content, variables };
    if (editId) {
      try {
        await apiPut(`/social/templates/${editId}`, payload);
      } catch {
        setShowForm(false);
        return;
      }
      setTemplates((prev) =>
        prev.map((t) => (t.id === editId ? { ...t, ...payload } : t))
      );
    } else {
      try {
        const res = await apiPost<Template>("/social/templates", payload);
        if (res) setTemplates((prev) => [...prev, res]);
      } catch {
        setShowForm(false);
        return;
      }
    }
    resetForm();
  }

  function resetForm() {
    setFormData({ name: "", category: "general", platform: "all", content: "" });
    setEditId(null);
    setShowForm(false);
  }

  function startEdit(template: Template) {
    setFormData({
      name: template.name,
      category: template.category,
      platform: template.platform ?? "all",
      content: template.content_template,
    });
    setEditId(template.id);
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    try {
      await apiDelete(`/social/templates/${id}`);
    } catch {
      return;
    }
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  const filtered = filterCategory === "all" ? templates : templates.filter((t) => t.category === filterCategory);

  if (loading) {
    return (
      <AdminLayout title="Post Templates">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Post Templates">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition-colors"
        >
          + Create Template
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-sm font-semibold text-[#0A2647] mb-4">
            {editId ? "Edit Template" : "Create Template"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Template name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData((p) => ({ ...p, platform: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              >
                {platformOptions.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Content <span className="text-gray-400">(use {"{variable_name}"} for dynamic values)</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
              placeholder="Write your template content. Use {property_price}, {property_city}, etc. for variables."
              rows={5}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />
            {formData.content && extractVariables(formData.content).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-xs text-gray-500">Variables:</span>
                {extractVariables(formData.content).map((v) => (
                  <span key={v} className="px-2 py-0.5 bg-[#0A2647]/10 text-[#0A2647] text-xs rounded-full">
                    {`{${v}}`}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!formData.name.trim() || !formData.content.trim()}
              className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition-colors disabled:opacity-50"
            >
              {editId ? "Update" : "Create"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Templates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Platform</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Variables</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 text-xs rounded-full bg-[#0A2647]/10 text-[#0A2647] font-medium">
                    {categories.find((c) => c.value === t.category)?.label || t.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {platformOptions.find((p) => p.value === (t.platform ?? "all"))?.label || t.platform || "All Platforms"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {t.variables.map((v) => (
                      <span key={v} className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded">
                        {`{${v}}`}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => startEdit(t)}
                      className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                  No templates found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
