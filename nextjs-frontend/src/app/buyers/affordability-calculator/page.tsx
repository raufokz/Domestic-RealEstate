'use client';

import React, { useState, useMemo } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export default function AffordabilityCalculatorPage() {
  const [annualIncome, setAnnualIncome] = useState(85000);
  const [monthlyDebts, setMonthlyDebts] = useState(500);
  const [downPayment, setDownPayment] = useState(60000);
  const [interestRate, setInterestRate] = useState(6.5);

  const results = useMemo(() => {
    const monthlyIncome = annualIncome / 12;
    const maxHousingPayment = monthlyIncome * 0.28;
    const maxTotalDebt = monthlyIncome * 0.36;
    const availableForHousing = maxTotalDebt - monthlyDebts;
    const affordablePayment = Math.min(maxHousingPayment, availableForHousing);

    const monthlyRate = interestRate / 100 / 12;
    const loanTerm = 360;
    const maxLoanAmount =
      monthlyRate > 0
        ? (affordablePayment * (Math.pow(1 + monthlyRate, loanTerm) - 1)) /
          (monthlyRate * Math.pow(1 + monthlyRate, loanTerm))
        : affordablePayment * loanTerm;

    const maxHomePrice = Math.max(0, maxLoanAmount + downPayment);

    return {
      maxHomePrice: Math.round(maxHomePrice),
      maxMonthlyPayment: Math.round(affordablePayment),
      frontEndDTI: Math.round((maxHousingPayment / monthlyIncome) * 100),
      backEndDTI: Math.round((maxTotalDebt / monthlyIncome) * 100),
    };
  }, [annualIncome, monthlyDebts, downPayment, interestRate]);

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Calculator"
        title="Affordability Calculator"
        subtitle="Find out how much home you can comfortably afford based on your income and debts."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Annual Income</span>
                  <span className="font-mono text-[#C9A227] font-bold">${annualIncome.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={20000}
                  max={500000}
                  step={5000}
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Monthly Debts</span>
                  <span className="font-mono text-[#C9A227] font-bold">${monthlyDebts.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={50}
                  value={monthlyDebts}
                  onChange={(e) => setMonthlyDebts(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
                <p className="font-body text-xs text-gray-400 mt-1">
                  Car loans, student loans, credit cards, etc.
                </p>
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Down Payment</span>
                  <span className="font-mono text-[#C9A227] font-bold">${downPayment.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={200000}
                  step={5000}
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Interest Rate</span>
                  <span className="font-mono text-[#C9A227] font-bold">{interestRate}%</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="bg-[#0A2647] rounded-2xl p-8 text-center">
                <p className="font-heading text-sm text-white/60 uppercase tracking-widest mb-2">Maximum Home Price</p>
                <p className="font-heading text-5xl font-bold text-[#C9A227]">
                  ${results.maxHomePrice.toLocaleString()}
                </p>
                <p className="font-body text-white/50 text-sm mt-2">based on 28/36 debt-to-income rules</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Max Monthly Payment</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">
                    ${results.maxMonthlyPayment.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Front-End DTI</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">{results.frontEndDTI}%</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <p className="font-heading text-xs text-gray-500 uppercase mb-1">Back-End DTI (incl. debts)</p>
                <p className="font-heading text-xl font-bold text-[#8B1E3F]">{results.backEndDTI}%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Find Your Dream Home"
        subtitle="Now that you know your budget, let us help you find the perfect property."
        primaryAction={{ label: 'Browse Properties', href: '/properties' }}
        secondaryAction={{ label: 'Request an Agent', href: '/buyers/request-agent' }}
      />
    </main>
  );
}
