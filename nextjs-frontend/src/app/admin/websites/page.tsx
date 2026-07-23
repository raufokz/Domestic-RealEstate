"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiDelete, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Website {
  id: number;
  name: string;
  owner: string;
  status: "draft" | "building" | "deploying" | "live" | "suspended";
  domain?: string;
  created_at: string;
  template?: string;
}

// Raw shape returned by the API (Website model with relations).
interface RawWebsite {
  id: number;
  name: string;
  status: Website["status"];
  template?: string;
  created_at: string;
  user?: { name?: string } | null;
  domains?: { domain: string; status?: string }[] | null;
}

function normalizeWebsite(w: RawWebsite): Website {
  return {
    id: w.id,
    name: w.name,
    owner: w.user?.name || "—",
    status: w.status,
    domain: w.domains && w.domains.length > 0 ? w.domains[0].domain : undefined,
    created_at: w.created_at,
    template: w.template,
  };
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700", dot: "bg-gray-400" },
  building: { label: "Building", color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500" },
  deploying: { label: "Deploying", color: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  live: { label: "Live", color: "bg-green-100 text-green-800", dot: "bg-green-500" },
  suspended: { label: "Suspended", color: "bg-red-100 text-red-800", dot: "bg-red-500" },
};

export default function WebsitesPage() {
  const { success, notifyError } = useToast();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newSite, setNewSite] = useState({ name: "", template: "Modern" });
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchWebsites();
  }, []);

  async function fetchWebsites() {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet<{ data: RawWebsite[] }>("/admin/websites");
      setWebsites((data.data || []).map(normalizeWebsite));
    } catch (e) {
      // No silent fallback to fake data.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load websites. Please check the API connection and try again."
      );
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      setCreating(true);
      await apiPost("/admin/websites", newSite);
      setShowCreate(false);
      setNewSite({ name: "", template: "Modern" });
      success("Website created.", "Websites");
      await fetchWebsites();
    } catch (e) {
      notifyError(e, "Could not create the website.");
    } finally {
      setCreating(false);
    }
  }

  async function handleAction(websiteId: number, action: string) {
    try {
      setActionLoading(websiteId);
      if (action === "deploy") {
        await apiPost(`/admin/websites/${websiteId}/deploy`);
        success("Website deployed.", "Websites");
      } else if (action === "suspend") {
        await apiPost(`/admin/websites/${websiteId}/suspend`);
        success("Website suspended.", "Websites");
      } else if (action === "duplicate") {
        await apiPost(`/admin/websites/${websiteId}/duplicate`);
        success("Website duplicated.", "Websites");
      } else if (action === "delete") {
        if (!confirm("Delete this website? This cannot be undone.")) {
          setActionLoading(null);
          return;
        }
        await apiDelete(`/admin/websites/${websiteId}`);
        success("Website deleted.", "Websites");
      }
      await fetchWebsites(); // reflect real persisted state
    } catch (e) {
      // No fake local mutations on failure.
      notifyError(e, `Could not ${action} the website.`);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <AdminLayout title="Website Builder">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{websites.length} website{websites.length !== 1 ? "s" : ""}</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition"
          >
            + Create Website
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading websites...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button onClick={fetchWebsites} className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && websites.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No websites yet</h3>
            <p className="text-gray-500 text-sm mb-6">Create your first website to get started.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition"
            >
              Create Website
            </button>
          </div>
        )}

        {/* Websites Table */}
        {!loading && websites.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Website</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Owner</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Domain</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {websites.map((site) => {
                    const sc = statusConfig[site.status];
                    return (
                      <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/admin/websites/${site.id}`} className="font-medium text-[#0A2647] hover:text-[#C9A227]">
                            {site.name}
                          </Link>
                          {site.template && (
                            <p className="text-xs text-gray-500 mt-0.5">{site.template} template</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{site.owner}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium ${sc.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {site.domain ? (
                            <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer" className="text-[#C9A227] hover:underline">
                              {site.domain}
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(site.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Link href={`/admin/websites/${site.id}`} className="text-[#C9A227] hover:text-[#0A2647] font-medium">
                              Edit
                            </Link>
                            <button
                              onClick={() => handleAction(site.id, "duplicate")}
                              disabled={actionLoading === site.id}
                              className="text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50"
                            >
                              Duplicate
                            </button>
                            {site.status !== "live" && (
                              <button
                                onClick={() => handleAction(site.id, "deploy")}
                                disabled={actionLoading === site.id}
                                className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                              >
                                Deploy
                              </button>
                            )}
                            {site.status === "live" && (
                              <button
                                onClick={() => handleAction(site.id, "suspend")}
                                disabled={actionLoading === site.id}
                                className="text-yellow-600 hover:text-yellow-800 font-medium disabled:opacity-50"
                              >
                                Suspend
                              </button>
                            )}
                            <button
                              onClick={() => handleAction(site.id, "delete")}
                              disabled={actionLoading === site.id}
                              className="text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0A2647]">Create Website</h3>
                  <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website Name</label>
                  <input
                    type="text"
                    value={newSite.name}
                    onChange={(e) => setNewSite((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., My Realty Site"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                  <select
                    value={newSite.template}
                    onChange={(e) => setNewSite((prev) => ({ ...prev, template: e.target.value }))}
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
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newSite.name || creating}
                  className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
