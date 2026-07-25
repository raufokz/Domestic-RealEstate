'use client';

import React, { useState, useMemo } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export default function MortgageCalculatorPage() {
  const [homePrice, setHomePrice] = useState(450000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);

  const results = useMemo(() => {
    const downPayment = homePrice * (downPaymentPct / 100);
    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = loanTerm * 12;

    const monthlyPI =
      monthlyRate > 0
        ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
          (Math.pow(1 + monthlyRate, totalPayments) - 1)
        : loanAmount / totalPayments;

    const estimatedTax = homePrice * 0.012 / 12;
    const estimatedInsurance = 150;
    const monthlyPayment = monthlyPI + estimatedTax + estimatedInsurance;
    const totalInterest = monthlyPI * totalPayments - loanAmount;
    const totalCost = downPayment + monthlyPI * totalPayments;

    const amortization = [];
    let balance = loanAmount;
    for (let year = 1; year <= Math.min(loanTerm, 10); year++) {
      let yearInterest = 0;
      let yearPrincipal = 0;
      for (let m = 0; m < 12; m++) {
        const intPayment = balance * monthlyRate;
        const prinPayment = monthlyPI - intPayment;
        yearInterest += intPayment;
        yearPrincipal += prinPayment;
        balance -= prinPayment;
      }
      amortization.push({
        year,
        principal: Math.round(yearPrincipal),
        interest: Math.round(yearInterest),
        balance: Math.max(0, Math.round(balance)),
      });
    }

    return {
      downPayment: Math.round(downPayment),
      loanAmount: Math.round(loanAmount),
      monthlyPI: Math.round(monthlyPI),
      estimatedTax: Math.round(estimatedTax),
      estimatedInsurance,
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalCost: Math.round(totalCost),
      amortization,
    };
  }, [homePrice, downPaymentPct, interestRate, loanTerm]);

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Calculator"
        title="Mortgage Calculator"
        subtitle="Estimate your monthly payments, total interest, and see an amortization breakdown."
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
                <label className="flex justify-between mb-2">
                  <span className="font-heading text-sm font-semibold text-[#0A2647]">Down Payment</span>
                  <span className="font-mono text-[#C9A227] font-bold">
                    {downPaymentPct}% (${results.downPayment.toLocaleString()})
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={downPaymentPct}
                  onChange={(e) => setDownPaymentPct(Number(e.target.value))}
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

              <div>
                <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">Loan Term</label>
                <div className="flex gap-3">
                  {[15, 20, 30].map((term) => (
                    <button
                      key={term}
                      onClick={() => setLoanTerm(term)}
                      className={`flex-1 py-3 rounded-lg font-heading font-semibold text-sm transition-colors ${
                        loanTerm === term
                          ? 'bg-[#0A2647] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {term} Years
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="bg-[#0A2647] rounded-2xl p-8 text-center">
                <p className="font-heading text-sm text-white/60 uppercase tracking-widest mb-2">Estimated Monthly Payment</p>
                <p className="font-heading text-5xl font-bold text-[#C9A227]">${results.monthlyPayment.toLocaleString()}</p>
                <p className="font-body text-white/50 text-sm mt-2">principal, interest, tax &amp; insurance</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Principal & Interest</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">${results.monthlyPI.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Loan Amount</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">${results.loanAmount.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Total Interest</p>
                  <p className="font-heading text-xl font-bold text-[#8B1E3F]">${results.totalInterest.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-heading text-xs text-gray-500 uppercase mb-1">Total Cost</p>
                  <p className="font-heading text-xl font-bold text-[#0A2647]">${results.totalCost.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amortization Breakdown */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0A2647] mb-8 text-center">
            Amortization Breakdown (First 10 Years)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left font-heading font-semibold text-[#0A2647] py-3 px-4">Year</th>
                  <th className="text-right font-heading font-semibold text-[#0A2647] py-3 px-4">Principal</th>
                  <th className="text-right font-heading font-semibold text-[#0A2647] py-3 px-4">Interest</th>
                  <th className="text-right font-heading font-semibold text-[#0A2647] py-3 px-4">Balance</th>
                </tr>
              </thead>
              <tbody>
                {results.amortization.map((row) => (
                  <tr key={row.year} className="border-b border-gray-100 hover:bg-white transition-colors">
                    <td className="font-body text-gray-700 py-3 px-4">{row.year}</td>
                    <td className="font-mono text-gray-700 text-right py-3 px-4">${row.principal.toLocaleString()}</td>
                    <td className="font-mono text-[#8B1E3F] text-right py-3 px-4">${row.interest.toLocaleString()}</td>
                    <td className="font-mono text-[#0A2647] font-semibold text-right py-3 px-4">
                      ${row.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Talk Financing?"
        subtitle="Our lending partners can help you find the best mortgage rate for your situation."
        primaryAction={{ label: 'Get Pre-Approved', href: '/buyers/pre-approval' }}
        secondaryAction={{ label: 'Contact Us', href: '/contact' }}
      />
    </main>
  );
}
