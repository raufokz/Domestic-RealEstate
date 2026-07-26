"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface WebsiteSettings {
  name: string;
  description: string;
  logo_url: string;
  domain: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  analytics_id: string;
  facebook_pixel: string;
}

const EMPTY_SETTINGS: WebsiteSettings = {
  name: "",
  description: "",
  logo_url: "",
  domain: "",
  meta_title: "",
  meta_description: "",
  og_image: "",
  analytics_id: "",
  facebook_pixel: "",
};

interface WebsiteResponse {
  data: {
    name?: string;
    theme_config?: Record<string, string> | null;
    domains?: { domain: string }[] | null;
  };
}

export default function WebsiteSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { success, notifyError } = useToast();

  const [activeTab, setActiveTab] = useState<"general" | "domain" | "seo" | "analytics">("general");
  const [settings, setSettings] = useState<WebsiteSettings>(EMPTY_SETTINGS);
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
      const res = await apiGet<WebsiteResponse>(`/admin/websites/${id}/settings`);
      const w = res.data || {};
      const tc = w.theme_config || {};
      setSettings({
        name: w.name || "",
        description: tc.description || "",
        logo_url: tc.logo_url || "",
        domain: w.domains && w.domains.length > 0 ? w.domains[0].domain : "",
        meta_title: tc.meta_title || "",
        meta_description: tc.meta_description || "",
        og_image: tc.og_image || "",
        analytics_id: tc.analytics_id || "",
        facebook_pixel: tc.facebook_pixel || "",
      });
    } catch (e) {
      // No silent fallback to fake data.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load website settings. Please check the API connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await apiPut(`/admin/websites/${id}/settings`, {
        name: settings.name,
        theme_config: {
          description: settings.description,
          logo_url: settings.logo_url,
          meta_title: settings.meta_title,
          meta_description: settings.meta_description,
          og_image: settings.og_image,
          analytics_id: settings.analytics_id,
          facebook_pixel: settings.facebook_pixel,
        },
      });
      setSaved(true);
      success("Settings saved.", "Websites");
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      notifyError(e, "Could not save website settings.");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof WebsiteSettings, value: string) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const tabs = [
    { key: "general", label: "General", icon: "⚙️" },
    { key: "domain", label: "Domain", icon: "🌐" },
    { key: "seo", label: "SEO", icon: "🔍" },
    { key: "analytics", label: "Analytics", icon: "📈" },
  ] as const;

  if (loading) {
    return (
      <AdminLayout title="Website Settings">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading settings...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Website Settings">
        <div className="bg-red-50 border border-red-200 rounded-xl p-16 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load settings</h3>
          <p className="text-red-700 text-sm mb-6">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Website Settings">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/websites" className="hover:text-[#0A2647]">Websites</Link>
          <span>/</span>
          <Link href={`/admin/websites/${id}`} className="hover:text-[#0A2647]">Website {id}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Settings</span>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key ? "border-[#C9A227] text-[#0A2647]" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "general" && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#0A2647] mb-4">General Settings</h3>
            <div>
              <label className={labelClass}>Website Name</label>
              <input type="text" value={settings.name} onChange={(e) => updateField("name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea value={settings.description} onChange={(e) => updateField("description", e.target.value)} rows={3} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Logo URL</label>
              <input type="text" value={settings.logo_url} onChange={(e) => updateField("logo_url", e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
          </div>
        )}

        {activeTab === "domain" && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#0A2647] mb-4">Domain Settings</h3>
            <div>
              <label className={labelClass}>Primary Domain</label>
              <input type="text" value={settings.domain || "No domain connected"} readOnly className={`${inputClass} bg-slate-50 text-gray-500`} />
              <p className="text-xs text-gray-500 mt-1">Manage domains and DNS on the <Link href={`/admin/websites/${id}/domains`} className="text-[#C9A227] hover:underline">Domains</Link> page.</p>
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#0A2647] mb-4">SEO Settings</h3>
            <div>
              <label className={labelClass}>Meta Title</label>
              <input type="text" value={settings.meta_title} onChange={(e) => updateField("meta_title", e.target.value)} className={inputClass} />
              <p className="text-xs text-gray-500 mt-1">{settings.meta_title.length}/60 characters</p>
            </div>
            <div>
              <label className={labelClass}>Meta Description</label>
              <textarea value={settings.meta_description} onChange={(e) => updateField("meta_description", e.target.value)} rows={3} className={inputClass} />
              <p className="text-xs text-gray-500 mt-1">{settings.meta_description.length}/160 characters</p>
            </div>
            <div>
              <label className={labelClass}>OG Image URL</label>
              <input type="text" value={settings.og_image} onChange={(e) => updateField("og_image", e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
            <p className="text-xs text-gray-500">
              For sitemap, canonical URL and robots.txt, use the dedicated{" "}
              <Link href={`/admin/websites/${id}/seo`} className="text-[#C9A227] hover:underline">SEO page</Link>.
            </p>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#0A2647] mb-4">Analytics Settings</h3>
            <div>
              <label className={labelClass}>Google Analytics ID</label>
              <input type="text" value={settings.analytics_id} onChange={(e) => updateField("analytics_id", e.target.value)} placeholder="G-XXXXXXX" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Facebook Pixel ID</label>
              <input type="text" value={settings.facebook_pixel} onChange={(e) => updateField("facebook_pixel", e.target.value)} placeholder="1234567890" className={inputClass} />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={() => router.back()} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
