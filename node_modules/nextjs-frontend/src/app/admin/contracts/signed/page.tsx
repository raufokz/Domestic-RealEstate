"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, ApiError } from "@/lib/api";

interface Contract {
  id: number;
  contract_number: string;
  template_name: string | null;
  status: "draft" | "sent" | "signed" | "expired" | "cancelled";
  signed_at: string | null;
  created_at: string;
  template_html?: string | null;
  user?: { id: number; name: string; email: string } | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-800",
  signed: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function SignedContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<{ data: Contract[] }>("/admin/contracts?status=signed");
      setContracts(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      // No silent fallback to fabricated data: surface the real error + retry.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load contracts. Please check the API connection and try again."
      );
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }

  function viewContract(c: Contract) {
    if (!c.template_html) return;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(c.template_html);
      w.document.close();
    }
  }

  return (
    <AdminLayout title="Signed Contracts">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {contracts.length} signed contract{contracts.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={fetchData}
            className="px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            🔄 Refresh
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading contracts...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchData}
              className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && contracts.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No signed contracts</h3>
            <p className="text-gray-500 text-sm">Signed contracts will appear here.</p>
          </div>
        )}

        {!loading && !error && contracts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Contract #</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Template</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Client</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Signed Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-[#0A2647] font-medium">{c.contract_number}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.template_name || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {c.user ? (
                          <>
                            <span className="block">{c.user.name}</span>
                            <span className="block text-xs text-gray-400">{c.user.email}</span>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {c.signed_at ? new Date(c.signed_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${statusColors[c.status] || "bg-gray-100 text-gray-600"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => viewContract(c)}
                          disabled={!c.template_html}
                          className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                          title={c.template_html ? "View contract document" : "No document available"}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
