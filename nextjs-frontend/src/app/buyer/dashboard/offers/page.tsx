"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Offer {
  id: number;
  property: string;
  address: string;
  offerAmount: string;
  status: string;
  date: string;
  agent: string;
  gradient: string;
}

const FALLBACK_DATA: Offer[] = [
  { id: 1, property: "Luxury Beachfront Villa", address: "890 Ocean Drive, Malibu", offerAmount: "$3,200,000", status: "Accepted", date: "Jul 12, 2026", agent: "Sarah Johnson", gradient: "from-cyan-400 to-cyan-600" },
  { id: 2, property: "Modern Downtown Loft", address: "321 Main St, Chicago", offerAmount: "$720,000", status: "Countered", date: "Jul 10, 2026", agent: "Michael Chen", gradient: "from-violet-400 to-violet-600" },
  { id: 3, property: "Suburban Family Estate", address: "456 Maple Lane, Dallas", offerAmount: "$490,000", status: "Pending", date: "Jul 8, 2026", agent: "Emily Davis", gradient: "from-rose-400 to-rose-600" },
  { id: 4, property: "Penthouse Suite", address: "100 Skyline Blvd, NYC", offerAmount: "$4,800,000", status: "Rejected", date: "Jul 5, 2026", agent: "Sarah Johnson", gradient: "from-amber-400 to-amber-600" },
];

export default function BuyerOffersPage() {
  const [offers, setOffers] = useState<Offer[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet<Offer[]>("/buyer/offers");
        setOffers(result);
      } catch {
        setOffers(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <BuyerLayout title="My Offers" subtitle="Track all your property offers.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Offers", value: String(offers.length), color: "bg-blue-50 text-blue-600" },
                { label: "Accepted", value: String(offers.filter((o) => o.status === "Accepted").length), color: "bg-green-50 text-green-600" },
                { label: "Pending", value: String(offers.filter((o) => o.status === "Pending").length), color: "bg-amber-50 text-amber-600" },
                { label: "Countered", value: String(offers.filter((o) => o.status === "Countered").length), color: "bg-purple-50 text-purple-600" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
                  <span className="text-xs text-slate-500">{stat.label}</span>
                  <p className="text-2xl font-bold text-[#0A2647] mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Offer Amount</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Agent</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {offers.map((offer) => (
                      <tr key={offer.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${offer.gradient} flex-shrink-0`} />
                            <div>
                              <p className="font-semibold text-[#0A2647] text-sm">{offer.property}</p>
                              <p className="text-slate-500 text-xs">{offer.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{offer.offerAmount}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            offer.status === "Accepted" ? "bg-green-100 text-green-700" :
                            offer.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                            offer.status === "Countered" ? "bg-purple-100 text-purple-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {offer.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">{offer.date}</td>
                        <td className="px-5 py-4 text-sm text-slate-600">{offer.agent}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">View</button>
                            {offer.status === "Pending" && (
                              <button className="text-slate-400 hover:text-red-500 text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Withdraw</button>
                            )}
                            {offer.status === "Countered" && (
                              <button className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Counter</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </BuyerLayout>
  );
}
