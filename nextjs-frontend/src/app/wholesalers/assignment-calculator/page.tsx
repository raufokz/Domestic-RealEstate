'use client';

import { useState, type FormEvent } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export default function AssignmentCalculatorPage() {
  const [contractPrice, setContractPrice] = useState('');
  const [assignmentFee, setAssignmentFee] = useState('');
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    setCalculated(true);
  };

  const contract = parseFloat(contractPrice) || 0;
  const fee = parseFloat(assignmentFee) || 0;
  const totalToBuyer = contract + fee;
  const profitMargin = totalToBuyer > 0 ? ((fee / totalToBuyer) * 100).toFixed(1) : '0';

  const inputClass = 'w-full px-4 py-3 rounded-lg border border-gray-300 font-body text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent transition-colors';
  const labelClass = 'block font-heading text-sm font-semibold text-[#0A2647] mb-2';

  return (
    <main>
      <PageHero
        badge="Calculator"
        title="Assignment Fee Calculator"
        subtitle="Quickly calculate the total cost to your end buyer and your profit from an assignment fee."
      />
      <section className="py-20 md:py-24 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleCalculate} className="bg-white rounded-2xl p-8 md:p-12 border border-gray-100 space-y-6">
            <div>
              <label className={labelClass}>Contract Price ($) *</label>
              <input type="number" required value={contractPrice} onChange={(e) => { setContractPrice(e.target.value); setCalculated(false); }} placeholder="150000" className={inputClass} />
              <p className="font-body text-xs text-gray-400 mt-1">The price you have under contract with the seller.</p>
            </div>
            <div>
              <label className={labelClass}>Assignment Fee ($) *</label>
              <input type="number" required value={assignmentFee} onChange={(e) => { setAssignmentFee(e.target.value); setCalculated(false); }} placeholder="20000" className={inputClass} />
              <p className="font-body text-xs text-gray-400 mt-1">Your fee for assigning the contract to the buyer.</p>
            </div>
            <button type="submit" className="w-full bg-[#0A2647] text-white font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#0A2647]/90 transition-colors text-lg">
              Calculate
            </button>
          </form>

          {calculated && (
            <div className="mt-8 bg-white rounded-2xl border-2 border-[#C9A227] p-8 md:p-12">
              <h3 className="font-heading text-xl font-bold text-[#0A2647] mb-6 text-center">Assignment Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="font-body text-gray-600">Contract Price</span>
                  <span className="font-heading font-bold text-[#0A2647]">${contract.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="font-body text-gray-600">Assignment Fee</span>
                  <span className="font-heading font-bold text-[#8B1E3F]">${fee.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-4 bg-[#0A2647]/5 rounded-xl px-4">
                  <span className="font-heading font-bold text-[#0A2647]">Total to End Buyer</span>
                  <span className="font-heading text-2xl font-bold text-[#C9A227]">${totalToBuyer.toLocaleString()}</span>
                </div>
                <div className="text-center pt-2">
                  <p className="font-body text-gray-500 text-sm">Assignment fee represents <span className="font-heading font-bold text-[#8B1E3F]">{profitMargin}%</span> of the total cost</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <CTASection
        title="Ready to Assign?"
        subtitle="Submit your deal and let us connect you with buyers who are ready to close."
        primaryAction={{ label: 'Submit a Deal', href: '/wholesalers/submit-deal' }}
        secondaryAction={{ label: 'Contact Us', href: '/wholesalers/inquiry' }}
      />
    </main>
  );
}
