"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface SeoSettings {
  meta_title: string;
  meta_description: string;
  og_image: string;
  canonical_url: string;
  sitemap_enabled: boolean;
  robots_txt: string;
}

const EMPTY_SEO: SeoSettings = {
  meta_title: "",
  meta_description: "",
  og_image: "",
  canonical_url: "",
  sitemap_enabled: true,
  robots_txt: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/",
};

interface WebsiteResponse {
  data: { theme_config?: { seo?: Partial<SeoSettings> } | null };
}

export default function WebsiteSeoPage() {
  const params = useParams();
  const id = params.id as string;
  const { success, notifyError } = useToast();

  const [seo, setSeo] = useState<SeoSettings>(EMPTY_SEO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<WebsiteResponse>(`/admin/websites/${id}/seo`);
      const stored = res.data?.theme_config?.seo || {};
      setSeo({ ...EMPTY_SEO, ...stored });
    } catch (e) {
      // No silent fallback to fake data.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load SEO settings. Please check the API connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await apiPut(`/admin/websites/${id}/seo`, { theme_config: { seo } });
      setSaved(true);
      success("SEO settings saved.", "Websites");
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      notifyError(e, "Could not save SEO settings.");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: string, value: string | boolean) {
    setSeo((prev) => ({ ...prev, [field]: value }));
  }

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (loading) {
    return (
      <AdminLayout title="SEO Settings">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading SEO settings...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="SEO Settings">
        <div className="bg-red-50 border border-red-200 rounded-xl p-16 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load SEO settings</h3>
          <p className="text-red-700 text-sm mb-6">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="SEO Settings">
      <div className="max-w-3xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/websites" className="hover:text-[#0A2647]">Websites</Link>
          <span>/</span>
          <Link href={`/admin/websites/${id}`} className="hover:text-[#0A2647]">Website {id}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">SEO</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-bold text-[#0A2647]">Search Engine Optimization</h3>

          <div>
            <label className={labelClass}>Meta Title</label>
            <input type="text" value={seo.meta_title} onChange={(e) => updateField("meta_title", e.target.value)} className={inputClass} />
            <p className="text-xs text-gray-500 mt-1">{seo.meta_title.length}/60 characters recommended</p>
          </div>

          <div>
            <label className={labelClass}>Meta Description</label>
            <textarea value={seo.meta_description} onChange={(e) => updateField("meta_description", e.target.value)} rows={3} className={inputClass} />
            <p className="text-xs text-gray-500 mt-1">{seo.meta_description.length}/160 characters recommended</p>
          </div>

          <div>
            <label className={labelClass}>OG Image URL</label>
            <input type="text" value={seo.og_image} onChange={(e) => updateField("og_image", e.target.value)} placeholder="https://example.com/og-image.jpg" className={inputClass} />
            <p className="text-xs text-gray-500 mt-1">Recommended: 1200×630px</p>
          </div>

          <div>
            <label className={labelClass}>Canonical URL</label>
            <input type="text" value={seo.canonical_url} onChange={(e) => updateField("canonical_url", e.target.value)} placeholder="https://example.com" className={inputClass} />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Sitemap</p>
              <p className="text-xs text-gray-500">Auto-generate sitemap.xml for search engines</p>
            </div>
            <button
              onClick={() => updateField("sitemap_enabled", !seo.sitemap_enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${seo.sitemap_enabled ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${seo.sitemap_enabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div>
            <label className={labelClass}>Robots.txt</label>
            <textarea value={seo.robots_txt} onChange={(e) => updateField("robots_txt", e.target.value)} rows={6} className={`${inputClass} font-mono text-xs`} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href={`/admin/websites/${id}`} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </Link>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save SEO Settings"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
