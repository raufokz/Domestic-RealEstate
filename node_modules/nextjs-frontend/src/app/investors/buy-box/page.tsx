'use client';

import React, { useState } from 'react';
import { PageHero } from '@/components/ui/PageTemplate';

interface FormData {
  propertyType: string;
  priceMin: string;
  priceMax: string;
  targetROI: string;
  areas: string;
  condition: string;
  strategy: string;
  notes: string;
}

const initial: FormData = {
  propertyType: '',
  priceMin: '',
  priceMax: '',
  targetROI: '',
  areas: '',
  condition: '',
  strategy: '',
  notes: '',
};

export default function BuyBoxPage() {
  const [form, setForm] = useState<FormData>(initial);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-white">
        <PageHero
          badge="Buy Box"
          title="Your Buy Box Is Set"
          subtitle="We'll match deals to your criteria and notify you when new opportunities arise."
        />
        <section className="py-20 md:py-24">
          <div className="max-w-xl mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0A2647] mb-4">
              Buy Box Submitted!
            </h2>
            <p className="font-body text-gray-600 mb-8">
              Your investment criteria have been saved. We&apos;ll send you matching deals as soon as they become available. Expect your first matches within 48 hours.
            </p>
            <button
              onClick={() => {
                setForm(initial);
                setSubmitted(false);
              }}
              className="bg-[#0A2647] text-white font-heading font-semibold px-8 py-3 rounded-lg hover:bg-[#0A2647]/90 transition-colors"
            >
              Update Criteria
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Buy Box"
        title="Define Your Buy Box"
        subtitle="Tell us exactly what you're looking for and we'll match deals to your investment criteria."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                  Property Type
                </label>
                <select
                  value={form.propertyType}
                  onChange={(e) => update('propertyType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] bg-white"
                >
                  <option value="">Select type...</option>
                  <option value="single-family">Single Family</option>
                  <option value="multi-family">Multi-Family</option>
                  <option value="condo">Condo / Townhouse</option>
                  <option value="commercial">Commercial</option>
                  <option value="land">Land / Lot</option>
                </select>
              </div>
              <div>
                <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                  Investment Strategy
                </label>
                <select
                  value={form.strategy}
                  onChange={(e) => update('strategy', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] bg-white"
                >
                  <option value="">Select strategy...</option>
                  <option value="buy-and-hold">Buy & Hold</option>
                  <option value="fix-and-flip">Fix & Flip</option>
                  <option value="brrrr">BRRRR</option>
                  <option value="turnkey">Turnkey Rental</option>
                  <option value="wholesale">Wholesale</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                  Min Price
                </label>
                <input
                  type="text"
                  value={form.priceMin}
                  onChange={(e) => update('priceMin', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                  placeholder="$100,000"
                />
              </div>
              <div>
                <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                  Max Price
                </label>
                <input
                  type="text"
                  value={form.priceMax}
                  onChange={(e) => update('priceMax', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                  placeholder="$500,000"
                />
              </div>
            </div>

            <div>
              <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                Target ROI (%)
              </label>
              <input
                type="text"
                value={form.targetROI}
                onChange={(e) => update('targetROI', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                placeholder="e.g. 15%"
              />
            </div>

            <div>
              <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                Preferred Areas
              </label>
              <input
                type="text"
                value={form.areas}
                onChange={(e) => update('areas', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                placeholder="e.g. East Atlanta, Decatur, Midtown"
              />
            </div>

            <div>
              <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                Property Condition
              </label>
              <select
                value={form.condition}
                onChange={(e) => update('condition', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] bg-white"
              >
                <option value="">No preference</option>
                <option value="turnkey">Turnkey / Move-in Ready</option>
                <option value="light-rehab">Light Rehab</option>
                <option value="heavy-rehab">Heavy Rehab / Distressed</option>
                <option value="new-construction">New Construction</option>
              </select>
            </div>

            <div>
              <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                Additional Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] resize-none"
                placeholder="Any other criteria or preferences..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#C9A227]/90 transition-colors text-lg"
            >
              Save My Buy Box
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
