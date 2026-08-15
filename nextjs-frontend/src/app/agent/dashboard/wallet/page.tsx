"use client";

import { useState } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { useFetch } from "@/hooks/useFetch";
import { apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";
import Skeleton from "@/components/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";

interface LeadPackage {
  id: number;
  name: string;
  lead_count: number;
  description: string | null;
  price: string | number;
  is_popular: boolean;
}

interface CreditTransaction {
  id: number;
  type: "credit" | "debit";
  amount: number;
  balance_after: number;
  reason: string;
  created_at: string;
}

interface PendingTopup {
  id: number;
  credits: number;
  amount_paid: string | number;
  payment_gateway: string;
  status: string;
  created_at: string;
}

const REASON_LABELS: Record<string, string> = {
  topup_payoneer: "Payoneer top-up",
  topup_bank_transfer_admin_confirmed: "Bank transfer top-up (confirmed)",
  marketplace_lead_unlock: "Lead unlocked",
  dispute_refund: "Dispute refund",
};

function money(v: string | number): string {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return "$" + (isNaN(n) ? "0" : n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }));
}

export default function WalletPage() {
  const { data: balanceData, loading: balanceLoading, refetch: refetchBalance } = useFetch<{ data: { balance_credits: number } }>("/wallet/balance");
  const { data: ledgerData, loading: ledgerLoading, error: ledgerError, refetch: refetchLedger } = useFetch<{ data: { data: CreditTransaction[] } }>("/wallet/ledger");
  const { data: pendingData, refetch: refetchPending } = useFetch<{ data: PendingTopup[] }>("/wallet/pending-topups");
  const { data: packagesData, loading: packagesLoading } = useFetch<LeadPackage[]>("/lead-packages");

  const { success, notifyError } = useToast();
  const [buying, setBuying] = useState<number | null>(null);
  const [method, setMethod] = useState<"payoneer" | "bank_transfer">("payoneer");

  const balance = balanceData?.data?.balance_credits ?? 0;
  const transactions = ledgerData?.data?.data ?? [];
  const pending = pendingData?.data ?? [];
  const packages = (packagesData ?? []).filter((p) => p.lead_count > 0);

  const buyPack = async (pack: LeadPackage) => {
    setBuying(pack.id);
    try {
      const res = await apiPost<{ data: { status: string; checkout_url?: string; order_id: number } }>("/wallet/topup", {
        lead_package_id: pack.id,
        payment_method: method,
      });

      if (res.data.status === "checkout_created" && res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
        return;
      }

      success("Top-up submitted — your credits will be added once payment is confirmed.");
      refetchPending();
    } catch (err) {
      notifyError(err, err instanceof ApiError ? err.message : "Failed to start top-up.");
    } finally {
      setBuying(null);
    }
  };

  return (
    <AgentLayout title="Wallet">
      <div className="space-y-6">
        {/* Balance */}
        <div className="bg-gradient-to-r from-[#0A2647] to-[#123c6e] rounded-xl p-6 text-white">
          <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Credit Balance</p>
          {balanceLoading ? (
            <Skeleton className="h-10 w-32 bg-white/10" />
          ) : (
            <p className="text-4xl font-black">{balance} <span className="text-lg font-normal text-white/60">credits</span></p>
          )}
          <p className="text-xs text-white/50 mt-2">Spend credits to unlock marketplace leads instantly — no waiting, no per-item checkout.</p>
        </div>

        {/* Pending top-ups */}
        {pending.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-bold text-amber-900 mb-2">⏳ Pending top-ups (not yet spendable)</p>
            <div className="space-y-1.5">
              {pending.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs text-amber-800">
                  <span>{p.credits} credits · {money(p.amount_paid)} via {p.payment_gateway === "bank_transfer" ? "bank transfer" : p.payment_gateway}</span>
                  <span className="font-semibold">Awaiting confirmation</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Credits */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-[#0A2647]">Add Credits</h3>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setMethod("payoneer")}
                className={`px-3 py-1.5 rounded-lg font-semibold ${method === "payoneer" ? "bg-[#0A2647] text-white" : "bg-slate-100 text-slate-600"}`}
              >
                💳 Payoneer
              </button>
              <button
                onClick={() => setMethod("bank_transfer")}
                className={`px-3 py-1.5 rounded-lg font-semibold ${method === "bank_transfer" ? "bg-[#0A2647] text-white" : "bg-slate-100 text-slate-600"}`}
              >
                🏦 Bank Transfer
              </button>
            </div>
          </div>

          {packagesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
            </div>
          ) : packages.length === 0 ? (
            <EmptyState icon="💳" title="No credit packs available yet" message="Check back soon, or contact support." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {packages.map((pack) => (
                <div key={pack.id} className={`rounded-xl border p-4 ${pack.is_popular ? "border-[#C9A227] bg-[#C9A227]/5" : "border-slate-200"}`}>
                  {pack.is_popular && <span className="text-[10px] font-bold text-[#C9A227] uppercase">Most Popular</span>}
                  <p className="font-heading font-bold text-[#0A2647] mt-1">{pack.name}</p>
                  <p className="text-2xl font-black text-[#0A2647] mt-1">{pack.lead_count} <span className="text-xs font-normal text-slate-400">credits</span></p>
                  <p className="text-sm text-slate-500 mt-1">{money(pack.price)}</p>
                  {pack.description && <p className="text-xs text-slate-400 mt-2">{pack.description}</p>}
                  <button
                    onClick={() => buyPack(pack)}
                    disabled={buying === pack.id}
                    className="w-full mt-4 bg-[#0A2647] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#0d3366] transition-colors disabled:opacity-50"
                  >
                    {buying === pack.id ? "Starting..." : "Buy"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ledger */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-[#0A2647]">Transaction History</h3>
          </div>

          {ledgerLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : ledgerError ? (
            <ErrorState message={ledgerError} onRetry={refetchLedger} />
          ) : transactions.length === 0 ? (
            <EmptyState icon="🧾" title="No transactions yet" message="Your credit history will show up here." />
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#0A2647]">{REASON_LABELS[t.reason] || t.reason}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${t.type === "credit" ? "text-emerald-600" : "text-slate-700"}`}>
                      {t.type === "credit" ? "+" : "-"}{t.amount}
                    </p>
                    <p className="text-[10px] text-slate-400">Balance: {t.balance_after}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AgentLayout>
  );
}
