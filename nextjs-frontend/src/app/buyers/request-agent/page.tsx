'use client';

import React, { useState } from 'react';
import { PageHero } from '@/components/ui/PageTemplate';
import { apiPost, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Turnstile from '@/components/Turnstile';

interface FormData {
  name: string;
  email: string;
  phone: string;
  budgetMin: string;
  budgetMax: string;
  preferredArea: string;
  propertyType: string;
  timeline: string;
}

const initial: FormData = {
  name: '',
  email: '',
  phone: '',
  budgetMin: '',
  budgetMax: '',
  preferredArea: '',
  propertyType: '',
  timeline: '',
};

const toNumber = (value: string): number | undefined => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
};

export default function RequestAgentPage() {
  const [form, setForm] = useState<FormData>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const { notifyError } = useToast();

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const [firstName, ...rest] = form.name.trim().split(/\s+/);
    setLoading(true);
    try {
      await apiPost('/forms/buyer-request', {
        first_name: firstName || form.name,
        last_name: rest.join(' ') || '-',
        email: form.email,
        phone: form.phone || undefined,
        budget_min: toNumber(form.budgetMin),
        budget_max: toNumber(form.budgetMax),
        preferred_cities: form.preferredArea || undefined,
        property_type: form.propertyType || undefined,
        timeline: form.timeline || undefined,
        turnstile_token: turnstileToken || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      notifyError(
        err,
        err instanceof ApiError ? err.message : 'Failed to submit your request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-white">
        <PageHero
          badge="Agent"
          title="Request a Buyer Agent"
          subtitle="Connect with a top local agent who knows your neighborhoods."
        />
        <section className="py-20 md:py-24">
          <div className="max-w-xl mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0A2647] mb-4">
              Request Submitted!
            </h2>
            <p className="font-body text-gray-600 mb-8">
              Thank you, {form.name}. One of our buyer agents will reach out to you at{' '}
              {form.email} within 24 hours to discuss your home buying needs.
            </p>
            <button
              onClick={() => {
                setForm(initial);
                setSubmitted(false);
              }}
              className="bg-[#0A2647] text-white font-heading font-semibold px-8 py-3 rounded-lg hover:bg-[#0A2647]/90 transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Agent"
        title="Request a Buyer Agent"
        subtitle="Connect with a top local agent who knows your neighborhoods."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="request-agent-name" className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                  Full Name
                </label>
                <input
                  id="request-agent-name"
                  name="name"
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
                <label htmlFor="request-agent-email" className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                  Email
                </label>
                <input
                  id="request-agent-email"
                  name="email"
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
              <label htmlFor="request-agent-phone" className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                Phone
              </label>
              <input
                id="request-agent-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="request-agent-budget-min" className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                  Budget Range (Min)
                </label>
                <input
                  id="request-agent-budget-min"
                  name="budgetMin"
                  type="text"
                  inputMode="numeric"
                  value={form.budgetMin}
                  onChange={(e) => update('budgetMin', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                  placeholder="$200,000"
                />
              </div>
              <div>
                <label htmlFor="request-agent-budget-max" className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                  Budget Range (Max)
                </label>
                <input
                  id="request-agent-budget-max"
                  name="budgetMax"
                  type="text"
                  inputMode="numeric"
                  value={form.budgetMax}
                  onChange={(e) => update('budgetMax', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                  placeholder="$500,000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="request-agent-area" className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                Preferred Area
              </label>
              <input
                id="request-agent-area"
                name="preferredArea"
                type="text"
                autoComplete="address-level2"
                value={form.preferredArea}
                onChange={(e) => update('preferredArea', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                placeholder="e.g. Downtown, North Suburbs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="request-agent-property-type" className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                  Property Type
                </label>
                <select
                  id="request-agent-property-type"
                  name="propertyType"
                  value={form.propertyType}
                  onChange={(e) => update('propertyType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] bg-white"
                >
                  <option value="">Select type...</option>
                  <option value="single-family">Single Family</option>
                  <option value="condo">Condo / Townhouse</option>
                  <option value="multi-family">Multi-Family</option>
                  <option value="land">Land / Lot</option>
                  <option value="new-construction">New Construction</option>
                </select>
              </div>
              <div>
                <label htmlFor="request-agent-timeline" className="block font-heading text-sm font-semibold text-[#0A2647] mb-2">
                  Timeline
                </label>
                <select
                  id="request-agent-timeline"
                  name="timeline"
                  value={form.timeline}
                  onChange={(e) => update('timeline', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] bg-white"
                >
                  <option value="">When are you looking to buy?</option>
                  <option value="immediately">Immediately</option>
                  <option value="1-3-months">1 - 3 Months</option>
                  <option value="3-6-months">3 - 6 Months</option>
                  <option value="6-plus-months">6+ Months</option>
                  <option value="just-exploring">Just Exploring</option>
                </select>
              </div>
            </div>

            <Turnstile onVerify={setTurnstileToken} className="flex justify-center" />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#C9A227]/90 transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
