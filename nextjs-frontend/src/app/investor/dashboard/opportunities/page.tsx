"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Opportunity {
  id: number;
  address: string;
  type: string;
  price: string;
  expectedROI: string;
  capRate: string;
  cashFlow: string;
  riskLevel: string;
  beds: number;
  baths: number;
  sqft: string;
}

const FALLBACK_DATA: Opportunity[] = [
  { id: 1, address: "222 Riverside Blvd, Austin, TX", type: "Multi-Family", price: "$1.2M", expectedROI: "14.2%", capRate: "6.8%", cashFlow: "$3,200/mo", riskLevel: "Medium", beds: 4, baths: 3, sqft: "3,200" },
  { id: 2, address: "456 Downtown Plaza, Denver, CO", type: "Commercial", price: "$2.8M", expectedROI: "11.5%", capRate: "5.4%", cashFlow: "$8,500/mo", riskLevel: "Low", beds: 0, baths: 0, sqft: "8,400" },
  { id: 3, address: "789 Ocean View, Miami, FL", type: "Short-Term Rental", price: "$890K", expectedROI: "18.7%", capRate: "7.2%", cashFlow: "$4,800/mo", riskLevel: "High", beds: 3, baths: 2, sqft: "1,800" },
  { id: 4, address: "321 Maple Heights, Dallas, TX", type: "Single-Family", price: "$425K", expectedROI: "9.8%", capRate: "4.6%", cashFlow: "$1,200/mo", riskLevel: "Low", beds: 4, baths: 3, sqft: "2,600" },
  { id: 5, address: "555 Lake Shore, Chicago, IL", type: "Multi-Family", price: "$1.8M", expectedROI: "13.1%", capRate: "6.1%", cashFlow: "$5,600/mo", riskLevel: "Medium", beds: 6, baths: 4, sqft: "4,500" },
  { id: 6, address: "888 Sunset Strip, LA, CA", type: "Luxury Rental", price: "$3.5M", expectedROI: "8.4%", capRate: "3.9%", cashFlow: "$9,200/mo", riskLevel: "Low", beds: 5, baths: 4, sqft: "5,200" },
];

const TYPE_COLORS: Record<string, string> = {
  "Multi-Family": "bg-blue-100 text-blue-700",
  "Commercial": "bg-purple-100 text-purple-700",
  "Short-Term Rental": "bg-amber-100 text-amber-700",
  "Single-Family": "bg-emerald-100 text-emerald-700",
  "Luxury Rental": "bg-cyan-100 text-cyan-700",
};

const RISK_COLORS: Record<string, string> = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-red-100 text-red-700",
};

export default function InvestorOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet<Opportunity[]>("/investor/opportunities");
        setOpportunities(result);
      } catch {
        setOpportunities(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <InvestorLayout title="Investment Opportunities" subtitle="Discover properties with strong return potential.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {opportunities.map((opp) => (
                <div key={opp.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition group">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[opp.type] || "bg-slate-100 text-slate-600"}`}>
                      {opp.type}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${RISK_COLORS[opp.riskLevel] || "bg-slate-100 text-slate-600"}`}>
                      {opp.riskLevel} Risk
                    </span>
                  </div>
                  <h3 className="font-bold text-[#0A2647] text-sm group-hover:text-[#C9A227] transition mb-1">{opp.address}</h3>
                  <p className="text-lg font-bold text-[#0A2647] mt-2">{opp.price}</p>
                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400">ROI</p>
                      <p className="text-sm font-bold text-emerald-600">{opp.expectedROI}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Cap Rate</p>
                      <p className="text-sm font-bold text-[#0A2647]">{opp.capRate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Cash Flow</p>
                      <p className="text-sm font-bold text-[#C9A227]">{opp.cashFlow}</p>
                    </div>
                  </div>
                  {opp.beds > 0 && (
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span>{opp.beds} Beds</span>
                      <span>{opp.baths} Baths</span>
                      <span>{opp.sqft} sqft</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 text-center text-xs font-semibold text-[#0A2647] bg-slate-100 hover:bg-slate-200 rounded-lg py-2 transition">View Details</button>
                    <button className="flex-1 text-center text-xs font-semibold text-[#C9A227] bg-[#C9A227]/10 hover:bg-[#C9A227]/20 rounded-lg py-2 transition">Analyze</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </InvestorLayout>
  );
}
