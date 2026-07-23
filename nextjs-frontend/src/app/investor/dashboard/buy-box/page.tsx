"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";

export default function InvestorBuyBoxPage() {
  return (
    <InvestorLayout title="Buy-Box Preferences" subtitle="Define your ideal investment criteria to receive matching opportunities.">
      <div className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Investment Criteria</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Property Type</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                <option selected>Single Family</option>
                <option>Multi-Family</option>
                <option>Condo</option>
                <option>Townhouse</option>
                <option>Commercial</option>
                <option>Land</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Strategy</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                <option>Buy & Hold</option>
                <option selected>Fix & Flip</option>
                <option>BRRRR</option>
                <option>Rental Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Min Price</label>
              <input type="text" defaultValue="$100,000" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Max Price</label>
              <input type="text" defaultValue="$500,000" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Target Markets</label>
              <input type="text" defaultValue="Miami, Tampa, Orlando" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Min Bedrooms</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                <option>Any</option>
                <option>1+</option>
                <option selected>2+</option>
                <option>3+</option>
                <option>4+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Min ROI Target</label>
              <input type="text" defaultValue="12%" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Max Age of Property</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                <option>Any</option>
                <option>Under 10 years</option>
                <option selected>Under 30 years</option>
                <option>Under 50 years</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Max Days on Market</label>
              <input type="text" defaultValue="60" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Deal Sourcing Preferences</h2>
          <div className="space-y-4">
            {[
              { label: "Off-market deals", description: "Properties not listed on MLS", enabled: true },
              { label: "Distressed properties", description: "Foreclosures, short sales, probate", enabled: true },
              { label: "New construction", description: "Pre-construction and new builds", enabled: false },
              { label: "Wholesale deals", description: "Below-market wholesale opportunities", enabled: true },
              { label: "REO/Bank owned", description: "Bank-owned properties", enabled: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-[#0A2647]">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                </div>
                <button className={`w-11 h-6 rounded-full transition-colors relative ${item.enabled ? "bg-emerald-500" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.enabled ? "translate-x-5" : ""}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button className="bg-[#C9A227] text-[#0A2647] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            Save Preferences
          </button>
        </div>
      </div>
    </InvestorLayout>
  );
}
