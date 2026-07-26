"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiDelete, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface PageTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  last_used?: string;
  thumbnail?: string;
}

const categoryColors: Record<string, string> = {
  Properties: "bg-blue-100 text-blue-800",
  Agents: "bg-purple-100 text-purple-800",
  General: "bg-gray-100 text-gray-700",
  Blog: "bg-green-100 text-green-800",
  Marketing: "bg-[#C9A227]/20 text-[#0A2647]",
};

export default function PageTemplatesPage() {
  const { success, notifyError } = useToast();
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<{ data: PageTemplate[] }>("/admin/page-templates");
      setTemplates(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      // No silent fallback to fabricated data: surface the real error + retry.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load page templates. Please check the API connection and try again."
      );
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }

  async function useTemplate(id: number) {
    setActionLoading(id);
    try {
      await apiPost(`/admin/page-templates/${id}/use`);
      success("Template applied.");
    } catch (e) {
      notifyError(e, "Could not apply this template. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteTemplate(id: number) {
    if (!confirm("Delete this template?")) return;
    setActionLoading(id);
    try {
      await apiDelete(`/admin/page-templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      success("Template deleted.");
    } catch (e) {
      // Do not remove the row locally when the server delete failed.
      notifyError(e, "Could not delete this template. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <AdminLayout title="Page Templates">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{templates.length} templates available</p>
          <button onClick={fetchData} className="px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
            🔄 Refresh
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading templates...</span>
          </div>
        )}

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

        {!loading && !error && templates.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates yet</h3>
            <p className="text-gray-500 text-sm">Templates will appear here once created.</p>
          </div>
        )}

        {!loading && !error && templates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                {/* Preview */}
                <div className="h-40 bg-gradient-to-br from-[#0A2647]/10 to-[#C9A227]/10 flex items-center justify-center relative">
                  <span className="text-5xl opacity-30">📄</span>
                  <div className="absolute inset-0 bg-[#0A2647]/0 group-hover:bg-[#0A2647]/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="px-4 py-2 bg-white/90 rounded-lg text-sm font-medium text-[#0A2647] shadow-lg">Preview</span>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{tpl.name}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[tpl.category] || "bg-gray-100 text-gray-600"}`}>
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{tpl.description}</p>
                  {tpl.last_used && (
                    <p className="text-xs text-gray-400 mb-3">Last used: {new Date(tpl.last_used).toLocaleDateString()}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => useTemplate(tpl.id)}
                      disabled={actionLoading === tpl.id}
                      className="flex-1 px-3 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-xs font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
                    >
                      Use Template
                    </button>
                    <button
                      onClick={() => deleteTemplate(tpl.id)}
                      disabled={actionLoading === tpl.id}
                      className="px-3 py-2 border border-gray-200 text-red-500 rounded-lg text-xs font-medium hover:bg-red-50 transition disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
