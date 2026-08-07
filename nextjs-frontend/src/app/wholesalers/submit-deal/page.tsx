'use client';

import { useState, type FormEvent } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';
import { apiPost, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

const PROPERTY_TYPES = ['Single Family', 'Multi Family', 'Condo', 'Townhouse', 'Land', 'Commercial'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Needs Work', 'Major Renovation'];

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  askingPrice: '',
  arv: '',
  repairEstimate: '',
  propertyType: '',
  condition: '',
  description: '',
};

export default function SubmitDealPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { notifyError } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const notes = [
        `Property: ${form.address}, ${form.city}, ${form.state}`,
        `Property type: ${form.propertyType}`,
        `Condition: ${form.condition}`,
        `Asking price: $${form.askingPrice}`,
        form.arv ? `ARV: $${form.arv}` : null,
        form.repairEstimate ? `Estimated repair cost: $${form.repairEstimate}` : null,
        form.description ? `Description: ${form.description}` : null,
      ].filter(Boolean).join('\n');

      await apiPost('/leads/capture', {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        type: 'seller',
        source: 'wholesaler_deal_submission',
        location: `${form.city}, ${form.state}`,
        property_type: form.propertyType,
        notes,
      });
      setSubmitted(true);
    } catch (err) {
      notifyError(
        err,
        err instanceof ApiError ? err.message : 'Failed to submit your deal. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-lg border border-gray-300 font-body text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent transition-colors';
  const labelClass = 'block font-heading text-sm font-semibold text-[#0A2647] mb-2';

  return (
    <main>
      <PageHero
        badge="Submit a Deal"
        title="Submit Your Wholesale Deal"
        subtitle="Fill in the property details below. Our team reviews every submission within 24 hours."
      />
      <section className="py-20 md:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-4">Deal Submitted Successfully</h2>
              <p className="font-body text-gray-600 mb-8">Our team will review your submission and get back to you within 24 hours.</p>
              <button onClick={() => { setSubmitted(false); setForm(INITIAL_FORM); }} className="bg-[#0A2647] text-white font-heading font-semibold px-6 py-3 rounded-lg hover:bg-[#0A2647]/90 transition-colors">
                Submit Another Deal
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 md:p-12 border border-gray-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="deal-first-name" className={labelClass}>Your First Name *</label>
                  <input id="deal-first-name" name="firstName" type="text" autoComplete="given-name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Jane" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="deal-last-name" className={labelClass}>Your Last Name *</label>
                  <input id="deal-last-name" name="lastName" type="text" autoComplete="family-name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="deal-email" className={labelClass}>Your Email *</label>
                  <input id="deal-email" name="email" type="email" autoComplete="email" inputMode="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="deal-phone" className={labelClass}>Your Phone</label>
                  <input id="deal-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="deal-address" className={labelClass}>Property Address *</label>
                <input id="deal-address" name="address" type="text" autoComplete="street-address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="deal-city" className={labelClass}>City *</label>
                  <input id="deal-city" name="city" type="text" autoComplete="address-level2" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="deal-state" className={labelClass}>State *</label>
                  <select id="deal-state" name="state" autoComplete="address-level1" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass}>
                    <option value="">Select State</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="deal-asking-price" className={labelClass}>Asking Price ($) *</label>
                  <input id="deal-asking-price" name="askingPrice" type="number" required value={form.askingPrice} onChange={(e) => setForm({ ...form, askingPrice: e.target.value })} placeholder="150000" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="deal-arv" className={labelClass}>After Repair Value (ARV) ($)</label>
                  <input id="deal-arv" name="arv" type="number" value={form.arv} onChange={(e) => setForm({ ...form, arv: e.target.value })} placeholder="250000" className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="deal-repair-estimate" className={labelClass}>Estimated Repair Cost ($)</label>
                <input id="deal-repair-estimate" name="repairEstimate" type="number" value={form.repairEstimate} onChange={(e) => setForm({ ...form, repairEstimate: e.target.value })} placeholder="30000" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="deal-property-type" className={labelClass}>Property Type *</label>
                  <select id="deal-property-type" name="propertyType" required value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} className={inputClass}>
                    <option value="">Select Type</option>
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="deal-condition" className={labelClass}>Property Condition *</label>
                  <select id="deal-condition" name="condition" required value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={inputClass}>
                    <option value="">Select Condition</option>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="deal-description" className={labelClass}>Description</label>
                <textarea id="deal-description" name="description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Additional details about the property..." className={inputClass + ' resize-none'} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#C9A227]/90 transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Submitting...' : 'Submit Deal for Review'}
              </button>
            </form>
          )}
        </div>
      </section>
      <CTASection
        title="Need Help With Your Deal?"
        subtitle="Our wholesaling team is here to assist you every step of the way."
        primaryAction={{ label: 'Contact Us', href: '/wholesalers/inquiry' }}
        secondaryAction={{ label: 'View Deals', href: '/wholesalers/deals' }}
      />
    </main>
  );
}
