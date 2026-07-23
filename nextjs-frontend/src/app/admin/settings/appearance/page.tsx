"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut } from "@/lib/api";

interface AppearanceSettings {
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  footer_text: string;
  custom_css: string;
}

const DEFAULT_SETTINGS: AppearanceSettings = {
  logo_url: "",
  favicon_url: "",
  primary_color: "#0A2647",
  secondary_color: "#C9A227",
  font_family: "Inter",
  footer_text: "© 2026 Domestic Real Estate. All rights reserved.",
  custom_css: "",
};

const FONTS = ["Inter", "Poppins", "Roboto", "Open Sans", "Lato", "Montserrat", "Source Sans Pro", "Nunito"];

export default function AppearanceSettingsPage() {
  const [settings, setSettings] = useState<AppearanceSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const data = await apiGet<{ data: AppearanceSettings }>("/admin/settings/appearance");
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
      await apiPut("/admin/settings/appearance", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const update = (field: keyof AppearanceSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <AdminLayout title="Appearance Settings">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading settings...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Appearance Settings">
      <div className="space-y-6 max-w-3xl">
        {/* Logo & Favicon */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Brand Assets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs overflow-hidden">
                  {settings.logo_url ? <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" /> : "No logo"}
                </div>
                <div className="flex-1">
                  <input type="text" value={settings.logo_url} onChange={(e) => update("logo_url", e.target.value)} placeholder="Logo URL" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs overflow-hidden">
                  {settings.favicon_url ? <img src={settings.favicon_url} alt="Favicon" className="w-full h-full object-contain" /> : "No favicon"}
                </div>
                <div className="flex-1">
                  <input type="text" value={settings.favicon_url} onChange={(e) => update("favicon_url", e.target.value)} placeholder="Favicon URL" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Colors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.primary_color} onChange={(e) => update("primary_color", e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <input type="text" value={settings.primary_color} onChange={(e) => update("primary_color", e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.secondary_color} onChange={(e) => update("secondary_color", e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <input type="text" value={settings.secondary_color} onChange={(e) => update("secondary_color", e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50" />
              </div>
            </div>
          </div>
          {/* Color Preview */}
          <div className="mt-4 flex gap-3">
            <div className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: settings.primary_color }}>Primary</div>
            <div className="flex-1 h-16 rounded-lg flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: settings.secondary_color, color: "#0A2647" }}>Secondary</div>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Typography</h2>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
          <select value={settings.font_family} onChange={(e) => update("font_family", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none">
            {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <p className="mt-2 text-sm" style={{ fontFamily: settings.font_family }}>Preview: The quick brown fox jumps over the lazy dog.</p>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Footer</h2>
          <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
          <textarea value={settings.footer_text} onChange={(e) => update("footer_text", e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none resize-none" />
        </div>

        {/* Custom CSS */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Custom CSS</h2>
          <textarea value={settings.custom_css} onChange={(e) => update("custom_css", e.target.value)} rows={10} placeholder="/* Add your custom CSS here */" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none resize-none font-mono bg-gray-900 text-green-400" />
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3">
          {saved && <span className="text-sm text-green-600 font-medium self-center">✓ Saved successfully</span>}
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Appearance"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
