'use client';

import { useState, type FormEvent } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';
import { apiPost, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';

const PROPERTY_TYPES = ['Single Family', 'Multi Family', 'Condo', 'Townhouse', 'Land', 'Commercial'];
const AREAS = ['Houston', 'Memphis', 'Jacksonville', 'Birmingham', 'Atlanta', 'Charlotte', 'Dallas', 'Nashville', 'Other'];

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  budget: '',
  preferredAreas: [] as string[],
  propertyTypes: [] as string[],
};

export default function BuyerListPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { notifyError } = useToast();

  const toggleArrayItem = (field: 'preferredAreas' | 'propertyTypes', value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((v) => v !== value) : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [firstName, ...rest] = form.name.trim().split(/\s+/);
      await apiPost('/leads/capture', {
        first_name: firstName || form.name,
        last_name: rest.join(' ') || undefined,
        email: form.email,
        phone: form.phone,
        type: 'investor',
        source: 'wholesaler_buyer_list_signup',
        location: form.preferredAreas.join(', ') || undefined,
        property_type: form.propertyTypes.join(', ') || undefined,
        notes: form.budget ? `Investment budget: ${form.budget}` : undefined,
      });
      setSubmitted(true);
    } catch (err) {
      notifyError(
        err,
        err instanceof ApiError ? err.message : 'Failed to join the buyer list. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-lg border border-gray-300 font-body text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent transition-colors';
  const labelClass = 'block font-heading text-sm font-semibold text-[#0A2647] mb-2';
  const chipClass = 'px-4 py-2 rounded-full border font-heading text-sm font-medium cursor-pointer transition-colors';

  return (
    <main>
      <PageHero
        badge="Buyer Network"
        title="Join Our Buyer List"
        subtitle="Get exclusive access to off-market wholesale deals matched to your investment criteria."
      />
      <section className="py-20 md:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-4">You&apos;re on the List</h2>
              <p className="font-body text-gray-600 mb-8">We&apos;ll send you deals that match your criteria as soon as they become available.</p>
              <button onClick={() => { setSubmitted(false); setForm(INITIAL_FORM); }} className="bg-[#0A2647] text-white font-heading font-semibold px-6 py-3 rounded-lg hover:bg-[#0A2647]/90 transition-colors">
                Update Preferences
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 md:p-12 border border-gray-100 space-y-6">
              <div>
                <label htmlFor="bl-name" className={labelClass}>Full Name *</label>
                <input id="bl-name" name="name" type="text" autoComplete="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Smith" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bl-email" className={labelClass}>Email Address *</label>
                  <input id="bl-email" name="email" type="email" autoComplete="email" inputMode="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="bl-phone" className={labelClass}>Phone Number *</label>
                  <input id="bl-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="bl-budget" className={labelClass}>Investment Budget ($) *</label>
                <input id="bl-budget" name="budget" type="text" required value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. $100,000 - $300,000" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Preferred Areas</label>
                <div className="flex flex-wrap gap-2">
                  {AREAS.map((area) => (
                    <button key={area} type="button" onClick={() => toggleArrayItem('preferredAreas', area)}
                      className={`${chipClass} ${form.preferredAreas.includes(area) ? 'bg-[#0A2647] text-white border-[#0A2647]' : 'bg-white text-[#0A2647] border-gray-300 hover:border-[#0A2647]'}`}>
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Property Types</label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <button key={type} type="button" onClick={() => toggleArrayItem('propertyTypes', type)}
                      className={`${chipClass} ${form.propertyTypes.includes(type) ? 'bg-[#C9A227] text-[#0A2647] border-[#C9A227]' : 'bg-white text-[#0A2647] border-gray-300 hover:border-[#C9A227]'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#C9A227]/90 transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Joining...' : 'Join the Buyer List'}
              </button>
            </form>
          )}
        </div>
      </section>
      <CTASection
        title="Browse Available Deals"
        subtitle="Check out our current wholesale inventory while you wait for your first match."
        primaryAction={{ label: 'View Deals', href: '/wholesalers/deals' }}
        secondaryAction={{ label: 'Wholesaler Guide', href: '/wholesalers/guide' }}
      />
    </main>
  );
}
