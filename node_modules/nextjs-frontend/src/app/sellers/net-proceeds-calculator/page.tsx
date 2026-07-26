'use client';

import { useState, useMemo } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function NetProceedsCalculatorPage() {
  const [salePrice, setSalePrice] = useState('');
  const [mortgageBalance, setMortgageBalance] = useState('');
  const [commission, setCommission] = useState('5');
  const [closingCosts, setClosingCosts] = useState('2');

  const parsed = useMemo(() => {
    const price = parseFloat(salePrice) || 0;
    const mortgage = parseFloat(mortgageBalance) || 0;
    const commPct = parseFloat(commission) || 0;
    const closingPct = parseFloat(closingCosts) || 0;

    const agentCommission = price * (commPct / 100);
    const closing = price * (closingPct / 100);
    const totalCosts = agentCommission + closing;
    const netProceeds = price - mortgage - totalCosts;

    return { price, mortgage, agentCommission, closing, totalCosts, netProceeds };
  }, [salePrice, mortgageBalance, commission, closingCosts]);

  const hasValues = parsed.price > 0;

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Calculator"
        title="Net Proceeds Calculator"
        subtitle="Estimate how much you'll walk away with after selling your home. Factor in your mortgage, agent commissions, and closing costs."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-6">Enter Your Details</h2>

                <div className="space-y-5">
                  <div>
                    <label className="block font-body text-sm font-medium text-gray-700 mb-2">Expected Sale Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-body">$</span>
                      <input
                        type="number"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        placeholder="500,000"
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 font-body focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-sm font-medium text-gray-700 mb-2">Remaining Mortgage Balance</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-body">$</span>
                      <input
                        type="number"
                        value={mortgageBalance}
                        onChange={(e) => setMortgageBalance(e.target.value)}
                        placeholder="250,000"
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 font-body focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-sm font-medium text-gray-700 mb-2">Agent Commission (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        value={commission}
                        onChange={(e) => setCommission(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 pr-8 py-3 font-body focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-body">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-sm font-medium text-gray-700 mb-2">Estimated Closing Costs (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        value={closingCosts}
                        onChange={(e) => setClosingCosts(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 pr-8 py-3 font-body focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-body">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div>
              {hasValues ? (
                <div className="bg-[#0A2647] rounded-3xl p-8 text-white">
                  <h2 className="font-heading text-2xl font-bold mb-8">Your Estimated Net Proceeds</h2>

                  <div className="bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-2xl p-6 text-center mb-8">
                    <p className="font-body text-white/60 text-sm uppercase tracking-wider mb-2">Net Proceeds</p>
                    <p className={`font-heading text-5xl md:text-6xl font-bold ${parsed.netProceeds >= 0 ? 'text-[#C9A227]' : 'text-red-400'}`}>
                      {fmt(parsed.netProceeds)}
                    </p>
                    <p className="font-body text-white/50 text-sm mt-2">Estimated take-home after all costs</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="font-body text-white/70">Sale Price</span>
                      <span className="font-heading font-semibold">{fmt(parsed.price)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="font-body text-white/70">Mortgage Payoff</span>
                      <span className="font-heading font-semibold text-red-300">-{fmt(parsed.mortgage)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="font-body text-white/70">Agent Commission ({commission}%)</span>
                      <span className="font-heading font-semibold text-red-300">-{fmt(parsed.agentCommission)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="font-body text-white/70">Closing Costs ({closingCosts}%)</span>
                      <span className="font-heading font-semibold text-red-300">-{fmt(parsed.closing)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3">
                      <span className="font-body text-white/90 font-medium">Total Costs</span>
                      <span className="font-heading font-bold text-red-300">{fmt(parsed.totalCosts)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-3xl p-12 border border-gray-100 flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#0A2647]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🧮</span>
                    </div>
                    <p className="font-heading text-lg font-bold text-[#0A2647] mb-2">Enter Your Numbers</p>
                    <p className="font-body text-gray-500 text-sm">Fill in the form to see your estimated net proceeds in real-time.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="font-body text-gray-500 text-sm">
            <strong className="text-gray-700">Disclaimer:</strong> This calculator provides estimates only. Actual costs may vary based on your specific transaction, local taxes, HOA fees, and negotiated terms. Consult with your agent for a precise net proceeds analysis.
          </p>
        </div>
      </section>

      <CTASection
        title="Want a Precise Estimate?"
        subtitle="Our agents can provide a detailed net proceeds analysis based on your specific property and local market conditions."
        primaryAction={{ label: 'Talk to an Agent', href: '/sellers/request-valuation' }}
        secondaryAction={{ label: 'Back to Sellers', href: '/sellers' }}
      />
    </main>
  );
}
