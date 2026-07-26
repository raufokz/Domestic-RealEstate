"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";

const CALCULATORS = [
  { id: 1, name: "Mortgage Calculator", description: "Calculate monthly payments, total interest, and amortization schedules.", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-blue-500", link: "#" },
  { id: 2, name: "Cash-on-Cash Return", description: "Evaluate your annual return based on cash invested in a rental property.", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v1", color: "bg-emerald-500", link: "#" },
  { id: 3, name: "Cap Rate Calculator", description: "Determine the capitalization rate for income-producing properties.", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", color: "bg-purple-500", link: "#" },
  { id: 4, name: "Fix & Flip Analyzer", description: "Estimate profit margins for renovation projects including ARV and repair costs.", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z", color: "bg-amber-500", link: "#" },
  { id: 5, name: "BRRRR Calculator", description: "Analyze Buy, Rehab, Rent, Refinance, Repeat strategy viability.", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", color: "bg-rose-500", link: "#" },
  { id: 6, name: "Rental Yield Calculator", description: "Calculate gross and net rental yields for investment properties.", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z", color: "bg-indigo-500", link: "#" },
];

export default function InvestorCalculatorsPage() {
  return (
    <InvestorLayout title="Investment Calculators" subtitle="Tools to help you analyze and evaluate investment opportunities.">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CALCULATORS.map((calc) => (
            <div key={calc.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition cursor-pointer">
              <div className={`w-12 h-12 rounded-xl ${calc.color} flex items-center justify-center mb-4`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={calc.icon} />
                </svg>
              </div>
              <h3 className="font-bold text-[#0A2647] text-lg">{calc.name}</h3>
              <p className="text-slate-500 text-sm mt-2">{calc.description}</p>
              <button className="mt-4 text-[#C9A227] hover:text-[#0A2647] font-semibold text-sm transition">
                Open Calculator →
              </button>
            </div>
          ))}
        </div>
      </div>
    </InvestorLayout>
  );
}
