"use client";

import { useState } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { useFetch } from "@/hooks/useFetch";
import { motion, AnimatePresence } from "framer-motion";

interface ReferralDeal {
  id: number;
  deal_number: string;
  title: string;
  value: string;
  status: string;
  referral_fee_pct: string | null;
  referral_fee_amount: string | null;
  referral_status: string;
  referral_paid_at: string | null;
  expected_close_date: string | null;
  closed_at: string | null;
  referral_agent?: { id: number; name: string; email: string; avatar: string | null } | null;
  lead?: { id: number; full_name: string; email: string } | null;
}

interface ReferralStats {
  total_deals: number;
  total_earned: number;
  pending_amount: number;
  paid_amount: number;
  active_referrals: number;
}

/* ── Fallback demo data (API may not be wired yet) ── */
const DEMO_STATS: ReferralStats = {
  total_deals: 8,
  total_earned: 34750,
  pending_amount: 12500,
  paid_amount: 22250,
  active_referrals: 3,
};

const DEMO_DEALS: ReferralDeal[] = [
  { id: 1, deal_number: "DL-A9F3E2B1", title: "Johnson Family – 456 Oak Ave", value: "425000.00", status: "closed_won", referral_fee_pct: "25.00", referral_fee_amount: "5312.50", referral_status: "paid", referral_paid_at: "2026-07-15T10:00:00Z", expected_close_date: "2026-07-10", closed_at: "2026-07-12", referral_agent: { id: 2, name: "Sarah Mitchell", email: "sarah@example.com", avatar: null }, lead: { id: 10, full_name: "Mark Johnson", email: "mark@example.com" } },
  { id: 2, deal_number: "DL-B8C1D4E7", title: "Williams Condo – 789 Main St", value: "310000.00", status: "negotiation", referral_fee_pct: "30.00", referral_fee_amount: "4650.00", referral_status: "pending", referral_paid_at: null, expected_close_date: "2026-08-20", closed_at: null, referral_agent: { id: 3, name: "James Rivera", email: "james@example.com", avatar: null }, lead: { id: 11, full_name: "Lisa Williams", email: "lisa@example.com" } },
  { id: 3, deal_number: "DL-C7K2F5G9", title: "Chen Estate – 123 Hillside", value: "875000.00", status: "closed_won", referral_fee_pct: "20.00", referral_fee_amount: "8750.00", referral_status: "paid", referral_paid_at: "2026-06-28T14:00:00Z", expected_close_date: "2026-06-25", closed_at: "2026-06-27", referral_agent: { id: 4, name: "Amanda Chen", email: "amanda@example.com", avatar: null }, lead: { id: 12, full_name: "David Chen", email: "david@example.com" } },
  { id: 4, deal_number: "DL-D6L3H8J2", title: "Garcia Ranch – 555 Valley Rd", value: "650000.00", status: "qualified", referral_fee_pct: "25.00", referral_fee_amount: "8125.00", referral_status: "pending", referral_paid_at: null, expected_close_date: "2026-09-15", closed_at: null, referral_agent: null, lead: { id: 13, full_name: "Maria Garcia", email: "maria@example.com" } },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  paid: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Paid" },
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
  none: { bg: "bg-slate-100", text: "text-slate-500", label: "Not Set" },
  processing: { bg: "bg-blue-100", text: "text-blue-700", label: "Processing" },
};

const DEAL_STATUS_COLORS: Record<string, string> = {
  closed_won: "text-emerald-600",
  negotiation: "text-amber-600",
  qualified: "text-blue-600",
  new: "text-sky-600",
  lost: "text-red-500",
};

