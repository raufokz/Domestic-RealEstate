"use client";

import { useState, useEffect } from "react";

export default function MortgageCalculator() {
  const [dealPreset, setDealPreset] = useState<"starter" | "family" | "luxury">("family");

  const [homePrice, setHomePrice] = useState(500000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);

  // Sync preset choice
  useEffect(() => {
    if (dealPreset === "starter") {
      setHomePrice(250000);
      const dp = Math.round(250000 * (downPaymentPercent / 100));
      setDownPayment(dp);
    } else if (dealPreset === "family") {
      setHomePrice(500000);
      const dp = Math.round(500000 * (downPaymentPercent / 100));
      setDownPayment(dp);
    } else if (dealPreset === "luxury") {
      setHomePrice(1200000);
      const dp = Math.round(1200000 * (downPaymentPercent / 100));
      setDownPayment(dp);
    }
  }, [dealPreset]);

  // Sync downPayment and downPaymentPercent when homePrice or percent changes
  const handlePercentChange = (pct: number) => {
    setDownPaymentPercent(pct);
    setDownPayment(Math.round(homePrice * (pct / 100)));
  };

  const handlePriceChange = (price: number) => {
    setHomePrice(price);
    setDownPayment(Math.round(price * (downPaymentPercent / 100)));
  };

  const handleDownPaymentSlider = (dpVal: number) => {
    setDownPayment(dpVal);
    if (homePrice > 0) {
      setDownPaymentPercent(Math.round((dpVal / homePrice) * 100));
    }
  };

  // derived metrics
  const principal = Math.max(0, homePrice - downPayment);
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;

  let monthlyPI = 0;
  if (principal > 0 && numPayments > 0) {
    if (monthlyRate > 0) {
      monthlyPI = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    } else {
      monthlyPI = principal / numPayments;
    }
  }

  // Property Tax (est. 1.0% of purchase price annually)
  const monthlyPropertyTax = Math.round((homePrice * 0.01) / 12);
  // Home Insurance (est. 0.3% of purchase price annually)
  const monthlyInsurance = Math.round((homePrice * 0.003) / 12);

  const totalMonthlyPayment = Math.round(monthlyPI + monthlyPropertyTax + monthlyInsurance);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Input panel */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h3 className="font-heading text-xl font-bold text-[#0A2647] mb-6">Home Purchase Settings</h3>

        {/* Home Presets */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {(["starter", "family", "luxury"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setDealPreset(t)}
              className={`py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                dealPreset === t
                  ? "bg-[#0A2647] text-white border-transparent shadow-sm cursor-pointer"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              {t === "starter" && "Starter Home"}
              {t === "family" && "Standard Family"}
              {t === "luxury" && "Luxury Estate"}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {/* Home Price */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-body text-sm font-medium text-gray-700">Home Price</label>
              <span className="font-heading font-bold text-[#0A2647]">{formatCurrency(homePrice)}</span>
            </div>
            <input
              type="range"
              min="100000"
              max="2500000"
              step="10000"
              value={homePrice}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>$100K</span>
              <span>$2.5M</span>
            </div>
          </div>

          {/* Down Payment */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-body text-sm font-medium text-gray-700">Down Payment ({downPaymentPercent}%)</label>
              <span className="font-heading font-bold text-[#0A2647]">{formatCurrency(downPayment)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.round(homePrice * 0.9)} // max 90% down payment
              step="1000"
              value={downPayment}
              onChange={(e) => handleDownPaymentSlider(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>$0</span>
              <span>90% Max</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-body text-sm font-medium text-gray-700">Interest Rate</label>
              <span className="font-heading font-bold text-[#0A2647]">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1%</span>
              <span>15%</span>
            </div>
          </div>

          {/* Loan Term Selection */}
          <div>
            <label className="block font-body text-sm font-medium text-gray-700 mb-2">Loan Term</label>
            <div className="grid grid-cols-3 gap-3">
              {[15, 20, 30].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setLoanTerm(yr)}
                  className={`py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                    loanTerm === yr
                      ? "bg-[#0A2647] text-white border-transparent"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {yr} Years
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 shadow-sm text-center">
        <p className="font-body text-gray-500 text-sm mb-1 uppercase tracking-wider font-semibold">Estimated Monthly Payment</p>
        <p className="font-heading text-6xl font-bold text-[#0A2647] mb-2">{formatCurrency(totalMonthlyPayment)}</p>
        <p className="font-body text-gray-400 text-sm mb-8">Principal, Interest, Taxes & Insurance</p>
        
        <div className="space-y-4 text-left border-t border-gray-200 pt-6">
          <div className="flex justify-between font-body text-sm">
            <span className="text-gray-600">Principal & Interest (P&I)</span>
            <span className="font-medium text-[#0A2647]">{formatCurrency(monthlyPI)}</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-gray-600">Property Tax (est. 1.0% annual)</span>
            <span className="font-medium text-[#0A2647]">{formatCurrency(monthlyPropertyTax)}</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-gray-600">Home Insurance (est. 0.3% annual)</span>
            <span className="font-medium text-[#0A2647]">{formatCurrency(monthlyInsurance)}</span>
          </div>
          <div className="border-t border-gray-300 pt-4 flex justify-between font-heading text-lg font-bold">
            <span className="text-gray-700">Total Monthly Payment</span>
            <span className="text-[#C9A227]">{formatCurrency(totalMonthlyPayment)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
