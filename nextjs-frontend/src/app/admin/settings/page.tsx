"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut } from "@/lib/api";
import { useToast } from "@/components/Toast";

const tabs = ["General", "Design", "SEO", "Analytics", "Social"];

export default function SettingsPage() {
  const { success, notifyError } = useToast();
  const [activeTab, setActiveTab] = useState("General");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Domestic Real Estate",
    tagline: "Your Trusted Partner in Finding the Perfect Home",
    email: "info@domesticrealestate.us",
    phone: "(555) 123-4567",
    address: "123 Real Estate Blvd, Los Angeles, CA 90001",
    primaryColor: "#0A2647",
    accentColor: "#C9A227",
    metaTitle: "Domestic Real Estate - Find Your Dream Home",
    metaDescription: "Leading real estate agency specializing in luxury homes, condos, and investment properties in California.",
    metaKeywords: "real estate, homes for sale, luxury properties, California real estate",
    googleAnalyticsId: "G-XXXXXXXXXX",
    facebookPixelId: "",
    instagramUrl: "https://instagram.com/domesticre",
    twitterUrl: "https://twitter.com/domesticre",
    linkedinUrl: "https://linkedin.com/company/domesticre",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const data = await apiGet<Record<string, string>>("/admin/settings");
      if (data) {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      notifyError(err, "Settings could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await apiPut("/admin/settings", settings);
      success("Settings saved successfully.", "Settings");
    } catch (err) {
      notifyError(err, "Settings could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AdminLayout title="Site Settings">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "border-[#C9A227] text-[#0A2647]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === "General" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                <input type="text" value={settings.siteName} onChange={(e) => updateSetting("siteName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input type="text" value={settings.tagline} onChange={(e) => updateSetting("tagline", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={settings.email} onChange={(e) => updateSetting("email", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={settings.phone} onChange={(e) => updateSetting("phone", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea value={settings.address} onChange={(e) => updateSetting("address", e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
              </div>
            </div>
          )}

          {/* Design Tab */}
          {activeTab === "Design" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.primaryColor} onChange={(e) => updateSetting("primaryColor", e.target.value)} className="w-12 h-10 rounded border border-gray-300 cursor-pointer" />
                  <input type="text" value={settings.primaryColor} onChange={(e) => updateSetting("primaryColor", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.accentColor} onChange={(e) => updateSetting("accentColor", e.target.value)} className="w-12 h-10 rounded border border-gray-300 cursor-pointer" />
                  <input type="text" value={settings.accentColor} onChange={(e) => updateSetting("accentColor", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] font-mono" />
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                <div className="flex gap-3">
                  <div className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: settings.primaryColor }}>Primary</div>
                  <div className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: settings.accentColor, color: settings.primaryColor }}>Accent</div>
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === "SEO" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input type="text" value={settings.metaTitle} onChange={(e) => updateSetting("metaTitle", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
                <p className="mt-1 text-sm text-gray-500">{settings.metaTitle.length}/60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea value={settings.metaDescription} onChange={(e) => updateSetting("metaDescription", e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
                <p className="mt-1 text-sm text-gray-500">{settings.metaDescription.length}/160 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                <textarea value={settings.metaKeywords} onChange={(e) => updateSetting("metaKeywords", e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "Analytics" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
                <input type="text" value={settings.googleAnalyticsId} onChange={(e) => updateSetting("googleAnalyticsId", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Pixel ID</label>
                <input type="text" value={settings.facebookPixelId} onChange={(e) => updateSetting("facebookPixelId", e.target.value)} placeholder="Enter Facebook Pixel ID" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] font-mono" />
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === "Social" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                <input type="url" value={settings.instagramUrl} onChange={(e) => updateSetting("instagramUrl", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
                <input type="url" value={settings.twitterUrl} onChange={(e) => updateSetting("twitterUrl", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input type="url" value={settings.linkedinUrl} onChange={(e) => updateSetting("linkedinUrl", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button 
              onClick={handleSave}
              disabled={saving || loading}
              className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
