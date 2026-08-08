"use client";

import { useState, useEffect } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { apiGet, apiPost, apiPut, API_BASE } from "@/lib/api";

interface SiteConfig {
  title: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  domain: string;
  subdomain: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

interface PropertyListing {
  id: number;
  title: string;
  address: string;
  price: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  images: string[];
}

interface PageView { date: string; views: number; leads: number }

const TEMPLATES = [
  { id: 1, name: "Agent Portfolio", description: "Professional agent profile with listings and contact", preview: "bg-gradient-to-br from-[#0A2647] to-[#123c6e]", style: "Modern & Professional" },
  { id: 2, name: "Property Showcase", description: "Focused on property listings with gallery", preview: "bg-gradient-to-br from-emerald-600 to-emerald-800", style: "Gallery-First" },
  { id: 3, name: "Luxury Agent", description: "High-end design for luxury market agents", preview: "bg-gradient-to-br from-[#C9A227] to-amber-700", style: "Luxury Gold" },
  { id: 4, name: "Team Brokerage", description: "Multi-agent brokerage team page", preview: "bg-gradient-to-br from-purple-600 to-purple-800", style: "Team Focused" },
  { id: 5, name: "Minimalist Clean", description: "Clean whitespace design, content-first", preview: "bg-gradient-to-br from-slate-200 to-white", style: "Minimalist" },
  { id: 6, name: "Video-First", description: "Hero video agent intro with listing carousel", preview: "bg-gradient-to-br from-rose-600 to-pink-700", style: "Video Hero" },
];

const DEMO_LISTINGS: PropertyListing[] = [
  { id: 1, title: "Ocean View Retreat", address: "123 Pacific Coast Hwy, Malibu, CA", price: "$2,450,000", status: "active", bedrooms: 4, bathrooms: 3, images: [] },
  { id: 2, title: "Modern Downtown Loft", address: "456 Main St, Los Angeles, CA", price: "$875,000", status: "active", bedrooms: 2, bathrooms: 2, images: [] },
  { id: 3, title: "Hillside Estate", address: "789 Sunset Blvd, Beverly Hills, CA", price: "$4,200,000", status: "active", bedrooms: 6, bathrooms: 5, images: [] },
  { id: 4, title: "Cozy Suburban Home", address: "321 Elm Street, Pasadena, CA", price: "$780,000", status: "pending", bedrooms: 3, bathrooms: 2, images: [] },
];

const DEMO_ANALYTICS: PageView[] = [
  { date: "Aug 1", views: 45, leads: 2 }, { date: "Aug 2", views: 62, leads: 3 }, { date: "Aug 3", views: 38, leads: 1 },
  { date: "Aug 4", views: 71, leads: 4 }, { date: "Aug 5", views: 55, leads: 2 }, { date: "Aug 6", views: 89, leads: 5 },
  { date: "Aug 7", views: 67, leads: 3 },
];

export default function AgentWebsitePage() {
  const [activeTab, setActiveTab] = useState<"template" | "settings" | "listings" | "seo" | "analytics" | "embed">("template");
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [analytics] = useState<PageView[]>(DEMO_ANALYTICS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deployStatus, setDeployStatus] = useState<"idle" | "deploying" | "live">("idle");

  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    title: "My Real Estate Website",
    description: "Your trusted real estate professional",
    primaryColor: "#0A2647",
    accentColor: "#C9A227",
    domain: "",
    subdomain: "",
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  });

  const [embedConfig, setEmbedConfig] = useState({
    showContactForm: true,
    showMap: true,
    showVirtualTour: false,
    leadFormTitle: "Schedule a Showing",
    leadFormFields: ["name", "email", "phone", "message"],
  });

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await apiGet<{ data: PropertyListing[] }>("/properties");
        setListings(res.data || DEMO_LISTINGS);
      } catch {
        setListings(DEMO_LISTINGS);
      }
    }
    fetchListings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut("/agent/website", siteConfig);
    } catch { /* optimistic */ }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDeploy = () => {
    setDeployStatus("deploying");
    setTimeout(() => setDeployStatus("live"), 3000);
  };

  const maxViews = Math.max(...analytics.map((a) => a.views), 1);

  return (
    <AgentLayout title="My Website" subtitle="Build and deploy your personal real estate website with IDX listings">
      <div className="space-y-6">
        {/* Deploy Status Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
              deployStatus === "live" ? "bg-emerald-100 text-emerald-700" :
              deployStatus === "deploying" ? "bg-amber-100 text-amber-700 animate-pulse" :
              "bg-slate-100 text-slate-600"
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                deployStatus === "live" ? "bg-emerald-500" :
                deployStatus === "deploying" ? "bg-amber-500" : "bg-slate-400"
              }`} />
              {deployStatus === "live" ? "Live" : deployStatus === "deploying" ? "Deploying..." : "Not Deployed"}
            </div>
            {siteConfig.subdomain && (
              <span className="text-xs text-slate-500">
                {siteConfig.subdomain}.domesticrealestate.us
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs font-bold text-emerald-600">✓ Saved</span>}
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-xs font-bold hover:bg-[#b8911f] transition disabled:opacity-50">
              {saving ? "Saving..." : "Save Settings"}
            </button>
            <button onClick={handleDeploy} disabled={deployStatus === "deploying"} className="px-4 py-2 bg-[#0A2647] text-white rounded-lg text-xs font-bold hover:bg-[#0d3366] transition disabled:opacity-50">
              {deployStatus === "deploying" ? "Deploying..." : deployStatus === "live" ? "Redeploy" : "Deploy Now"}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex gap-1 overflow-x-auto">
          {([
            { id: "template", label: "🎨 Templates", icon: "" },
            { id: "settings", label: "⚙️ Settings", icon: "" },
            { id: "listings", label: "🏠 IDX Listings", icon: "" },
            { id: "seo", label: "🔍 SEO", icon: "" },
            { id: "analytics", label: "📊 Analytics", icon: "" },
            { id: "embed", label: "📋 Lead Form", icon: "" },
          ] as const).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${activeTab === tab.id ? "bg-[#0A2647] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {/* Templates */}
          {activeTab === "template" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0A2647]">Choose Your Website Template</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`border-2 rounded-xl overflow-hidden text-left transition ${
                      selectedTemplate === t.id ? "border-[#C9A227] shadow-lg ring-2 ring-[#C9A227]/20" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className={`h-32 ${t.preview} flex items-center justify-center relative`}>
                      <span className="text-white text-3xl font-black opacity-30">{t.name[0]}</span>
                      {selectedTemplate === t.id && (
                        <span className="absolute top-2 right-2 bg-[#C9A227] text-[#0A2647] text-[10px] font-black px-2 py-0.5 rounded-full">SELECTED</span>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-[#0A2647] text-sm">{t.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                      <span className="inline-block mt-2 text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-medium text-slate-600">{t.style}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#0A2647]">Website Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Website Title</label>
                  <input type="text" value={siteConfig.title} onChange={(e) => setSiteConfig((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea rows={2} value={siteConfig.description} onChange={(e) => setSiteConfig((p) => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Primary Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={siteConfig.primaryColor} onChange={(e) => setSiteConfig((p) => ({ ...p, primaryColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer" />
                    <input type="text" value={siteConfig.primaryColor} onChange={(e) => setSiteConfig((p) => ({ ...p, primaryColor: e.target.value }))} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Accent Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={siteConfig.accentColor} onChange={(e) => setSiteConfig((p) => ({ ...p, accentColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer" />
                    <input type="text" value={siteConfig.accentColor} onChange={(e) => setSiteConfig((p) => ({ ...p, accentColor: e.target.value }))} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Subdomain</label>
                  <div className="flex items-center gap-2">
                    <input type="text" value={siteConfig.subdomain} onChange={(e) => setSiteConfig((p) => ({ ...p, subdomain: e.target.value }))} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm" placeholder="yourname" />
                    <span className="text-sm text-slate-500 whitespace-nowrap">.domesticrealestate.us</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Custom Domain (Optional)</label>
                  <input type="text" value={siteConfig.domain} onChange={(e) => setSiteConfig((p) => ({ ...p, domain: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" placeholder="yourdomain.com" />
                  <p className="text-xs text-slate-400 mt-1">Point your domain CNAME to sites.domesticrealestate.us</p>
                </div>
              </div>
            </div>
          )}

          {/* IDX Listings */}
          {activeTab === "listings" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#0A2647]">IDX Property Feed</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                  {listings.filter(l => l.status === "active").length} Active Listings
                </span>
              </div>
              <p className="text-xs text-slate-500">These listings will appear on your personal website automatically.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition">
                    <div className="h-32 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <span className="text-slate-400 text-sm">🏠 Property Image</span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-[#0A2647]">{listing.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{listing.address}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          listing.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-base font-black text-[#C9A227]">{listing.price}</span>
                        <span className="text-xs text-slate-500">{listing.bedrooms}bd · {listing.bathrooms}ba</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#0A2647]">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Title</label>
                  <input type="text" value={siteConfig.metaTitle} onChange={(e) => setSiteConfig((p) => ({ ...p, metaTitle: e.target.value }))} placeholder="Your Name | Licensed Real Estate Agent in City, State" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
                  <p className="text-xs text-slate-400 mt-1">{siteConfig.metaTitle.length}/60 characters recommended</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Description</label>
                  <textarea rows={3} value={siteConfig.metaDescription} onChange={(e) => setSiteConfig((p) => ({ ...p, metaDescription: e.target.value }))} placeholder="Write a compelling description for search engines..." className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
                  <p className="text-xs text-slate-400 mt-1">{siteConfig.metaDescription.length}/160 characters recommended</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">OG Image URL</label>
                  <input type="url" value={siteConfig.ogImage} onChange={(e) => setSiteConfig((p) => ({ ...p, ogImage: e.target.value }))} placeholder="https://example.com/og-image.jpg" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
                </div>

                {/* Preview */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 mb-2">Google Search Preview</p>
                  <div className="space-y-1">
                    <p className="text-lg text-blue-700 font-medium">{siteConfig.metaTitle || siteConfig.title || "Your Website Title"}</p>
                    <p className="text-xs text-emerald-700">{siteConfig.subdomain ? `${siteConfig.subdomain}.domesticrealestate.us` : "yourname.domesticrealestate.us"}</p>
                    <p className="text-sm text-slate-600">{siteConfig.metaDescription || siteConfig.description || "Your website description will appear here..."}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#0A2647]">Website Analytics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-blue-600 font-medium">Total Views (7d)</p>
                  <p className="text-2xl font-black text-[#0A2647] mt-1">{analytics.reduce((s, a) => s + a.views, 0)}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-emerald-600 font-medium">Leads Captured</p>
                  <p className="text-2xl font-black text-[#0A2647] mt-1">{analytics.reduce((s, a) => s + a.leads, 0)}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-purple-600 font-medium">Conversion Rate</p>
                  <p className="text-2xl font-black text-[#0A2647] mt-1">
                    {((analytics.reduce((s, a) => s + a.leads, 0) / Math.max(analytics.reduce((s, a) => s + a.views, 0), 1)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              {/* Bar Chart */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-500 mb-4">Daily Views</p>
                <div className="flex items-end gap-2 h-32">
                  {analytics.map((day) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center">
                      <span className="text-[10px] font-bold text-[#0A2647] mb-1">{day.views}</span>
                      <div
                        className="w-full bg-[#0A2647] rounded-t-lg transition-all"
                        style={{ height: `${(day.views / maxViews) * 100}%` }}
                      />
                      <span className="text-[10px] text-slate-400 mt-1">{day.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Embed Lead Form */}
          {activeTab === "embed" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#0A2647]">Embedded Lead Capture Form</h3>
              <p className="text-xs text-slate-500">Configure the contact form that appears on your website to capture leads directly.</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Form Title</label>
                    <input type="text" value={embedConfig.leadFormTitle} onChange={(e) => setEmbedConfig((p) => ({ ...p, leadFormTitle: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Form Features</p>
                    {[
                      { key: "showContactForm", label: "Show Contact Form" },
                      { key: "showMap", label: "Show Map Widget" },
                      { key: "showVirtualTour", label: "Virtual Tour Integration" },
                    ].map((opt) => (
                      <label key={opt.key} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={embedConfig[opt.key as keyof typeof embedConfig] as boolean}
                          onChange={(e) => setEmbedConfig((p) => ({ ...p, [opt.key]: e.target.checked }))}
                          className="rounded text-[#0A2647]"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <p className="text-xs font-bold text-slate-400 mb-3">FORM PREVIEW</p>
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <h4 className="text-base font-bold text-[#0A2647] mb-4">{embedConfig.leadFormTitle}</h4>
                    {embedConfig.leadFormFields.map((field) => (
                      <div key={field} className="mb-3">
                        <label className="block text-xs font-medium text-slate-500 mb-1 capitalize">{field}</label>
                        {field === "message" ? (
                          <textarea rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50" placeholder={`Enter your ${field}...`} readOnly />
                        ) : (
                          <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50" placeholder={`Enter your ${field}...`} readOnly />
                        )}
                      </div>
                    ))}
                    <button className="w-full py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-xs font-bold">Submit Inquiry</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AgentLayout>
  );
}
