"use client";

import SellerLayout from "@/components/seller/SellerLayout";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Valuation {
  id: number;
  address: string;
  estimatedValue: string;
  lastUpdated: string;
  method: string;
  confidence: string;
}

const FALLBACK_DATA: Valuation[] = [
  { id: 1, address: "890 Ocean Drive, Malibu", estimatedValue: "$3,520,000", lastUpdated: "Jul 10, 2026", method: "AI Estimate", confidence: "94%" },
  { id: 2, address: "321 Main St, Chicago", estimatedValue: "$812,000", lastUpdated: "Jul 8, 2026", method: "Manual", confidence: "89%" },
  { id: 3, address: "456 Maple Lane, Dallas", estimatedValue: "$1,185,000", lastUpdated: "Jul 5, 2026", method: "Appraisal", confidence: "97%" },
  { id: 4, address: "100 Skyline Blvd, NYC", estimatedValue: "$5,450,000", lastUpdated: "Jul 1, 2026", method: "AI Estimate", confidence: "91%" },
];

export default function SellerValuationsPage() {
  const [valuations, setValuations] = useState<Valuation[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet<Valuation[]>("/seller/valuations");
        setValuations(result);
      } catch {
        setValuations(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <SellerLayout title="Property Valuations" subtitle="Track estimated values for your properties.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{valuations.length} properties valued</span>
              <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
                + Request Appraisal
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property Address</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Estimated Value</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Method</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Confidence</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Last Updated</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {valuations.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{v.address}</td>
                        <td className="px-5 py-4 text-sm font-bold text-[#0A2647]">{v.estimatedValue}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            v.method === "AI Estimate" ? "bg-purple-100 text-purple-700" :
                            v.method === "Appraisal" ? "bg-green-100 text-green-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {v.method}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5">
                              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: v.confidence }} />
                            </div>
                            <span className="text-xs text-slate-500">{v.confidence}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">{v.lastUpdated}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">View History</button>
                            <button className="text-slate-400 hover:text-[#0A2647] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Update</button>
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
    </SellerLayout>
  );
}
