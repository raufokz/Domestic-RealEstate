"use client";

import React, { useState } from "react";

export default function MortgageCalculatorWidget() {
  const [calc, setCalc] = useState({
    homePrice: 500000,
    downPayment: 100000,
    interestRate: 6.5,
    loanYears: 30,
    propertyTax: 5000,
    homeInsurance: 1400,
    hoaFee: 150,
  });

  const loanAmount = Math.max(0, calc.homePrice - calc.downPayment);
  const monthlyRate = calc.interestRate / 100 / 12;
  const totalPayments = calc.loanYears * 12;

  const monthlyPrincipalInterest =
    monthlyRate > 0 && totalPayments > 0
      ? Math.round(
          (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
            (Math.pow(1 + monthlyRate, totalPayments) - 1)
        )
      : 0;

  const monthlyTax = Math.round(calc.propertyTax / 12);
  const monthlyInsurance = Math.round(calc.homeInsurance / 12);
  const totalMonthly = monthlyPrincipalInterest + monthlyTax + monthlyInsurance + calc.hoaFee;

  return (
    <div className="bg-[#0A2647] border-2 border-[#C9A227]/50 rounded-3xl p-8 sm:p-10 shadow-premium-xl text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <span className="text-[#C9A227] text-xs font-heading font-extrabold uppercase tracking-widest">
            Interactive Financial Tool
          </span>
          <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1">
            Mortgage Payment Calculator
          </h3>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
          <span className="text-xs text-slate-300 block">Total Estimated Monthly</span>
          <span className="text-3xl font-heading font-extrabold text-[#C9A227] font-mono">
            ${totalMonthly.toLocaleString()} <span className="text-sm font-normal text-white">/mo</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6 font-body">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-200 mb-2">
              <span>Home Purchase Price</span>
              <span className="text-[#C9A227] font-mono text-sm">${calc.homePrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="150000"
              max="3000000"
              step="25000"
              value={calc.homePrice}
              onChange={(e) => setCalc({ ...calc, homePrice: parseInt(e.target.value) || 0 })}
              className="w-full accent-[#C9A227] h-2 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-200 mb-2">
              <span>Down Payment ({Math.round((calc.downPayment / (calc.homePrice || 1)) * 100)}%)</span>
              <span className="text-[#C9A227] font-mono text-sm">${calc.downPayment.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max={calc.homePrice * 0.5}
              step="5000"
              value={calc.downPayment}
              onChange={(e) => setCalc({ ...calc, downPayment: parseInt(e.target.value) || 0 })}
              className="w-full accent-[#C9A227] h-2 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="15"
                value={calc.interestRate}
                onChange={(e) => setCalc({ ...calc, interestRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A227]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Loan Term (Years)</label>
              <select
                value={calc.loanYears}
                onChange={(e) => setCalc({ ...calc, loanYears: parseInt(e.target.value) })}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A227]"
              >
                <option value={30} className="bg-white text-slate-900">30-Year Fixed</option>
                <option value={20} className="bg-white text-slate-900">20-Year Fixed</option>
                <option value={15} className="bg-white text-slate-900">15-Year Fixed</option>
                <option value={10} className="bg-white text-slate-900">10-Year Fixed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#07162C] border border-[#C9A227]/30 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-heading font-bold text-white text-base mb-4 border-b border-slate-800 pb-2">
              Monthly Payment Breakdown
            </h4>
            <div className="space-y-3 font-body text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Principal & Interest</span>
                <span className="font-bold text-white font-mono">${monthlyPrincipalInterest.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Property Tax</span>
                <span className="font-bold text-white font-mono">${monthlyTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Home Insurance</span>
                <span className="font-bold text-white font-mono">${monthlyInsurance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>HOA Dues</span>
                <span className="font-bold text-white font-mono">${calc.hoaFee.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <a
              href="/contact"
              className="inline-block w-full bg-[#C9A227] text-[#0A2647] font-bold text-xs py-3 rounded-xl hover:scale-105 transition-all shadow-gold"
            >
              Get Pre-Approved for This Loan →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
