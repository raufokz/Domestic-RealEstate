'use client';

import React, { useState, useMemo } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export default function CashFlowCalculatorPage() {
  const [rentalIncome, setRentalIncome] = useState(2500);
  const [mortgage, setMortgage] = useState(1400);
  const [taxes, setTaxes] = useState(250);
  const [insurance, setInsurance] = useState(120);
  const [maintenance, setMaintenance] = useState(200);
  const [vacancy, setVacancy] = useState(5);

  const results = useMemo(() => {
    const vacancyLoss = rentalIncome * (vacancy / 100);
    const effectiveIncome = rentalIncome - vacancyLoss;
    const totalExpenses = mortgage + taxes + insurance + maintenance + vacancyLoss;
    const monthlyCashFlow = effectiveIncome - totalExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    const grossYield = rentalIncome > 0 ? (rentalIncome * 12) : 0;

    return {
      vacancyLoss: Math.round(vacancyLoss),
      effectiveIncome: Math.round(effectiveIncome),
      totalExpenses: Math.round(totalExpenses),
      monthlyCashFlow: Math.round(monthlyCashFlow),
      annualCashFlow: Math.round(annualCashFlow),
      expenseRatio: effectiveIncome > 0 ? ((totalExpenses / effectiveIncome) * 100).toFixed(1) : '0',
    };
  }, [rentalIncome, mortgage, taxes, insurance, maintenance, vacancy]);

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Calculator"
        title="Cash Flow Calculator"
        subtitle="Calculate your monthly and annual cash flow from a rental property by accounting for all income and expenses."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Monthly Rental Income</span>
                  <span className="font-mono text-[#C9A227] font-bold">${rentalIncome.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={50}
                  value={rentalIncome}
                  onChange={(e) => setRentalIncome(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Monthly Mortgage (P&I)</span>
                  <span className="font-mono text-[#C9A227] font-bold">${mortgage.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={50}
                  value={mortgage}
                  onChange={(e) => setMortgage(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Monthly Taxes</span>
                  <span className="font-mono text-[#C9A227] font-bold">${taxes.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={25}
                  value={taxes}
                  onChange={(e) => setTaxes(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Monthly Insurance</span>
                  <span className="font-mono text-[#C9A227] font-bold">${insurance.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={10}
                  value={insurance}
                  onChange={(e) => setInsurance(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Monthly Maintenance</span>
                  <span className="font-mono text-[#C9A227] font-bold">${maintenance.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={25}
                  value={maintenance}
                  onChange={(e) => setMaintenance(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>

              <div>
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Vacancy Rate</span>
                  <span className="font-mono text-[#C9A227] font-bold">{vacancy}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={vacancy}
                  onChange={(e) => setVacancy(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="bg-[#0A2647] rounded-2xl p-8 text-center">
                <p className="font-heading text-sm text-white/60 uppercase tracking-widest mb-2">Monthly Cash Flow</p>
                <p className={`font-heading text-5xl font-bold font-mono ${results.monthlyCashFlow >= 0 ? 'text-[#C9A227]' : 'text-red-400'}`}>
                  ${results.monthlyCashFlow.toLocaleString()}
                </p>
                <p className="font-body text-white/50 text-sm mt-2">net income after all expenses</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Annual Cash Flow</p>
                  <p className={`font-heading text-xl font-bold ${results.annualCashFlow >= 0 ? 'text-[#0A2647]' : 'text-red-500'}`}>
                    ${results.annualCashFlow.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Effective Income</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">
                    ${results.effectiveIncome.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Total Expenses</p>
                  <p className="font-heading text-xl font-bold text-[#8B1E3F]">
                    ${results.totalExpenses.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Vacancy Loss</p>
                  <p className="font-heading text-xl font-bold text-gray-600">
                    ${results.vacancyLoss.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <p className="font-heading text-xs text-gray-500 uppercase mb-1">Expense Ratio</p>
                <p className="font-heading text-2xl font-bold text-[#0A2647]">{results.expenseRatio}%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Find Cash-Flowing Properties"
        subtitle="We source properties with strong positive cash flow in growing markets."
        primaryAction={{ label: 'View Deals', href: '/investors/deals' }}
        secondaryAction={{ label: 'Define Your Buy Box', href: '/investors/buy-box' }}
      />
    </main>
  );
}
