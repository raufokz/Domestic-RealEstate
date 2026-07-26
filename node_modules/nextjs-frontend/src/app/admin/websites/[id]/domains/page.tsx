"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiDelete, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface RawDomain {
  id: number;
  domain: string;
  type: string;
  status: string;
  ssl_issued_at?: string | null;
  created_at: string;
}

interface Domain {
  id: number;
  domain: string;
  status: string;
  ssl_active: boolean;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  verifying: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  active: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-700",
  expired: "bg-red-100 text-red-700",
};

export default function WebsiteDomainsPage() {
  const params = useParams();
  const id = params.id as string;
  const { success, notifyError } = useToast();

  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  function mapDomain(d: RawDomain): Domain {
    return {
      id: d.id,
      domain: d.domain,
      status: d.status,
      ssl_active: !!d.ssl_issued_at,
      created_at: d.created_at,
    };
  }

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      // Reuse the website show endpoint, which returns its domains relation.
      const res = await apiGet<{ data: { domains?: RawDomain[] } }>(`/admin/websites/${id}`);
      setDomains((res.data?.domains || []).map(mapDomain));
    } catch (e) {
      // No silent fallback to fake data.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load domains. Please check the API connection and try again."
      );
      setDomains([]);
    } finally {
      setLoading(false);
    }
  }

  async function addDomain() {
    const value = newDomain.trim().toLowerCase();
    if (!value) return;
    setAdding(true);
    try {
      // Infer type: a subdomain of our platform vs a custom domain.
      const type = value.includes("domesticre") || value.includes("domesticrealestate") ? "subdomain" : "custom";
      await apiPost(`/admin/websites/${id}/domains`, { domain: value, type });
      setNewDomain("");
      success("Domain added.", "Domains");
      await fetchData();
    } catch (e) {
      notifyError(e, "Could not add the domain.");
    } finally {
      setAdding(false);
    }
  }

  async function verifyDomain(domainId: number) {
    setActionLoading(domainId);
    try {
      await apiPost(`/admin/websites/${id}/domains/${domainId}/verify`);
      success("Domain verified.", "Domains");
      await fetchData();
    } catch (e) {
      notifyError(e, "Could not verify the domain.");
    } finally {
      setActionLoading(null);
    }
  }

  async function removeDomain(domainId: number) {
    if (!confirm("Remove this domain?")) return;
    setActionLoading(domainId);
    try {
      await apiDelete(`/admin/websites/${id}/domains/${domainId}`);
      setDomains((prev) => prev.filter((d) => d.id !== domainId));
      success("Domain removed.", "Domains");
    } catch (e) {
      notifyError(e, "Could not remove the domain.");
    } finally {
      setActionLoading(null);
    }
  }

  const isVerified = (s: string) => s === "verified" || s === "active";

  return (
    <AdminLayout title="Website Domains">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/websites" className="hover:text-[#0A2647]">Websites</Link>
          <span>/</span>
          <Link href={`/admin/websites/${id}`} className="hover:text-[#0A2647]">Website {id}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Domains</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#0A2647] mb-3">Add Domain</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addDomain()}
              placeholder="example.com or subdomain.domesticre.com"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
            />
            <button
              onClick={addDomain}
              disabled={!newDomain.trim() || adding}
              className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
            >
              {adding ? "Adding..." : "+ Add Domain"}
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading domains...</span>
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

        {!loading && !error && domains.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No domains configured</h3>
            <p className="text-gray-500 text-sm">Add a domain to make your website accessible.</p>
          </div>
        )}

        {!loading && !error && domains.length > 0 && (
          <div className="space-y-3">
            {domains.map((domain) => (
              <div key={domain.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌐</span>
                    <div>
                      <span className="font-semibold text-gray-900">{domain.domain}</span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[domain.status] || "bg-gray-100 text-gray-600"}`}>{domain.status}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${domain.ssl_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                          SSL: {domain.ssl_active ? "active" : "none"}
                        </span>
                        <span className="text-xs text-gray-400">Added {new Date(domain.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isVerified(domain.status) && (
                      <button
                        onClick={() => verifyDomain(domain.id)}
                        disabled={actionLoading === domain.id}
                        className="px-3 py-1.5 bg-[#0A2647] text-white rounded-lg text-xs font-medium hover:bg-[#0d3366] transition disabled:opacity-50"
                      >
                        {actionLoading === domain.id ? "Verifying…" : "Verify"}
                      </button>
                    )}
                    <button
                      onClick={() => removeDomain(domain.id)}
                      disabled={actionLoading === domain.id}
                      className="px-3 py-1.5 text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                    >
                      Remove
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
