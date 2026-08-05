"use client";

import { useState } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { apiPut } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { useToast } from "@/components/Toast";

interface PayAtClosingClaim {
  id: number;
  lead: { id: number; marketplace_title?: string | null; lead_number?: string } | null;
  commission_amount: number;
  payout_method: string | null;
  payout_email: string | null;
  payout_status: "pending" | "processing" | "paid" | "failed" | "cancelled";
  closing_date: string | null;
  claimed_at: string | null;
}

const STATUS_META: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pending Closing", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  processing: { label: "Processing via Payoneer", classes: "bg-blue-50 text-blue-700 border-blue-200" },
  paid: { label: "Paid", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  failed: { label: "Failed", classes: "bg-red-50 text-red-600 border-red-200" },
  cancelled: { label: "Cancelled", classes: "bg-slate-100 text-slate-500 border-slate-200" },
};

export default function PayAtClosingPage() {
  const { success, notifyError } = useToast();
  const { data, loading, error, refetch } = useFetch<{ data: PayAtClosingClaim[] }>("/agent/pay-at-closing");
  const claims = data?.data || [];

  const [editingId, setEditingId] = useState<number | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const totalPending = claims.filter((c) => c.payout_status === "pending" || c.payout_status === "processing").reduce((sum, c) => sum + c.commission_amount, 0);
  const totalPaid = claims.filter((c) => c.payout_status === "paid").reduce((sum, c) => sum + c.commission_amount, 0);

  function startEdit(claim: PayAtClosingClaim) {
    setEditingId(claim.id);
    setEmailDraft(claim.payout_email || "");
  }

  async function savePayoutEmail(claimId: number) {
    if (!emailDraft.trim()) return;
    setSaving(true);
    try {
      await apiPut(`/agent/leads/${claimId}/payout-email`, { payout_email: emailDraft });
      success("Payout email saved.");
      setEditingId(null);
      refetch();
    } catch (e) {
      notifyError(e, "Could not save payout email.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AgentLayout title="Pay-at-Closing Earnings" subtitle="Commissions owed to you for leads claimed on a pay-at-closing basis">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending / Processing</p>
            <p className="text-2xl font-extrabold text-[#0A2647] mt-1">${totalPending.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Paid</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">${totalPaid.toLocaleString()}</p>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>}

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading claims…</div>
          ) : claims.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              No Pay-at-Closing claims yet. Claim a lead from the{" "}
              <a href="/marketplace" className="text-[#C9A227] font-semibold hover:underline">Marketplace</a> to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Lead</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Commission</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Payout Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Claimed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {claims.map((c) => {
                    const meta = STATUS_META[c.payout_status] || STATUS_META.pending;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0A2647]">{c.lead?.marketplace_title || c.lead?.lead_number || `Lead #${c.lead?.id}`}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#0A2647]">${c.commission_amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${meta.classes}`}>{meta.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          {editingId === c.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="email"
                                value={emailDraft}
                                onChange={(e) => setEmailDraft(e.target.value)}
                                placeholder="you@payoneer.example.com"
                                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs w-48"
                              />
                              <button
                                onClick={() => savePayoutEmail(c.id)}
                                disabled={saving}
                                className="text-xs font-bold text-white bg-[#0A2647] px-2.5 py-1.5 rounded-lg disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-slate-600">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600 text-xs">{c.payout_email || "Not set"}</span>
                              {c.payout_status !== "paid" && (
                                <button onClick={() => startEdit(c)} className="text-xs font-semibold text-[#C9A227] hover:text-[#0A2647]">
                                  {c.payout_email ? "Edit" : "Add"}
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {c.claimed_at ? new Date(c.claimed_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AgentLayout>
  );
}
