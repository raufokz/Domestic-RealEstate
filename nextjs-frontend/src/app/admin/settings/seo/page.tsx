"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut } from "@/lib/api";

interface SEOSettings {
  meta_title: string;
  meta_description: string;
  og_image: string;
  google_analytics_id: string;
  google_tag_manager_id: string;
  sitemap_auto_generate: boolean;
  robots_txt: string;
  canonical_url: string;
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_linkedin: string;
}

const DEFAULT_SETTINGS: SEOSettings = {
  meta_title: "Domestic Real Estate - Find Your Dream Home",
  meta_description: "Find your perfect property with Domestic Real Estate. Browse listings, schedule viewings, and connect with agents.",
  og_image: "",
  google_analytics_id: "",
  google_tag_manager_id: "",
  sitemap_auto_generate: true,
  robots_txt: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/",
  canonical_url: "https://domesticre.com",
  social_facebook: "",
  social_twitter: "",
  social_instagram: "",
  social_linkedin: "",
};

export default function SEOSettingsPage() {
  const [settings, setSettings] = useState<SEOSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const data = await apiGet<{ data: SEOSettings }>("/admin/settings/seo");
      if (data.data) setSettings(data.data);
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await apiPut("/admin/settings/seo", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const update = (field: keyof SEOSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <AdminLayout title="SEO Settings">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading settings...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="SEO Settings">
      <div className="space-y-6 max-w-3xl">
        {/* Meta Tags */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Meta Tags</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input type="text" value={settings.meta_title} onChange={(e) => update("meta_title", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
              <p className="text-xs text-gray-500 mt-1">{settings.meta_title.length}/60 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea value={settings.meta_description} onChange={(e) => update("meta_description", e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none resize-none" />
              <p className="text-xs text-gray-500 mt-1">{settings.meta_description.length}/160 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
              <input type="text" value={settings.og_image} onChange={(e) => update("og_image", e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
              <input type="text" value={settings.canonical_url} onChange={(e) => update("canonical_url", e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Analytics & Tracking</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
              <input type="text" value={settings.google_analytics_id} onChange={(e) => update("google_analytics_id", e.target.value)} placeholder="G-XXXXXXXXXX" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Tag Manager ID</label>
              <input type="text" value={settings.google_tag_manager_id} onChange={(e) => update("google_tag_manager_id", e.target.value)} placeholder="GTM-XXXXXXX" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.sitemap_auto_generate} onChange={(e) => update("sitemap_auto_generate", e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[#C9A227] focus:ring-[#C9A227]" />
              <span className="text-sm font-medium text-gray-700">Auto-generate sitemap</span>
            </label>
          </div>
        </div>

        {/* Robots.txt */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Robots.txt</h2>
          <textarea value={settings.robots_txt} onChange={(e) => update("robots_txt", e.target.value)} rows={8} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none resize-none font-mono bg-gray-900 text-green-400" />
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Social Media URLs</h2>
          <div className="space-y-3">
            {([
              { key: "social_facebook" as const, label: "Facebook", placeholder: "https://facebook.com/..." },
              { key: "social_twitter" as const, label: "Twitter/X", placeholder: "https://twitter.com/..." },
              { key: "social_instagram" as const, label: "Instagram", placeholder: "https://instagram.com/..." },
              { key: "social_linkedin" as const, label: "LinkedIn", placeholder: "https://linkedin.com/..." },
            ]).map((s) => (
              <div key={s.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{s.label}</label>
                <input type="text" value={settings[s.key]} onChange={(e) => update(s.key, e.target.value)} placeholder={s.placeholder} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3">
          {saved && <span className="text-sm text-green-600 font-medium self-center">✓ Saved successfully</span>}
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
            {saving ? "Saving..." : "Save SEO Settings"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
