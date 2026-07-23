"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface WebsitePage {
  id: number;
  title: string;
  slug: string;
  is_home: boolean;
  updated_at: string;
}

interface WebsiteDomain {
  id: number;
  domain: string;
  type: "subdomain" | "custom";
  verified: boolean;
  dns_records?: { type: string; host: string; value: string }[];
}

interface WebsiteDetail {
  id: number;
  name: string;
  status: "draft" | "building" | "deploying" | "live" | "suspended";
  template: string;
  theme_color: string;
  self_editing: boolean;
  domains: WebsiteDomain[];
  pages: WebsitePage[];
  created_at: string;
}

// Raw API shapes (Website model + relations).
interface RawPage { id: number; title: string; slug: string; is_published?: boolean; updated_at: string }
interface RawDomain { id: number; domain: string; type: "subdomain" | "custom"; status: string; dns_records?: { type: string; name?: string; host?: string; value: string }[] }
interface RawWebsite {
  id: number;
  name: string;
  status: WebsiteDetail["status"];
  template?: string;
  theme_config?: Record<string, unknown> | null;
  self_editing_enabled?: boolean;
  created_at: string;
  pages?: RawPage[];
  domains?: RawDomain[];
}

function mapWebsite(w: RawWebsite): WebsiteDetail {
  const tc = (w.theme_config || {}) as Record<string, unknown>;
  return {
    id: w.id,
    name: w.name,
    status: w.status,
    template: w.template || (typeof tc.template === "string" ? tc.template : "Modern"),
    theme_color: typeof tc.theme_color === "string" ? tc.theme_color : "#0A2647",
    self_editing: !!w.self_editing_enabled,
    created_at: w.created_at,
    pages: (w.pages || []).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      is_home: p.slug === "/" || p.slug === "" || p.slug === "home",
      updated_at: p.updated_at,
    })),
    domains: (w.domains || []).map((d) => ({
      id: d.id,
      domain: d.domain,
      type: d.type,
      verified: d.status === "verified" || d.status === "active",
      dns_records: (d.dns_records || []).map((r) => ({ type: r.type, host: r.host ?? r.name ?? "", value: r.value })),
    })),
  };
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700", dot: "bg-gray-400" },
  building: { label: "Building", color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500" },
  deploying: { label: "Deploying", color: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  live: { label: "Live", color: "bg-green-100 text-green-800", dot: "bg-green-500" },
  suspended: { label: "Suspended", color: "bg-red-100 text-red-800", dot: "bg-red-500" },
};

export default function WebsiteDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { success, notifyError } = useToast();
  const [website, setWebsite] = useState<WebsiteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"pages" | "domains" | "settings" | "analytics">("pages");
  const [actionLoading, setActionLoading] = useState(false);

  // New page form
  const [showNewPage, setShowNewPage] = useState(false);
  const [newPage, setNewPage] = useState({ title: "", slug: "" });

  // New domain form
  const [showNewDomain, setShowNewDomain] = useState(false);
  const [newDomain, setNewDomain] = useState({ domain: "", type: "subdomain" as "subdomain" | "custom" });

  // Settings form
  const [settings, setSettings] = useState({ name: "", template: "", theme_color: "#0A2647", self_editing: false });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchWebsite();
  }, [id]);

  async function fetchWebsite() {
    try {
      setLoading(true);
      setError("");
      setNotFound(false);
      const res = await apiGet<{ data: RawWebsite }>(`/admin/websites/${id}`);
      const mapped = mapWebsite(res.data);
      setWebsite(mapped);
      setSettings({ name: mapped.name, template: mapped.template, theme_color: mapped.theme_color, self_editing: mapped.self_editing });
    } catch (e) {
      // No silent fallback to fake data.
      if (e instanceof ApiError && e.status === 404) {
        setNotFound(true);
      } else {
        setError(e instanceof ApiError ? e.message : "Could not load this website. Please check the API connection and try again.");
      }
      setWebsite(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeploy() {
    try {
      setActionLoading(true);
      await apiPost(`/admin/websites/${id}/deploy`);
      success("Website deployed.", "Websites");
      await fetchWebsite();
    } catch (e) {
      notifyError(e, "Could not deploy the website.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSuspend() {
    try {
      setActionLoading(true);
      await apiPost(`/admin/websites/${id}/suspend`);
      success("Website suspended.", "Websites");
      await fetchWebsite();
    } catch (e) {
      notifyError(e, "Could not suspend the website.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddPage() {
    try {
      const slug = newPage.slug || `/${newPage.title.toLowerCase().replace(/\s+/g, "-")}`;
      await apiPost(`/admin/websites/${id}/pages`, { ...newPage, slug });
      setShowNewPage(false);
      setNewPage({ title: "", slug: "" });
      success("Page added.", "Websites");
      await fetchWebsite();
    } catch (e) {
      notifyError(e, "Could not add the page.");
    }
  }

  async function handleDeletePage(pageId: number) {
    if (!confirm("Delete this page?")) return;
    try {
      await apiDelete(`/admin/websites/${id}/pages/${pageId}`);
      setWebsite((prev) => (prev ? { ...prev, pages: prev.pages.filter((p) => p.id !== pageId) } : prev));
      success("Page deleted.", "Websites");
    } catch (e) {
      notifyError(e, "Could not delete the page.");
    }
  }

  async function handleAddDomain() {
    try {
      await apiPost(`/admin/websites/${id}/domains`, newDomain);
      setShowNewDomain(false);
      setNewDomain({ domain: "", type: "subdomain" });
      success("Domain added.", "Websites");
      await fetchWebsite();
    } catch (e) {
      notifyError(e, "Could not add the domain.");
    }
  }

  async function handleVerifyDns(domainId: number) {
    try {
      await apiPost(`/admin/websites/${id}/domains/${domainId}/verify`);
      success("Domain verified.", "Websites");
      await fetchWebsite();
    } catch (e) {
      notifyError(e, "Could not verify the domain.");
    }
  }

  async function handleSaveSettings() {
    try {
      setSavingSettings(true);
      await apiPut(`/admin/websites/${id}`, {
        name: settings.name,
        template: settings.template,
        self_editing_enabled: settings.self_editing,
        theme_config: { theme_color: settings.theme_color },
      });
      success("Settings saved.", "Websites");
      await fetchWebsite();
    } catch (e) {
      notifyError(e, "Could not save settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Website Detail">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading website...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Website">
        <div className="bg-red-50 border border-red-200 rounded-xl p-16 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load website</h3>
          <p className="text-red-700 text-sm mb-6">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={fetchWebsite} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">Retry</button>
            <Link href="/admin/websites" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Back to Websites</Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (notFound || !website) {
    return (
      <AdminLayout title="Website Not Found">
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <div className="text-4xl mb-4">❓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Website not found</h3>
          <Link href="/admin/websites" className="mt-4 inline-block px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
            Back to Websites
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const sc = statusConfig[website.status];

  return (
    <AdminLayout title={website.name}>
      <div className="space-y-6">
        {/* Breadcrumb + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/admin/websites" className="hover:text-[#0A2647]">Websites</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{website.name}</span>
          </div>
          <div className="flex gap-3">
            {website.status !== "live" && (
              <button
                onClick={handleDeploy}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                Deploy
              </button>
            )}
            {website.status === "live" && (
              <button
                onClick={handleSuspend}
                disabled={actionLoading}
                className="px-4 py-2 border border-yellow-400 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-50 transition disabled:opacity-50"
              >
                Suspend
              </button>
            )}
            <span className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-full font-medium ${sc.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>
          </div>
        </div>

        {/* Status Progress */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            {["draft", "building", "deploying", "live"].map((step, idx) => {
              const steps = ["draft", "building", "deploying", "live"];
              const currentIdx = steps.indexOf(website.status);
              const isCompleted = idx <= currentIdx || website.status === "suspended";
              const isCurrent = steps[currentIdx] === step && website.status !== "suspended";
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted ? "bg-[#C9A227] text-[#0A2647]" : "bg-gray-200 text-gray-500"
                    } ${isCurrent ? "ring-2 ring-[#C9A227] ring-offset-2" : ""}`}>
                      {isCompleted && !isCurrent ? "✓" : idx + 1}
                    </div>
                    <span className={`text-xs mt-1 capitalize ${isCurrent ? "text-[#0A2647] font-semibold" : "text-gray-500"}`}>{step}</span>
                  </div>
                  {idx < 3 && <div className={`flex-1 h-0.5 mx-2 ${idx < currentIdx ? "bg-[#C9A227]" : "bg-gray-200"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {(["pages", "domains", "settings", "analytics"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? "border-[#C9A227] text-[#0A2647]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Pages Tab */}
        {activeTab === "pages" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewPage(true)}
                className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition"
              >
                + Add Page
              </button>
            </div>

            {website.pages.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-16 text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pages yet</h3>
                <p className="text-gray-500 text-sm">Add your first page to get started.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0A2647] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Page</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Last Updated</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {website.pages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{page.title}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{page.slug}</td>
                        <td className="px-4 py-3">
                          {page.is_home ? (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-[#C9A227]/20 text-[#0A2647] font-medium">Home</span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">Page</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(page.updated_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3 text-sm">
                            <button className="text-[#C9A227] hover:text-[#0A2647] font-medium">Edit</button>
                            {!page.is_home && (
                              <button onClick={() => handleDeletePage(page.id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Domains Tab */}
        {activeTab === "domains" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewDomain(true)}
                className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition"
              >
                + Add Domain
              </button>
            </div>

            {website.domains.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-16 text-center">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No domains configured</h3>
                <p className="text-gray-500 text-sm">Add a domain to make your website accessible.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {website.domains.map((domain) => (
                  <div key={domain.id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{domain.domain}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${domain.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {domain.verified ? "Verified" : "Unverified"}
                          </span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 capitalize">{domain.type}</span>
                        </div>
                      </div>
                      {!domain.verified && (
                        <button
                          onClick={() => handleVerifyDns(domain.id)}
                          className="px-4 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-medium hover:bg-[#0d3366] transition"
                        >
                          Verify DNS
                        </button>
                      )}
                    </div>

                    {domain.dns_records && domain.dns_records.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">DNS Records</p>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-gray-500">
                                <th className="text-left pb-2">Type</th>
                                <th className="text-left pb-2">Host</th>
                                <th className="text-left pb-2">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {domain.dns_records.map((rec, idx) => (
                                <tr key={idx} className="border-t border-gray-200">
                                  <td className="py-2 font-mono text-xs">{rec.type}</td>
                                  <td className="py-2 font-mono text-xs">{rec.host}</td>
                                  <td className="py-2 font-mono text-xs text-gray-600">{rec.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#0A2647] mb-6">Website Settings</h3>
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                <select
                  value={settings.template}
                  onChange={(e) => setSettings((prev) => ({ ...prev, template: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                >
                  <option value="Modern">Modern</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Showcase">Showcase</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Vacation">Vacation</option>
                  <option value="Minimal">Minimal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.theme_color}
                    onChange={(e) => setSettings((prev) => ({ ...prev, theme_color: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.theme_color}
                    onChange={(e) => setSettings((prev) => ({ ...prev, theme_color: e.target.value }))}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#C9A227] outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Self-Editing Mode</p>
                  <p className="text-xs text-gray-500">Allow the owner to edit their own website content</p>
                </div>
                <button
                  onClick={() => setSettings((prev) => ({ ...prev, self_editing: !prev.self_editing }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.self_editing ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.self_editing ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
              >
                {savingSettings ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#0A2647] mb-4">Website Analytics</h3>
            <p className="text-sm text-gray-500 mb-6">Connect Google Analytics or Facebook Pixel in Integrations to see data here.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Page Views", value: "—" },
                { label: "Unique Visitors", value: "—" },
                { label: "Avg. Duration", value: "—" },
                { label: "Bounce Rate", value: "—" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-[#0A2647]">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Page Modal */}
        {showNewPage && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0A2647]">Add Page</h3>
                  <button onClick={() => setShowNewPage(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                  <input
                    type="text"
                    value={newPage.title}
                    onChange={(e) => setNewPage((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Our Services"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (optional)</label>
                  <input
                    type="text"
                    value={newPage.slug}
                    onChange={(e) => setNewPage((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="/services (auto-generated if empty)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setShowNewPage(false)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleAddPage}
                  disabled={!newPage.title}
                  className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
                >
                  Add Page
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Domain Modal */}
        {showNewDomain && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0A2647]">Add Domain</h3>
                  <button onClick={() => setShowNewDomain(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain Type</label>
                  <select
                    value={newDomain.type}
                    onChange={(e) => setNewDomain((prev) => ({ ...prev, type: e.target.value as "subdomain" | "custom" }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  >
                    <option value="subdomain">Subdomain (*.domesticre.com)</option>
                    <option value="custom">Custom Domain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newDomain.type === "subdomain" ? "Subdomain" : "Domain Name"}
                  </label>
                  <div className="flex items-center gap-0">
                    <input
                      type="text"
                      value={newDomain.domain}
                      onChange={(e) => setNewDomain((prev) => ({ ...prev, domain: e.target.value }))}
                      placeholder={newDomain.type === "subdomain" ? "mysite" : "example.com"}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-l-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                    />
                    {newDomain.type === "subdomain" && (
                      <span className="px-3 py-2.5 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600">.domesticre.com</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setShowNewDomain(false)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleAddDomain}
                  disabled={!newDomain.domain}
                  className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
                >
                  Add Domain
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
