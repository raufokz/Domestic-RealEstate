"use client";

import AgentLayout from "@/components/agent/AgentLayout";
import { useFetch } from "@/hooks/useFetch";
import { motion } from "framer-motion";
import Skeleton from "@/components/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { useToast } from "@/components/Toast";
import { useEffect, useState } from "react";

interface AffiliateClick {
  id: number;
  landing_page: string | null;
  referrer_url: string | null;
  created_at: string;
}

interface AffiliateDashboard {
  profile: {
    unique_code: string;
    status: string;
    total_clicks: number;
    total_conversions: number;
    total_earnings: string | number;
    pending_payout: string | number;
  };
  recent_clicks: AffiliateClick[];
  stats: {
    total_clicks: number;
    total_conversions: number;
    total_earnings: string | number;
    pending_payout: string | number;
  };
}

function money(v: number | string): string {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "$0";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function AgentReferralsPage() {
  const { data, error, loading, refetch } = useFetch<AffiliateDashboard>("/affiliate/dashboard");
  const { success: notifySuccess } = useToast();
  const [copied, setCopied] = useState(false);
  const [apiBase, setApiBase] = useState("");

  useEffect(() => {
    setApiBase(process.env.NEXT_PUBLIC_API_URL || "");
  }, []);

  const referralLink = data?.profile?.unique_code && apiBase
    ? `${apiBase.replace(/\/$/, "")}/affiliate/${data.profile.unique_code}/track`
    : "";

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    notifySuccess("Referral link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <AgentLayout title="Referral Program" subtitle="Earn commissions by referring clients to the platform">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </AgentLayout>
    );
  }

  if (error || !data) {
    return (
      <AgentLayout title="Referral Program" subtitle="Earn commissions by referring clients to the platform">
        <ErrorState message={error || "Could not load your referral dashboard."} onRetry={refetch} />
      </AgentLayout>
    );
  }

  const stats = data.stats;
  const clicks = data.recent_clicks || [];

  return (
    <AgentLayout title="Referral Program" subtitle="Earn commissions by referring clients to the platform">
      <div className="space-y-6">
        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Clicks", value: String(stats.total_clicks), color: "text-blue-600", icon: "🔗" },
            { label: "Conversions", value: String(stats.total_conversions), color: "text-purple-600", icon: "🤝" },
            { label: "Total Earned", value: money(stats.total_earnings), color: "text-emerald-600", icon: "💰" },
            { label: "Pending Payout", value: money(stats.pending_payout), color: "text-amber-600", icon: "⏳" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{s.icon}</span>
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Referral Link ── */}
        <div className="bg-gradient-to-r from-[#0A2647] to-[#123c6e] rounded-xl p-5 text-white">
          <h3 className="font-bold text-sm mb-2">🔗 Your Referral Link</h3>
          <p className="text-xs text-slate-300 mb-3">
            Share this link. Every unique visitor is tracked automatically toward your referral stats above.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              readOnly
              value={referralLink || "Loading..."}
              className="flex-1 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-xs font-mono text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={copyLink}
              disabled={!referralLink}
              className="shrink-0 rounded-lg bg-[#C9A227] text-[#0A2647] font-semibold text-xs px-4 py-2 hover:bg-[#C9A227]/90 transition-colors disabled:opacity-50"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* ── Recent Clicks ── */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-[#0A2647]">Recent Activity</h3>
          </div>

          {clicks.length === 0 ? (
            <EmptyState
              icon="🔗"
              title="No clicks yet"
              message="Share your referral link above — visits will show up here as they come in."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {clicks.map((click, i) => (
                <motion.div
                  key={click.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="px-5 py-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-[#0A2647] truncate">
                      {click.landing_page || "Landing page"}
                    </p>
                    {click.referrer_url && (
                      <p className="text-xs text-slate-400 truncate">from {click.referrer_url}</p>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">
                    {new Date(click.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AgentLayout>
  );
}