function money(v: number | string): string {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "$0";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function AgentReferralsPage() {
  const { data: apiStats } = useFetch<ReferralStats>("/agent/referrals/stats");
  const { data: apiDeals } = useFetch<{ data: ReferralDeal[] }>("/agent/referrals");
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const stats = apiStats || DEMO_STATS;
  const deals = (apiDeals?.data || DEMO_DEALS).filter(
    (d) => filter === "all" || d.referral_status === filter
  );

  return (
    <AgentLayout title="Referral Fees" subtitle="Track referral commissions earned at closing">
      <div className="space-y-6">
        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Deals", value: String(stats.total_deals), color: "bg-blue-50 text-blue-600", icon: "📊" },
            { label: "Total Earned", value: money(stats.total_earned), color: "bg-emerald-50 text-emerald-600", icon: "💰" },
            { label: "Pending Payout", value: money(stats.pending_amount), color: "bg-amber-50 text-amber-600", icon: "⏳" },
            { label: "Paid Out", value: money(stats.paid_amount), color: "bg-green-50 text-green-600", icon: "✅" },
            { label: "Active Referrals", value: String(stats.active_referrals), color: "bg-purple-50 text-purple-600", icon: "🤝" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{s.icon}</span>
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-[#0A2647]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── How It Works Banner ── */}
        <div className="bg-gradient-to-r from-[#0A2647] to-[#123c6e] rounded-xl p-5 text-white">
          <h3 className="font-bold text-sm mb-2">💡 How Referral Fees Work</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {[
              { step: "1", title: "Refer a Client", desc: "Send a lead to another agent in the network" },
              { step: "2", title: "Set Fee %", desc: "Agree on referral fee (typically 20-35%)" },
              { step: "3", title: "Deal Closes", desc: "Client closes escrow with the receiving agent" },
              { step: "4", title: "Get Paid", desc: "Referral fee disbursed from closing proceeds" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-[#C9A227] text-[#0A2647] flex items-center justify-center text-xs font-black shrink-0">{s.step}</span>
                <div>
                  <p className="font-bold">{s.title}</p>
                  <p className="text-slate-300">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filter + Deals List ── */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-[#0A2647]">Referral Deals</h3>
            <div className="flex gap-2">
              {(["all", "paid", "pending"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    filter === f
                      ? "bg-[#0A2647] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f === "all" ? "All Deals" : f === "paid" ? "💚 Paid" : "⏳ Pending"}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {deals.length === 0 && (
              <div className="p-10 text-center text-slate-400 text-sm">No referral deals found for this filter.</div>
            )}
            {deals.map((deal, i) => {
              const st = STATUS_COLORS[deal.referral_status] || STATUS_COLORS.none;
              const isOpen = expandedId === deal.id;
              return (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => setExpandedId(isOpen ? null : deal.id)}
                    className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#0A2647] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {deal.deal_number.slice(-4)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0A2647] truncate">{deal.title}</p>
                      <p className="text-xs text-slate-500">
                        {deal.lead?.full_name || "—"} · Deal {deal.deal_number}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#0A2647]">{money(deal.referral_fee_amount || "0")}</p>
                      <p className="text-[10px] text-slate-400">{deal.referral_fee_pct}% of {money(deal.value)}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[10px] text-slate-400 mb-0.5">Deal Value</p>
                            <p className="text-sm font-bold text-[#0A2647]">{money(deal.value)}</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[10px] text-slate-400 mb-0.5">Referral Fee</p>
                            <p className="text-sm font-bold text-[#C9A227]">{deal.referral_fee_pct}%</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[10px] text-slate-400 mb-0.5">Expected Close</p>
                            <p className="text-sm font-bold text-[#0A2647]">
                              {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                            </p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[10px] text-slate-400 mb-0.5">Deal Status</p>
                            <p className={`text-sm font-bold capitalize ${DEAL_STATUS_COLORS[deal.status] || ""}`}>
                              {deal.status.replace(/_/g, " ")}
                            </p>
                          </div>
                          {deal.referral_agent && (
                            <div className="col-span-2 bg-blue-50 rounded-lg p-3">
                              <p className="text-[10px] text-blue-500 mb-0.5">Referring Agent</p>
                              <p className="text-sm font-bold text-[#0A2647]">{deal.referral_agent.name}</p>
                              <p className="text-xs text-slate-500">{deal.referral_agent.email}</p>
                            </div>
                          )}
                          {deal.referral_paid_at && (
                            <div className="col-span-2 bg-green-50 rounded-lg p-3">
                              <p className="text-[10px] text-green-500 mb-0.5">Paid On</p>
                              <p className="text-sm font-bold text-green-700">
                                {new Date(deal.referral_paid_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </AgentLayout>
  );
}
