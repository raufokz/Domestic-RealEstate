"use client";

import { useCallback, useState } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { useFetch } from "@/hooks/useFetch";
import { apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";
import Link from "next/link";

interface Property {
  id: number;
  title: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  price: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  status: string;
  approval_status: string;
  featured: boolean;
  view_count: number;
  created_at: string;
}

const STATUS_TABS = ["All", "Active", "Pending", "Draft", "Sold"];

const statusColor = (s: string) => {
  switch (s) {
    case "active":
    case "approved":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "draft":
      return "bg-slate-100 text-slate-600";
    case "sold":
      return "bg-blue-100 text-blue-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export default function AgentPropertiesPage() {
  const { data, loading, error, refetch } = useFetch<{ data: Property[]; meta?: { total: number } }>("/agent/properties?per_page=50");
  const { success, notifyError } = useToast();
  const [activeTab, setActiveTab] = useState("All");
  const [busyId, setBusyId] = useState<number | null>(null);

  const properties = data?.data || [];

  const filtered =
    activeTab === "All"
      ? properties
      : properties.filter(
          (p) => p.approval_status === activeTab.toLowerCase() || p.status === activeTab.toLowerCase()
        );

  const duplicate = useCallback(
    async (prop: Property) => {
      setBusyId(prop.id);
      try {
        const res = await apiPost<{ message: string }>(`/agent/properties/${prop.id}/duplicate`);
        success(res.message);
        refetch();
      } catch (e) {
        notifyError(e, "Could not duplicate this listing.");
      } finally {
        setBusyId(null);
      }
    },
    [success, notifyError, refetch]
  );

  const submitForApproval = useCallback(
    async (prop: Property) => {
      setBusyId(prop.id);
      try {
        const res = await apiPost<{ message: string }>(`/agent/properties/${prop.id}/submit`);
        success(res.message);
        refetch();
      } catch (e) {
        notifyError(e, "Could not submit this listing for approval.");
      } finally {
        setBusyId(null);
      }
    },
    [success, notifyError, refetch]
  );

  return (
    <AgentLayout title="My Properties" subtitle="Manage your property listings">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === tab ? "border-[#C9A227] text-[#0A2647]" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/agent/dashboard/properties/import" className="bg-slate-100 text-[#0A2647] border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition flex items-center gap-2 w-fit">
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Properties
            </Link>
            <Link href="/agent/dashboard/properties/new" className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition flex items-center gap-2 w-fit">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Property
            </Link>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">{error}</div>
        ) : loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">Loading properties...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-slate-500 font-medium">No properties found</p>
            <p className="text-slate-400 text-sm mt-1">Start by adding your first listing</p>
            <Link href="/agent/dashboard/properties/new" className="inline-block mt-4 px-6 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
              Add Property
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Property</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Details</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Views</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((prop) => {
                    const busy = busyId === prop.id;
                    return (
                      <tr key={prop.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{prop.title}</p>
                            <p className="text-slate-500 text-xs">
                              {[prop.address, prop.city, prop.state].filter(Boolean).join(", ") || "—"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#0A2647] text-sm">
                          {prop.price ? `$${prop.price.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {prop.bedrooms} bd / {prop.bathrooms} ba{prop.square_feet ? ` / ${prop.square_feet.toLocaleString()} sqft` : ""}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor(prop.approval_status || prop.status)}`}>
                            {prop.approval_status || prop.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{prop.view_count || 0}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <Link href={`/agent/dashboard/properties/edit/${prop.id}`} className="text-sm text-[#C9A227] hover:text-[#0A2647] font-medium">
                              Edit
                            </Link>
                            {prop.slug && (
                              <Link href={`/properties/${prop.slug}`} target="_blank" className="text-sm text-slate-500 hover:text-slate-700 font-medium">
                                View
                              </Link>
                            )}
                            {prop.approval_status !== "approved" && (
                              <button
                                onClick={() => submitForApproval(prop)}
                                disabled={busy}
                                className="text-sm text-emerald-600 hover:text-emerald-800 font-medium disabled:opacity-50"
                              >
                                {busy ? "..." : "Submit"}
                              </button>
                            )}
                            <button
                              onClick={() => duplicate(prop)}
                              disabled={busy}
                              className="text-sm text-slate-500 hover:text-slate-800 font-medium disabled:opacity-50"
                            >
                              {busy ? "..." : "Duplicate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {data?.meta?.total ? (
              <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500">{data.meta.total} total listings</div>
            ) : null}
          </div>
        )}
      </div>
    </AgentLayout>
  );
}
