"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Contract {
  id: number;
  contract_number: string;
  template_name: string;
  status: string;
  signed_at?: string;
  expires_at?: string;
  user_id: number;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600",
    sent: "bg-amber-100 text-amber-700",
    signed: "bg-green-100 text-green-700",
    expired: "bg-red-100 text-red-600",
    cancelled: "bg-slate-100 text-slate-500 line-through",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}

export default function AdminContractsPage() {
  const { success, notifyError } = useToast();
  const [error, setError] = useState("");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<number | null>(null);

  useEffect(() => { loadContracts(); }, []);

  async function loadContracts() {
    setLoading(true);
    try {
      const data = await apiGet<Contract[]>("/admin/contracts");
      setContracts(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load contracts. Please try again.");
      setContracts([]);
    }
    setLoading(false);
  }

  async function sendContract(id: number) {
    setSending(id);
    try {
      await apiPost(`/admin/contracts/${id}/send`);
      setContracts((cs) => cs.map((c) => c.id === id ? { ...c, status: "sent" } : c));
      success("Contract sent.");
    } catch (e) {
      // Do not mark the contract as sent when the request failed.
      notifyError(e, "Could not send this contract. Please try again.");
    } finally {
      setSending(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">Contracts</h1>
          <p className="text-slate-500 text-sm mt-1">Manage contracts and e-signature requests.</p>
        </div>
        <button onClick={loadContracts} className="px-4 py-2 text-sm font-medium text-navy border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl p-5 shadow-card animate-pulse h-20" />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={loadContracts}
            className="mt-3 px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold hover:opacity-90"
          >
            Retry
          </button>
        </div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-card text-center">
          <p className="text-slate-500">No contracts yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-4 font-semibold text-navy">Contract #</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Template</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Status</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Expires</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Signed</th>
                  <th className="text-right px-5 py-4 font-semibold text-navy">Action</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-medium text-navy">{c.contract_number}</td>
                    <td className="px-5 py-4 text-slate-600">{c.template_name}</td>
                    <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {c.signed_at ? new Date(c.signed_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {c.status === "draft" && (
                        <button
                          onClick={() => sendContract(c.id)}
                          disabled={sending === c.id}
                          className="text-xs font-semibold text-gold hover:text-gold-600 transition-colors disabled:opacity-50"
                        >
                          {sending === c.id ? "Sending..." : "Send to Client"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
