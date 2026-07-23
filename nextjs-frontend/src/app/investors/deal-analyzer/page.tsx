'use client';

import React, { useState, useMemo } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export default function DealAnalyzerPage() {
  const [purchasePrice, setPurchasePrice] = useState(250000);
  const [repairCosts, setRepairCosts] = useState(40000);
  const [afterRepairValue, setAfterRepairValue] = useState(400000);
  const [holdingCosts, setHoldingCosts] = useState(12000);

  const results = useMemo(() => {
    const totalInvestment = purchasePrice + repairCosts + holdingCosts;
    const profit = afterRepairValue - totalInvestment;
    const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
    const equity = afterRepairValue - purchasePrice;

    return {
      totalInvestment: Math.round(totalInvestment),
      profit: Math.round(profit),
      roi: roi.toFixed(1),
      equity: Math.round(equity),
      profitMargin: afterRepairValue > 0 ? ((profit / afterRepairValue) * 100).toFixed(1) : '0',
    };
  }, [purchasePrice, repairCosts, afterRepairValue, holdingCosts]);

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Calculator"
        title="Deal Analyzer"
        subtitle="Run the numbers on any deal — enter your costs and projected ARV to see your profit and ROI instantly."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Purchase Price</span>
                  <span className="font-mono text-[#C9A227] font-bold">${purchasePrice.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={50000}
                  max={1000000}
                  step={5000}
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Repair Costs</span>
                  <span className="font-mono text-[#C9A227] font-bold">${repairCosts.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={200000}
                  step={5000}
                  value={repairCosts}
                  onChange={(e) => setRepairCosts(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">After-Repair Value (ARV)</span>
                  <span className="font-mono text-[#C9A227] font-bold">${afterRepairValue.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={100000}
                  max={2000000}
                  step={10000}
                  value={afterRepairValue}
                  onChange={(e) => setAfterRepairValue(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Holding Costs</span>
                  <span className="font-mono text-[#C9A227] font-bold">${holdingCosts.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={60000}
                  step={1000}
                  value={holdingCosts}
                  onChange={(e) => setHoldingCosts(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
                <p className="font-body text-xs text-gray-400 mt-1">
                  Insurance, taxes, utilities, loan interest during rehab &amp; sale
                </p>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="bg-[#0A2647] rounded-2xl p-8 text-center">
                <p className="font-heading text-sm text-white/60 uppercase tracking-widest mb-2">Projected Profit</p>
                <p className={`font-heading text-5xl font-bold font-mono ${Number(results.roi) >= 0 ? 'text-[#C9A227]' : 'text-red-400'}`}>
                  ${results.profit.toLocaleString()}
                </p>
                <p className="font-body text-white/50 text-sm mt-2">return on this deal</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">ROI</p>
                  <p className={`font-heading text-xl font-bold ${Number(results.roi) >= 0 ? 'text-[#0A2647]' : 'text-red-500'}`}>
                    {results.roi}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Total Investment</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">
                    ${results.totalInvestment.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Equity Created</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">
                    ${results.equity.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Profit Margin</p>
                  <p className="font-heading text-xl font-bold text-[#8B1E3F]">
                    {results.profitMargin}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Need a Second Opinion?"
        subtitle="Our investor agents will review the deal with you and help you negotiate the best possible price."
        primaryAction={{ label: 'Submit an Inquiry', href: '/investors/inquiry' }}
        secondaryAction={{ label: 'View More Deals', href: '/investors/deals' }}
      />
    </main>
  );
}
