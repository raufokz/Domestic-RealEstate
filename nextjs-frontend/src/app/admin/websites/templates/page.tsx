"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface WebsiteTemplate {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  thumbnail?: string;
  is_premium: boolean;
}

const categoryColors: Record<string, string> = {
  real_estate: "bg-blue-100 text-blue-800",
  agency: "bg-green-100 text-green-800",
  portfolio: "bg-purple-100 text-purple-800",
  landing: "bg-yellow-100 text-yellow-800",
};

export default function WebsiteTemplatesPage() {
  const router = useRouter();
  const { success, notifyError } = useToast();
  const [templates, setTemplates] = useState<WebsiteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<{ data: WebsiteTemplate[] }>("/admin/website-templates");
      setTemplates(data.data || []);
    } catch (e) {
      // No silent fallback to fake data.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load website templates. Please check the API connection and try again."
      );
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }

  async function useTemplate(tpl: WebsiteTemplate) {
    setActionLoading(tpl.id);
    try {
      // Create a new website from this template, then open the builder.
      const res = await apiPost<{ data: { id: number } }>("/admin/websites", {
        name: `${tpl.name} Site`,
        template: tpl.slug,
      });
      success("Website created from template.", "Templates");
      const newId = res?.data?.id;
      if (newId) {
        router.push(`/admin/websites/${newId}`);
      }
    } catch (e) {
      notifyError(e, "Could not create a website from this template.");
    } finally {
      setActionLoading(null);
    }
  }

  async function cloneTemplate(id: number) {
    setActionLoading(id);
    try {
      // Real endpoint is /duplicate.
      await apiPost(`/admin/website-templates/${id}/duplicate`);
      success("Template duplicated.", "Templates");
      await fetchData();
    } catch (e) {
      notifyError(e, "Could not duplicate the template.");
    } finally {
      setActionLoading(null);
    }
  }

  const categories = ["all", ...Array.from(new Set(templates.map((t) => t.category)))];
  const filtered = filter === "all" ? templates : templates.filter((t) => t.category === filter);

  return (
    <AdminLayout title="Website Templates">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {loading ? "Loading…" : `${templates.length} templates available`}
          </p>
          <button onClick={fetchData} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            Refresh
          </button>
        </div>

        {/* Filters */}
        {!loading && !error && templates.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === cat
                    ? "bg-[#0A2647] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading templates...</span>
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

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 text-sm">
              {templates.length === 0 ? "No templates have been created yet." : "No templates match this category."}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((tpl) => (
              <div key={tpl.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                {/* Thumbnail */}
                <div className="h-44 bg-gradient-to-br from-[#0A2647]/10 via-[#C9A227]/5 to-[#8B1E3F]/5 flex items-center justify-center relative">
                  {tpl.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tpl.thumbnail} alt={tpl.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl opacity-20">🌐</span>
                  )}
                  {tpl.is_premium && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#C9A227] text-[#0A2647] text-xs rounded-full font-bold">Premium</span>
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{tpl.name}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${categoryColors[tpl.category] || "bg-gray-100 text-gray-600"}`}>
                      {tpl.category?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{tpl.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => useTemplate(tpl)}
                      disabled={actionLoading === tpl.id}
                      className="flex-1 px-3 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-xs font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
                    >
                      {actionLoading === tpl.id ? "Working…" : "Use Template"}
                    </button>
                    <button
                      onClick={() => cloneTemplate(tpl.id)}
                      disabled={actionLoading === tpl.id}
                      className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Clone
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
