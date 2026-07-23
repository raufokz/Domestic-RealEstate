'use client';

import React, { useState, useMemo } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

const stateFees: Record<string, number> = {
  'National Average': 0.025,
  'California': 0.02,
  'Texas': 0.018,
  'Florida': 0.022,
  'New York': 0.03,
  'Illinois': 0.019,
  'Pennsylvania': 0.021,
  'Ohio': 0.017,
  'Georgia': 0.016,
  'North Carolina': 0.018,
  'Michigan': 0.015,
  'Virginia': 0.019,
  'Washington': 0.021,
  'Arizona': 0.017,
  'Massachusetts': 0.023,
};

export default function ClosingCostCalculatorPage() {
  const [homePrice, setHomePrice] = useState(450000);
  const [state, setState] = useState('National Average');

  const results = useMemo(() => {
    const rate = stateFees[state] ?? 0.025;
    const estimatedClosingCosts = Math.round(homePrice * rate);

    const lenderFees = Math.round(estimatedClosingCosts * 0.15);
    const appraisalFee = 500;
    const titleInsurance = Math.round(estimatedClosingCosts * 0.12);
    const escrowDeposit = Math.round(estimatedClosingCosts * 0.18);
    const recordingFees = Math.round(estimatedClosingCosts * 0.05);
    const transferTax = Math.round(estimatedClosingCosts * 0.25);
    const otherCosts = estimatedClosingCosts - lenderFees - appraisalFee - titleInsurance - escrowDeposit - recordingFees - transferTax;

    return {
      total: estimatedClosingCosts,
      low: Math.round(homePrice * (rate - 0.005)),
      high: Math.round(homePrice * (rate + 0.005)),
      breakdown: [
        { label: 'Lender Fees', amount: lenderFees },
        { label: 'Appraisal', amount: appraisalFee },
        { label: 'Title Insurance', amount: titleInsurance },
        { label: 'Escrow / Prepaids', amount: escrowDeposit },
        { label: 'Transfer Tax', amount: transferTax },
        { label: 'Recording Fees', amount: recordingFees },
        { label: 'Other Costs', amount: Math.max(0, otherCosts) },
      ],
    };
  }, [homePrice, state]);

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Calculator"
        title="Closing Cost Calculator"
        subtitle="Estimate your closing costs before you buy. Know what to expect at the closing table."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Home Price</span>
                  <span className="font-mono text-[#C9A227] font-bold">${homePrice.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={50000}
                  max={2000000}
                  step={10000}
                  value={homePrice}
                  onChange={(e) => setHomePrice(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] bg-white"
                >
                  {Object.keys(stateFees).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="bg-[#0A2647] rounded-2xl p-8 text-center">
                <p className="font-heading text-sm text-white/60 uppercase tracking-widest mb-2">Estimated Closing Costs</p>
                <p className="font-heading text-5xl font-bold text-[#C9A227]">
                  ${results.total.toLocaleString()}
                </p>
                <p className="font-body text-white/50 text-sm mt-2">
                  Range: ${results.low.toLocaleString()} – ${results.high.toLocaleString()}
                </p>
              </div>

              <div className="space-y-3">
                {results.breakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4">
                    <span className="font-body text-gray-700">{item.label}</span>
                    <span className="font-mono text-[#0A2647] font-semibold">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Close on Your New Home?"
        subtitle="Let us guide you through the closing process so there are no surprises."
        primaryAction={{ label: 'Talk to an Agent', href: '/buyers/request-agent' }}
        secondaryAction={{ label: 'Calculate Mortgage', href: '/buyers/mortgage-calculator' }}
      />
    </main>
  );
}
