"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";
import CounterOfferModal from "@/components/offers/CounterOfferModal";

interface OfferProperty {
  id: number;
  title: string;
  slug: string;
  address: string;
  city: string;
  state: string;
}

interface Offer {
  id: number;
  offer_number: string;
  property: OfferProperty;
  amount: number;
  current_amount: number;
  status: "submitted" | "countered" | "accepted" | "rejected" | "withdrawn";
  last_action_by: "buyer" | "seller";
  counter_message: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-yellow-100 text-yellow-700",
  countered: "bg-purple-100 text-purple-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-slate-100 text-slate-500",
};

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function BuyerOffersPage() {
  const { success, notifyError } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [counterTarget, setCounterTarget] = useState<Offer | null>(null);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<{ data: Offer[] }>("/buyer/offers");
      setOffers(result.data ?? []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your offers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  async function handleWithdraw(offer: Offer) {
    if (!confirm(`Withdraw your offer on ${offer.property.title}?`)) return;
    setBusyId(offer.id);
    try {
      await apiPost(`/buyer/offers/${offer.id}/withdraw`);
      success("Offer withdrawn.", "Offers");
      fetchOffers();
    } catch (e) {
      notifyError(e, "Could not withdraw this offer.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRespond(offer: Offer, action: "accept" | "reject") {
    if (!confirm(action === "accept" ? "Accept this counter-offer?" : "Reject this counter-offer?")) return;
    setBusyId(offer.id);
    try {
      await apiPost(`/buyer/offers/${offer.id}/respond`, { action });
      success(action === "accept" ? "Offer accepted." : "Offer rejected.", "Offers");
      fetchOffers();
    } catch (e) {
      notifyError(e, "Could not record your response.");
    } finally {
      setBusyId(null);
    }
  }

  const isBuyersTurn = (offer: Offer) => offer.status === "countered" && offer.last_action_by === "seller";
  const canWithdraw = (offer: Offer) => offer.status === "submitted" || offer.status === "countered";

  return (
    <BuyerLayout title="My Offers" subtitle="Track all your property offers.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-700 text-sm">{error}</p>
            <button onClick={fetchOffers} className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:opacity-90">
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Offers", value: String(offers.length), color: "bg-blue-50 text-blue-600" },
                { label: "Accepted", value: String(offers.filter((o) => o.status === "accepted").length), color: "bg-green-50 text-green-600" },
                { label: "Awaiting Response", value: String(offers.filter((o) => o.status === "submitted" || (o.status === "countered" && o.last_action_by === "buyer")).length), color: "bg-amber-50 text-amber-600" },
                { label: "Countered", value: String(offers.filter((o) => o.status === "countered").length), color: "bg-purple-50 text-purple-600" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
                  <span className="text-xs text-slate-500">{stat.label}</span>
                  <p className="text-2xl font-bold text-[#0A2647] mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {offers.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-sm">
                  You haven&apos;t made any offers yet. Browse <Link href="/properties" className="text-[#0A2647] font-semibold hover:underline">properties</Link> to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                        <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {offers.map((offer) => (
                        <tr key={offer.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4">
                            <Link href={`/properties/${offer.property.slug}`} className="font-semibold text-[#0A2647] text-sm hover:underline">
                              {offer.property.title}
                            </Link>
                            <p className="text-slate-500 text-xs">{[offer.property.address, offer.property.city, offer.property.state].filter(Boolean).join(", ")}</p>
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">
                            {formatMoney(offer.current_amount)}
                            {Number(offer.current_amount) !== Number(offer.amount) && (
                              <span className="block text-xs text-slate-400 font-normal">Original: {formatMoney(offer.amount)}</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[offer.status] || "bg-slate-100 text-slate-600"}`}>
                              {offer.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500">{new Date(offer.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isBuyersTurn(offer) && (
                                <>
                                  <button disabled={busyId === offer.id} onClick={() => handleRespond(offer, "accept")} className="text-green-600 hover:text-green-700 text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition disabled:opacity-50">
                                    Accept
                                  </button>
                                  <button disabled={busyId === offer.id} onClick={() => handleRespond(offer, "reject")} className="text-red-500 hover:text-red-600 text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition disabled:opacity-50">
                                    Reject
                                  </button>
                                  <button disabled={busyId === offer.id} onClick={() => setCounterTarget(offer)} className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition disabled:opacity-50">
                                    Counter
                                  </button>
                                </>
                              )}
                              {canWithdraw(offer) && (
                                <button disabled={busyId === offer.id} onClick={() => handleWithdraw(offer)} className="text-slate-400 hover:text-red-500 text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition disabled:opacity-50">
                                  Withdraw
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {counterTarget && (
        <CounterOfferModal
          offerId={counterTarget.id}
          side="buyer"
          currentAmount={counterTarget.current_amount}
          onClose={() => setCounterTarget(null)}
          onSuccess={() => {
            setCounterTarget(null);
            fetchOffers();
          }}
        />
      )}
    </BuyerLayout>
  );
}
