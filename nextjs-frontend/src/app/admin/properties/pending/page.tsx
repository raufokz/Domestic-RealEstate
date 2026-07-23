"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface RawProperty {
  id: number;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number | string;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  created_at: string;
  photos?: string[] | null;
  property_type?: { name: string } | null;
  realtor?: { name: string } | null;
}

interface PendingProperty {
  id: number;
  title: string;
  address: string;
  price: number;
  type: string;
  agent: string;
  beds: number;
  baths: number;
  sqft: number;
  submitted: string;
  images: number;
}

function mapProperty(p: RawProperty): PendingProperty {
  return {
    id: p.id,
    title: p.title,
    address: [p.address, p.city, p.state].filter(Boolean).join(", "),
    price: Number(p.price) || 0,
    type: p.property_type?.name || "—",
    agent: p.realtor?.name || "—",
    beds: p.bedrooms ?? 0,
    baths: p.bathrooms ?? 0,
    sqft: p.sqft ?? 0,
    submitted: p.created_at,
    images: Array.isArray(p.photos) ? p.photos.length : 0,
  };
}

export default function PendingPropertiesPage() {
  const { success, notifyError } = useToast();
  const [properties, setProperties] = useState<PendingProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [rejectModal, setRejectModal] = useState<number | null>(null);

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    try {
      setLoading(true);
      setError("");
      // Admin properties list, filtered to pending approval (returns a paginator).
      const res = await apiGet<{ data: RawProperty[] }>("/admin/properties?status=pending");
      setProperties((res.data || []).map(mapProperty));
      setSelected([]);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load pending properties. Please check the API connection and try again."
      );
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }

  async function setApproval(ids: number[], approval_status: "approved" | "rejected") {
    if (ids.length === 0) return;
    try {
      setBusy(true);
      await Promise.all(
        ids.map((id) => apiPost(`/admin/properties/${id}/approval`, { approval_status }))
      );
      success(`Property ${approval_status} (${ids.length}).`, "Properties");
      setPreviewId(null);
      setRejectModal(null);
      await fetchPending();
    } catch (e) {
      notifyError(e, `Could not ${approval_status === "approved" ? "approve" : "reject"} the property.`);
    } finally {
      setBusy(false);
    }
  }

  const toggleSelect = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const previewProp = properties.find((p) => p.id === previewId);

  return (
    <AdminLayout title="Pending Property Approvals">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            {loading ? "Loading…" : `${properties.length} property${properties.length !== 1 ? "ies" : "y"} awaiting approval`}
          </p>
          <div className="flex gap-2">
            {selected.length > 0 && (
              <>
                <button onClick={() => setApproval(selected, "approved")} disabled={busy} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50">
                  Approve Selected ({selected.length})
                </button>
                <button onClick={() => setApproval(selected, "rejected")} disabled={busy} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50">
                  Reject Selected
                </button>
              </>
            )}
            <button onClick={fetchPending} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              ↻ Refresh
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading pending properties...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button onClick={fetchPending} className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending properties</h3>
            <p className="text-gray-500 text-sm">All submitted properties have been reviewed.</p>
          </div>
        )}

        {!loading && !error && properties.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selected.length === properties.length && properties.length > 0}
                        onChange={() => setSelected(selected.length === properties.length ? [] : properties.map((p) => p.id))}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Property</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Agent</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Submitted</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {properties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(prop.id)} onChange={() => toggleSelect(prop.id)} className="rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 text-sm">{prop.title}</p>
                        <p className="text-slate-500 text-xs">{prop.address}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#0A2647] text-sm">${prop.price.toLocaleString()}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">{prop.type}</span></td>
                      <td className="px-4 py-3 text-sm text-slate-600">{prop.agent}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{new Date(prop.submitted).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setPreviewId(prop.id)} className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 transition">Preview</button>
                          <button onClick={() => setApproval([prop.id], "approved")} disabled={busy} className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50">Approve</button>
                          <button onClick={() => setRejectModal(prop.id)} disabled={busy} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50">Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {previewProp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-100 rounded-t-xl flex items-center justify-center">
              <span className="text-slate-400 text-sm">{previewProp.images} photo{previewProp.images !== 1 ? "s" : ""}</span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#0A2647]">{previewProp.title}</h3>
                  <p className="text-slate-500">{previewProp.address}</p>
                </div>
                <button onClick={() => setPreviewId(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Price</p>
                  <p className="font-bold text-[#0A2647]">${previewProp.price.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Beds/Baths</p>
                  <p className="font-bold text-[#0A2647]">{previewProp.beds}bd / {previewProp.baths}ba</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Sqft</p>
                  <p className="font-bold text-[#0A2647]">{previewProp.sqft.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Agent</p>
                  <p className="font-bold text-[#0A2647] text-sm">{previewProp.agent}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPreviewId(null)} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Close</button>
                <button onClick={() => setApproval([previewProp.id], "approved")} disabled={busy} className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 disabled:opacity-50">Approve</button>
                <button onClick={() => { setRejectModal(previewProp.id); setPreviewId(null); }} disabled={busy} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50">Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-[#0A2647] mb-2">Reject Property</h3>
            <p className="text-sm text-gray-500 mb-4">This will set the property&apos;s approval status to rejected.</p>
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={() => setApproval([rejectModal], "rejected")} disabled={busy} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                {busy ? "Rejecting…" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
