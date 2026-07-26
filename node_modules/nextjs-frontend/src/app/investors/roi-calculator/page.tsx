'use client';

import React, { useState, useMemo } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export default function ROICalculatorPage() {
  const [purchasePrice, setPurchasePrice] = useState(350000);
  const [annualRentalIncome, setAnnualRentalIncome] = useState(30000);
  const [annualExpenses, setAnnualExpenses] = useState(8000);
  const [appreciationRate, setAppreciationRate] = useState(3);

  const results = useMemo(() => {
    const netOperatingIncome = annualRentalIncome - annualExpenses;
    const capRate = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
    const appreciationValue = purchasePrice * (appreciationRate / 100);
    const totalAnnualReturn = netOperatingIncome + appreciationValue;
    const cashOnCashROI = purchasePrice > 0 ? (totalAnnualReturn / purchasePrice) * 100 : 0;
    const monthlyCashFlow = netOperatingIncome / 12;

    return {
      noi: Math.round(netOperatingIncome),
      capRate: capRate.toFixed(2),
      appreciationValue: Math.round(appreciationValue),
      totalAnnualReturn: Math.round(totalAnnualReturn),
      cashOnCashROI: cashOnCashROI.toFixed(2),
      monthlyCashFlow: Math.round(monthlyCashFlow),
    };
  }, [purchasePrice, annualRentalIncome, annualExpenses, appreciationRate]);

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Calculator"
        title="ROI Calculator"
        subtitle="Calculate your total return on investment including rental income, expenses, and property appreciation."
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
                  max={1500000}
                  step={10000}
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Annual Rental Income</span>
                  <span className="font-mono text-[#C9A227] font-bold">${annualRentalIncome.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={120000}
                  step={1000}
                  value={annualRentalIncome}
                  onChange={(e) => setAnnualRentalIncome(Number(e.target.value))}
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
                  max={50000}
                  step={500}
                  value={annualExpenses}
                  onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
                <p className="font-body text-xs text-gray-400 mt-1">
                  Taxes, insurance, maintenance, HOA, vacancy, management
                </p>
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Annual Appreciation Rate</span>
                  <span className="font-mono text-[#C9A227] font-bold">{appreciationRate}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={appreciationRate}
                  onChange={(e) => setAppreciationRate(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="bg-[#0A2647] rounded-2xl p-8 text-center">
                <p className="font-heading text-sm text-white/60 uppercase tracking-widest mb-2">Total Annual ROI</p>
                <p className="font-heading text-5xl font-bold text-[#C9A227]">{results.cashOnCashROI}%</p>
                <p className="font-body text-white/50 text-sm mt-2">cash-on-cash return</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Net Operating Income</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">${results.noi.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Cap Rate</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">{results.capRate}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Monthly Cash Flow</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">${results.monthlyCashFlow.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Appreciation (Year 1)</p>
                  <p className="font-heading text-xl font-bold text-[#8B1E3F]">${results.appreciationValue.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <p className="font-heading text-xs text-gray-500 uppercase mb-1">Total Annual Return</p>
                <p className="font-heading text-2xl font-bold text-[#0A2647]">${results.totalAnnualReturn.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Maximize Your Returns"
        subtitle="Our investor team can help you find properties that meet your target ROI and build a profitable portfolio."
        primaryAction={{ label: 'Browse Deals', href: '/investors/deals' }}
        secondaryAction={{ label: 'Talk to an Expert', href: '/investors/inquiry' }}
      />
    </main>
  );
}
