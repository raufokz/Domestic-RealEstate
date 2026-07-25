'use client';

import React, { useState, useMemo } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export default function FlipCalculatorPage() {
  const [purchasePrice, setPurchasePrice] = useState(200000);
  const [repairBudget, setRepairBudget] = useState(40000);
  const [afterRepairValue, setAfterRepairValue] = useState(400000);
  const [holdingPeriod, setHoldingPeriod] = useState(6);

  const results = useMemo(() => {
    const maxOffer70 = afterRepairValue * 0.70;
    const maxOfferWithRepairs = maxOffer70 - repairBudget;
    const profit70Rule = afterRepairValue - maxOffer70;
    const totalCost = purchasePrice + repairBudget;
    const actualProfit = afterRepairValue - totalCost;
    const roi = totalCost > 0 ? (actualProfit / totalCost) * 100 : 0;
    const monthlyProfit = holdingPeriod > 0 ? actualProfit / holdingPeriod : 0;

    return {
      maxOffer70: Math.round(maxOffer70),
      maxOfferWithRepairs: Math.round(maxOfferWithRepairs),
      profit70Rule: Math.round(profit70Rule),
      totalCost: Math.round(totalCost),
      actualProfit: Math.round(actualProfit),
      roi: roi.toFixed(1),
      monthlyProfit: Math.round(monthlyProfit),
    };
  }, [purchasePrice, repairBudget, afterRepairValue, holdingPeriod]);

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Calculator"
        title="Flip Calculator (70% Rule)"
        subtitle="Use the 70% rule to determine your maximum offer price and potential profit on a fix-and-flip deal."
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
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Repair Budget</span>
                  <span className="font-mono text-[#C9A227] font-bold">${repairBudget.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={200000}
                  step={5000}
                  value={repairBudget}
                  onChange={(e) => setRepairBudget(Number(e.target.value))}
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
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Holding Period (months)</span>
                  <span className="font-mono text-[#C9A227] font-bold">{holdingPeriod} mo</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={1}
                  value={holdingPeriod}
                  onChange={(e) => setHoldingPeriod(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="bg-[#0A2647] rounded-2xl p-8 text-center">
                <p className="font-heading text-sm text-white/60 uppercase tracking-widest mb-2">Maximum Offer Price (70% Rule)</p>
                <p className="font-heading text-5xl font-bold text-[#C9A227] font-mono">
                  ${results.maxOfferWithRepairs.toLocaleString()}
                </p>
                <p className="font-body text-white/50 text-sm mt-2">70% of ARV minus repair costs</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">70% of ARV</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">
                    ${results.maxOffer70.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Max Profit</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">
                    ${results.profit70Rule.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Your Total Cost</p>
                  <p className="font-heading text-xl font-bold text-[#8B1E3F]">
                    ${results.totalCost.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Your Profit</p>
                  <p className={`font-heading text-xl font-bold ${results.actualProfit >= 0 ? 'text-[#0A2647]' : 'text-red-500'}`}>
                    ${results.actualProfit.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">ROI</p>
                  <p className="font-heading text-2xl font-bold text-[#0A2647]">{results.roi}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Monthly Profit</p>
                  <p className="font-heading text-2xl font-bold text-[#0A2647]">
                    ${results.monthlyProfit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Flip?"
        subtitle="We source off-market flip deals with built-in equity. Get matched to deals that fit your criteria."
        primaryAction={{ label: 'View Deals', href: '/investors/deals' }}
        secondaryAction={{ label: 'Submit Inquiry', href: '/investors/inquiry' }}
      />
    </main>
  );
}
