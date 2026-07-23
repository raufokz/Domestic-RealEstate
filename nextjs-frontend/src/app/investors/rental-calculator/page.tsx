'use client';

import React, { useState, useMemo } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export default function RentalCalculatorPage() {
  const [monthlyRent, setMonthlyRent] = useState(2200);
  const [propertyPrice, setPropertyPrice] = useState(350000);
  const [annualExpenses, setAnnualExpenses] = useState(6000);

  const results = useMemo(() => {
    const annualRent = monthlyRent * 12;
    const netIncome = annualRent - annualExpenses;
    const monthlyNetIncome = netIncome / 12;
    const grossYield = propertyPrice > 0 ? ((annualRent / propertyPrice) * 100) : 0;
    const netYield = propertyPrice > 0 ? ((netIncome / propertyPrice) * 100) : 0;
    const rentToPrice = propertyPrice > 0 ? (monthlyRent / propertyPrice * 100) : 0;

    return {
      annualRent: Math.round(annualRent),
      netIncome: Math.round(netIncome),
      monthlyNetIncome: Math.round(monthlyNetIncome),
      grossYield: grossYield.toFixed(2),
      netYield: netYield.toFixed(2),
      rentToPrice: rentToPrice.toFixed(2),
    };
  }, [monthlyRent, propertyPrice, annualExpenses]);

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Calculator"
        title="Rental Income Calculator"
        subtitle="Evaluate the rental performance of a property — see net income, gross yield, and net yield at a glance."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Monthly Rent</span>
                  <span className="font-mono text-[#C9A227] font-bold">${monthlyRent.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={50}
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Property Price</span>
                  <span className="font-mono text-[#C9A227] font-bold">${propertyPrice.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={50000}
                  max={1500000}
                  step={10000}
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Annual Expenses</span>
                  <span className="font-mono text-[#C9A227] font-bold">${annualExpenses.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={30000}
                  step={500}
                  value={annualExpenses}
                  onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
                <p className="font-body text-xs text-gray-400 mt-1">
                  Taxes, insurance, maintenance, management, HOA, etc.
                </p>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="bg-[#0A2647] rounded-2xl p-8 text-center">
                <p className="font-heading text-sm text-white/60 uppercase tracking-widest mb-2">Net Monthly Income</p>
                <p className={`font-heading text-5xl font-bold font-mono ${results.monthlyNetIncome >= 0 ? 'text-[#C9A227]' : 'text-red-400'}`}>
                  ${results.monthlyNetIncome.toLocaleString()}
                </p>
                <p className="font-body text-white/50 text-sm mt-2">after all expenses</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Annual Net Income</p>
                  <p className={`font-heading text-xl font-bold ${results.netIncome >= 0 ? 'text-[#0A2647]' : 'text-red-500'}`}>
                    ${results.netIncome.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Annual Gross Rent</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">
                    ${results.annualRent.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Gross Yield</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">{results.grossYield}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Net Yield</p>
                  <p className="font-heading text-xl font-bold text-[#8B1E3F]">{results.netYield}%</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <p className="font-heading text-xs text-gray-500 uppercase mb-1">Rent-to-Price Ratio</p>
                <p className="font-heading text-2xl font-bold text-[#0A2647]">{results.rentToPrice}%</p>
                <p className="font-body text-xs text-gray-400 mt-1">
                  {parseFloat(results.rentToPrice) >= 0.7 ? 'Meets 1% rule threshold' : 'Below 1% rule — evaluate carefully'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Find High-Yield Rentals"
        subtitle="We source rental properties with strong yields in growth markets. Get deals matched to your criteria."
        primaryAction={{ label: 'View Deals', href: '/investors/deals' }}
        secondaryAction={{ label: 'Set Your Buy Box', href: '/investors/buy-box' }}
      />
    </main>
  );
}
