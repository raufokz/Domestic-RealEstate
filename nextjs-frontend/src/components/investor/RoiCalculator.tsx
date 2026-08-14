"use client";

import { useState, useEffect } from "react";

export default function RoiCalculator() {
  const [dealType, setDealType] = useState<"starter" | "mid" | "luxury">("mid");

  const [purchasePrice, setPurchasePrice] = useState(400000);
  const [renovationBudget, setRenovationBudget] = useState(50000);
  const [afterRepairValue, setAfterRepairValue] = useState(550000);

  // Auto-calculated defaults based on selected preset
  useEffect(() => {
    if (dealType === "starter") {
      setPurchasePrice(150000);
      setRenovationBudget(25000);
      setAfterRepairValue(220000);
    } else if (dealType === "mid") {
      setPurchasePrice(400000);
      setRenovationBudget(50000);
      setAfterRepairValue(550000);
    } else if (dealType === "luxury") {
      setPurchasePrice(900000);
      setRenovationBudget(120000);
      setAfterRepairValue(1250000);
    }
  }, [dealType]);

  // Derived metrics
  const totalInvestment = purchasePrice + renovationBudget;
  const grossProfit = afterRepairValue - totalInvestment;

  // Holding costs estimation: 3.0% of purchase price
  const holdingCosts = Math.round(purchasePrice * 0.03);
  // Closing costs estimation: 4.5% of purchase price
  const closingCosts = Math.round(purchasePrice * 0.045);

  const netProfit = grossProfit - holdingCosts - closingCosts;
  const roi = totalInvestment > 0 ? Math.round((netProfit / totalInvestment) * 100) : 0;

  // Utility to format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h3 className="font-heading text-xl font-bold text-[#0A2647] mb-6">Select Deal Profile</h3>
        
        {/* Deal Presets */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {(["starter", "mid", "luxury"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setDealType(t)}
              className={`py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                dealType === t
                  ? "bg-[#0A2647] text-white border-transparent shadow-sm cursor-pointer"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              {t === "starter" && "Starter Flip"}
              {t === "mid" && "Mid-range"}
              {t === "luxury" && "Luxury Deal"}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {/* Purchase Price Input + Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-body text-sm font-medium text-gray-700">Purchase Price</label>
              <span className="font-heading font-bold text-[#0A2647]">{formatCurrency(purchasePrice)}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="2000000"
              step="10000"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>$50K</span>
              <span>$2M</span>
            </div>
          </div>

          {/* Renovation Budget Input + Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-body text-sm font-medium text-gray-700">Renovation Budget</label>
              <span className="font-heading font-bold text-[#0A2647]">{formatCurrency(renovationBudget)}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="500000"
              step="5000"
              value={renovationBudget}
              onChange={(e) => setRenovationBudget(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>$5K</span>
              <span>$500K</span>
            </div>
          </div>

          {/* After Repair Value (ARV) Input + Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-body text-sm font-medium text-gray-700">After Repair Value (ARV)</label>
              <span className="font-heading font-bold text-[#0A2647]">{formatCurrency(afterRepairValue)}</span>
            </div>
            <input
              type="range"
              min="100000"
              max="3000000"
              step="10000"
              value={afterRepairValue}
              onChange={(e) => setAfterRepairValue(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>$100K</span>
              <span>$3M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-8 bg-[#0A2647]/5 py-6 rounded-2xl">
          <p className="font-body text-gray-500 text-sm mb-1 uppercase tracking-wider font-semibold">Estimated Return on Investment</p>
          <p className={`font-heading text-6xl font-bold transition-all ${
            roi >= 15 ? "text-green-600" : roi > 5 ? "text-[#C9A227]" : "text-red-500"
          }`}>{roi}%</p>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between font-body text-sm">
            <span className="text-gray-600">Purchase Price</span>
            <span className="font-medium text-[#0A2647]">{formatCurrency(purchasePrice)}</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-gray-600">Renovation Budget</span>
            <span className="font-medium text-[#0A2647]">{formatCurrency(renovationBudget)}</span>
          </div>
          <div className="flex justify-between font-body text-sm border-b border-gray-200 pb-3">
            <span className="text-gray-600 font-semibold">Total CapEx Investment</span>
            <span className="font-bold text-[#0A2647]">{formatCurrency(totalInvestment)}</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-gray-600">After Repair Value (ARV)</span>
            <span className="font-medium text-[#0A2647]">{formatCurrency(afterRepairValue)}</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-gray-600">Holding Costs (est. 3%)</span>
            <span className="font-medium text-gray-700">{formatCurrency(holdingCosts)}</span>
          </div>
          <div className="flex justify-between font-body text-sm border-b border-gray-200 pb-3">
            <span className="text-gray-600">Closing Costs & Fees (est. 4.5%)</span>
            <span className="font-medium text-gray-700">{formatCurrency(closingCosts)}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="font-heading font-semibold text-gray-700 text-lg">Net Profit Margin</span>
            <span className={`font-heading text-2xl font-bold ${
              netProfit >= 0 ? "text-green-600" : "text-red-500"
            }`}>{formatCurrency(netProfit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
