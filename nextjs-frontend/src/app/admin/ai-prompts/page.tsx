"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Prompt {
  id: number;
  name: string;
  category: string;
  model: string;
  tokens: number;
  last_used: string | null;
  status: "active" | "inactive";
  content: string;
}

const CATEGORIES = [
  { value: "content", label: "Content" },
  { value: "leads", label: "Leads" },
  { value: "support", label: "Support" },
  { value: "marketing", label: "Marketing" },
];

const categoryColors: Record<string, string> = {
  content: "bg-green-100 text-green-800",
  leads: "bg-blue-100 text-blue-800",
  support: "bg-purple-100 text-purple-800",
  marketing: "bg-yellow-100 text-yellow-800",
};

export default function AIPromptsPage() {
  const { success, notifyError } = useToast();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [showPreview, setShowPreview] = useState<Prompt | null>(null);
  const [form, setForm] = useState({ name: "", category: "content", model: "gemini-1.5-flash", content: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPrompts(); }, []);

  async function fetchPrompts() {
    try {
      setLoading(true);
      const data = await apiGet<{ data: Prompt[] }>("/admin/ai-prompts");
      setPrompts(data.data || []);
    } catch {
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", category: "content", model: "gemini-1.5-flash", content: "" });
    setShowModal(true);
  }

  function openEdit(p: Prompt) {
    setEditing(p);
    setForm({ name: p.name, category: p.category, model: p.model, content: p.content });
    setShowModal(true);
  }

  async function handleSave() {
    try {
      setSaving(true);
      if (editing) {
        await apiPut(`/admin/ai-prompts/${editing.id}`, form);
        success("Prompt updated.", "AI");
      } else {
        await apiPost("/admin/ai-prompts", form);
        success("Prompt created.", "AI");
      }
      await fetchPrompts();
      setShowModal(false);
    } catch (err) {
      notifyError(err, "Prompt could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this prompt?")) return;
    try {
      await apiDelete(`/admin/ai-prompts/${id}`);
      success("Prompt deleted.", "AI");
      await fetchPrompts();
    } catch (err) {
      notifyError(err, "Prompt could not be deleted.");
    }
  }

  async function handleToggleStatus(p: Prompt) {
    const newStatus = p.status === "active" ? "inactive" : "active";
    try {
      await apiPut(`/admin/ai-prompts/${p.id}`, { status: newStatus });
      success(`Prompt ${newStatus}.`, "AI");
      await fetchPrompts();
    } catch (err) {
      notifyError(err, "Prompt status update failed.");
    }
  }

  return (
    <AdminLayout title="AI Prompts">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{prompts.length} prompt{prompts.length !== 1 ? "s" : ""}</p>
          <button onClick={openCreate} className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            + Create Prompt
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading prompts...</span>
          </div>
        )}

        {!loading && prompts.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No prompts yet</h3>
            <p className="text-gray-500 text-sm mb-6">Create prompt templates to power your AI agents.</p>
            <button onClick={openCreate} className="px-6 py-3 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
              Create Prompt
            </button>
          </div>
        )}

        {!loading && prompts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Prompt Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Model</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tokens</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Last Used</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {prompts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[p.category] || "bg-gray-100 text-gray-700"}`}>{p.category}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.model}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.tokens}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.last_used ? new Date(p.last_used).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleStatus(p)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${p.status === "active" ? "bg-green-500" : "bg-gray-300"}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${p.status === "active" ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setShowPreview(p)} className="text-sm text-gray-500 hover:text-gray-700 font-medium">Preview</button>
                          <button onClick={() => openEdit(p)} className="text-sm text-[#C9A227] hover:text-[#0A2647] font-medium">Edit</button>
                          <button onClick={() => handleDelete(p.id)} className="text-sm text-red-600 font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0A2647]">{editing ? "Edit Prompt" : "Create Prompt"}</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Property Description Template" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none">
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <select value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none">
                      <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                      <option value="gpt-4o">gpt-4o</option>
                      <option value="gpt-4o-mini">gpt-4o-mini</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Content</label>
                  <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} placeholder="Write your prompt template here..." rows={8} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none resize-none font-mono" />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={!form.name || !form.content || saving} className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update Prompt" : "Create Prompt"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0A2647]">{showPreview.name}</h3>
                  <button onClick={() => setShowPreview(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[showPreview.category] || "bg-gray-100 text-gray-700"}`}>{showPreview.category}</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{showPreview.model}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono">{showPreview.content}</div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button onClick={() => setShowPreview(null)} className="px-4 py-2.5 bg-[#0A2647] text-white rounded-lg text-sm font-semibold hover:bg-[#0A2647]/90">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
