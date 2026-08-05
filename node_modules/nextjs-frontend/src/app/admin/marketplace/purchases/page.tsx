"use client";

import { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { useToast } from "@/components/Toast";

interface PurchaseRecord {
  id: number;
  lead_id: number;
  user_id: number;
  amount: string;
  status: string;
  payment_gateway: string | null;
  gateway_checkout_id: string | null;
  reserved_at: string | null;
  expires_at: string | null;
  purchased_at: string | null;
  refunded_at: string | null;
  notes: string | null;
  created_at: string;
  user?: { id: number; name?: string; email?: string } | null;
  lead?: {
    id: number;
    lead_number: string;
    marketplace_title?: string | null;
    first_name?: string | null;
    full_name?: string;
  } | null;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

const STATUS_META: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  paid: { label: "Paid", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  refunded: { label: "Refunded", classes: "bg-red-50 text-red-600 border-red-200" },
  cancelled: { label: "Cancelled", classes: "bg-slate-100 text-slate-500 border-slate-200" },
};

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminMarketplacePurchasesPage() {
  const { success, notifyError } = useToast();
  const { data, loading, error, refetch } = useFetch<PaginatedResponse<PurchaseRecord>>(
    "/admin/marketplace/purchases?per_page=50"
  );
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<PurchaseRecord | null>(null);
  const [reference, setReference] = useState("");

  const purchases = data?.data || [];

  async function act(path: string, message: string, body?: Record<string, unknown>) {
    if (busy) return;
    setBusy(true);
    try {
      await apiPost(path, body);
      success(message);
      refetch();
    } catch (e) {
      notifyError(e, "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmBankTransfer() {
    if (!confirming || !reference.trim()) return;
    setBusy(true);
    try {
      await apiPost(`/admin/marketplace/purchases/${confirming.id}/confirm`, { reference });
      success("Bank transfer confirmed. Lead sold.");
      setConfirming(null);
      setReference("");
      refetch();
    } catch (e) {
      notifyError(e, "Could not confirm this payment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout title="Marketplace Purchases">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#0A2647]">All purchases</h2>
            <p className="text-sm text-slate-500">
              Confirm payments to unlock leads, or cancel / refund as needed.
            </p>
          </div>
          <Link
            href="/admin/marketplace"
            className="text-sm font-semibold text-[#C9A227] hover:text-[#0A2647] transition"
          >
            ← Back to Marketplace Leads
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading purchases…</div>
          ) : purchases.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">No purchases yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Lead</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Buyer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Reserved</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Expires</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {purchases.map((p) => {
                    const meta = STATUS_META[p.status] || STATUS_META.cancelled;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0A2647]">
                            {p.lead?.marketplace_title || p.lead?.full_name || p.lead?.lead_number || `Lead #${p.lead_id}`}
                          </p>
                          <p className="text-xs text-slate-400">{p.lead?.lead_number || ""}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-700">{p.user?.name || `User #${p.user_id}`}</p>
                          <p className="text-xs text-slate-400">{p.user?.email || ""}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#0A2647]">
                          ${Number(p.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${meta.classes}`}>
                            {meta.label}
                          </span>
                          {p.payment_gateway === "payoneer" && p.status === "pending" && (
                            <span className="block text-[11px] text-slate-400 mt-1">Awaiting Payoneer webhook</span>
                          )}
                          {p.expires_at && p.status === "pending" && new Date(p.expires_at) < new Date() && (
                            <span className="block text-[11px] text-red-500 font-semibold mt-1">Expired</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{fmt(p.reserved_at)}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{fmt(p.expires_at)}</td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex gap-2">
                            {p.status === "pending" && p.payment_gateway !== "payoneer" && (
                              <button
                                onClick={() => setConfirming(p)}
                                disabled={busy}
                                className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                              >
                                Confirm Bank Transfer
                              </button>
                            )}
                            {p.status === "pending" && (
                              <button
                                onClick={() => act(`/admin/marketplace/purchases/${p.id}/cancel`, "Purchase cancelled.")}
                                disabled={busy}
                                className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            )}
                            {p.status === "paid" && (
                              <button
                                onClick={() => act(`/admin/marketplace/purchases/${p.id}/refund`, "Purchase refunded.")}
                                disabled={busy}
                                className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                              >
                                Refund
                              </button>
                            )}
                            {p.status !== "pending" && p.status !== "paid" && (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </div>
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

      {confirming && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[#0A2647]">Confirm Bank Transfer</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter the wire/transfer reference you verified. This is logged to the audit trail.
              </p>
            </div>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. wire confirmation number"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setConfirming(null); setReference(""); }}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmBankTransfer}
                disabled={!reference.trim() || busy}
                className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] disabled:opacity-50"
              >
                {busy ? "Confirming..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
