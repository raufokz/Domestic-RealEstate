'use client';

import React, { useState } from 'react';
import { PageHero } from '@/components/ui/PageTemplate';

interface FormData {
  name: string;
  email: string;
  phone: string;
  budget: string;
  propertyType: string;
  timeline: string;
}

const initial: FormData = {
  name: '',
  email: '',
  phone: '',
  budget: '',
  propertyType: '',
  timeline: '',
};

export default function InquiryPage() {
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
          badge="Inquiry"
          title="Investor Inquiry"
          subtitle="Connect with our investor team to discuss opportunities and strategy."
        />
        <section className="py-20 md:py-24">
          <div className="max-w-xl mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0A2647] mb-4">
              Inquiry Submitted!
            </h2>
            <p className="font-body text-gray-600 mb-8">
              Thank you, {form.name}. One of our investor specialists will contact you at{' '}
              {form.email} within 24 hours to discuss your investment goals.
            </p>
            <button
              onClick={() => {
                setForm(initial);
                setSubmitted(false);
              }}
              className="bg-[#0A2647] text-white font-heading font-semibold px-8 py-3 rounded-lg hover:bg-[#0A2647]/90 transition-colors"
            >
              Submit Another Inquiry
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Inquiry"
        title="Investor Inquiry"
        subtitle="Connect with our investor team to discuss opportunities, strategy, and get matched to deals."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                Phone
              </label>
              <input
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                Investment Budget
              </label>
              <select
                value={form.budget}
                onChange={(e) => update('budget', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] bg-white"
              >
                <option value="">Select budget range...</option>
                <option value="under-100k">Under $100,000</option>
                <option value="100k-250k">$100,000 – $250,000</option>
                <option value="250k-500k">$250,000 – $500,000</option>
                <option value="500k-1m">$500,000 – $1,000,000</option>
                <option value="over-1m">Over $1,000,000</option>
              </select>
            </div>

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
                  <option value="commercial">Commercial</option>
                  <option value="land">Land / Lot</option>
                  <option value="any">Open to Any</option>
                </select>
              </div>
              <div>
                <label className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                  Timeline
                </label>
                <select
                  value={form.timeline}
                  onChange={(e) => update('timeline', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] bg-white"
                >
                  <option value="">When are you looking to invest?</option>
                  <option value="immediately">Immediately</option>
                  <option value="1-3-months">1 – 3 Months</option>
                  <option value="3-6-months">3 – 6 Months</option>
                  <option value="6-plus-months">6+ Months</option>
                  <option value="just-exploring">Just Exploring</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#C9A227]/90 transition-colors text-lg"
            >
              Submit Inquiry
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
