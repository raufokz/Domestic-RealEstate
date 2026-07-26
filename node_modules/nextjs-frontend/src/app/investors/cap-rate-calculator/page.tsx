'use client';

import React, { useState, useMemo } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export default function CapRateCalculatorPage() {
  const [propertyValue, setPropertyValue] = useState(400000);
  const [annualNOI, setAnnualNOI] = useState(32000);

  const results = useMemo(() => {
    const capRate = propertyValue > 0 ? (annualNOI / propertyValue) * 100 : 0;
    const monthlyNOI = annualNOI / 12;
    const propertyPricePerUnit = propertyValue;
    const impliedValue = capRate > 0 ? annualNOI / (capRate / 100) : 0;

    return {
      capRate: capRate.toFixed(2),
      monthlyNOI: Math.round(monthlyNOI),
      pricePerDollarIncome: annualNOI > 0 ? (propertyValue / annualNOI).toFixed(1) : '0',
    };
  }, [propertyValue, annualNOI]);

  const capRateColor = (rate: number) => {
    if (rate >= 8) return 'text-green-500';
    if (rate >= 5) return 'text-[#C9A227]';
    return 'text-[#8B1E3F]';
  };

  const rateNum = parseFloat(results.capRate);

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Calculator"
        title="Cap Rate Calculator"
        subtitle="Determine the capitalization rate of an investment property to compare deals and evaluate yield."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Property Value / Purchase Price</span>
                  <span className="font-mono text-[#C9A227] font-bold">${propertyValue.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={50000}
                  max={2000000}
                  step={10000}
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Annual Net Operating Income (NOI)</span>
                  <span className="font-mono text-[#C9A227] font-bold">${annualNOI.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={200000}
                  step={1000}
                  value={annualNOI}
                  onChange={(e) => setAnnualNOI(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
                <p className="font-body text-xs text-gray-400 mt-1">
                  Annual rental income minus all operating expenses (before mortgage)
                </p>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="bg-[#0A2647] rounded-2xl p-8 text-center">
                <p className="font-heading text-sm text-white/60 uppercase tracking-widest mb-2">Capitalization Rate</p>
                <p className={`font-heading text-5xl font-bold font-mono ${capRateColor(rateNum)}`}>
                  {results.capRate}%
                </p>
                <p className="font-body text-white/50 text-sm mt-2">annual return on property value</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Monthly NOI</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">${results.monthlyNOI.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Price / Income Ratio</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">{results.pricePerDollarIncome}x</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <p className="font-heading text-sm font-semibold text-[#0A2647] mb-2">Cap Rate Benchmarks</p>
                <div className="space-y-2 text-sm font-body text-gray-600">
                  <div className="flex justify-between">
                    <span>8%+  — Strong yield (higher risk areas)</span>
                    <span className="text-green-500 font-semibold">Excellent</span>
                  </div>
                  <div className="flex justify-between">
                    <span>5–7% — Balanced (stable markets)</span>
                    <span className="text-[#C9A227] font-semibold">Good</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3–4% — Premium (high-demand areas)</span>
                    <span className="text-[#8B1E3F] font-semibold">Moderate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Find High Cap Rate Properties"
        subtitle="We source properties with strong cap rates in emerging and established markets."
        primaryAction={{ label: 'View Deals', href: '/investors/deals' }}
        secondaryAction={{ label: 'Set Your Buy Box', href: '/investors/buy-box' }}
      />
    </main>
  );
}
