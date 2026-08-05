"use client";

import { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiPost, API_BASE } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { useToast } from "@/components/Toast";

interface PayoutClaim {
  id: number;
  lead: { id: number; marketplace_title?: string | null; lead_number?: string } | null;
  user?: { id: number; name?: string; email?: string } | null;
  commission_amount: string | number;
  payout_method: string | null;
  payout_email: string | null;
  payout_status: "pending" | "processing" | "paid" | "failed" | "cancelled";
  closing_date: string | null;
  claimed_at: string | null;
}

interface PaginatedResponse<T> {
  data: T[];
}

const STATUS_META: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pending Closing", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  processing: { label: "Processing", classes: "bg-blue-50 text-blue-700 border-blue-200" },
  paid: { label: "Paid", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  failed: { label: "Failed", classes: "bg-red-50 text-red-600 border-red-200" },
  cancelled: { label: "Cancelled", classes: "bg-slate-100 text-slate-500 border-slate-200" },
};

function readAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export default function AdminPayoutsPage() {
  const { success, notifyError } = useToast();
  const { data, loading, error, refetch } = useFetch<PaginatedResponse<PayoutClaim>>("/admin/marketplace/payouts?per_page=100");
  const [busy, setBusy] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  const claims = data?.data || [];

  async function approve(claim: PayoutClaim) {
    if (busy) return;
    if (!confirm(`Approve payout of $${claim.commission_amount} to ${claim.user?.name || "this agent"} via Payoneer?`)) return;
    setBusy(claim.id);
    try {
      await apiPost(`/admin/marketplace/payouts/${claim.id}/status`, { payout_status: "paid" });
      success("Payout submitted to Payoneer — now processing.");
      refetch();
    } catch (e) {
      notifyError(e, "Could not approve this payout.");
    } finally {
      setBusy(null);
    }
  }

  async function cancel(claim: PayoutClaim) {
    if (busy) return;
    setBusy(claim.id);
    try {
      await apiPost(`/admin/marketplace/payouts/${claim.id}/status`, { payout_status: "cancelled" });
      success("Payout cancelled.");
      refetch();
    } catch (e) {
      notifyError(e, "Could not cancel this payout.");
    } finally {
      setBusy(null);
    }
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const token = readAuthToken();
      const res = await fetch(`${API_BASE}/admin/marketplace/payouts/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Export failed.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payouts-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      notifyError(e, "Could not export payouts.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <AdminLayout title="Pay-at-Closing Payouts">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#0A2647]">Commission payouts</h2>
            <p className="text-sm text-slate-500">Approve real Payoneer payouts to agents for closed Pay-at-Closing leads.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={exportCsv} disabled={exporting} className="text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50 disabled:opacity-50">
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
            <Link href="/admin/marketplace" className="text-sm font-semibold text-[#C9A227] hover:text-[#0A2647] transition self-center">
              ← Back to Marketplace
            </Link>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>}

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading payouts…</div>
          ) : claims.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">No Pay-at-Closing claims yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Agent</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Lead</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Commission</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Payout Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {claims.map((c) => {
                    const meta = STATUS_META[c.payout_status] || STATUS_META.pending;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <p className="text-slate-700">{c.user?.name || "—"}</p>
                          <p className="text-xs text-slate-400">{c.user?.email || ""}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{c.lead?.marketplace_title || c.lead?.lead_number || "—"}</td>
                        <td className="px-4 py-3 font-bold text-[#0A2647]">${Number(c.commission_amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{c.payout_email || <span className="text-red-500">Not set</span>}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${meta.classes}`}>{meta.label}</span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {c.payout_status === "pending" && (
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => approve(c)}
                                disabled={busy === c.id || !c.payout_email}
                                title={!c.payout_email ? "Agent has not set a payout email yet" : undefined}
                                className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition disabled:opacity-40"
                              >
                                Approve Payout
                              </button>
                              <button
                                onClick={() => cancel(c)}
                                disabled={busy === c.id}
                                className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {c.payout_status !== "pending" && <span className="text-xs text-slate-300">—</span>}
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
    </AdminLayout>
  );
}
