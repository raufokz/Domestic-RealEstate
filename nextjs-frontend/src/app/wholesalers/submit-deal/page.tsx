'use client';

import { useState, type FormEvent } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

const PROPERTY_TYPES = ['Single Family', 'Multi Family', 'Condo', 'Townhouse', 'Land', 'Commercial'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Needs Work', 'Major Renovation'];

export default function SubmitDealPage() {
  const [form, setForm] = useState({
    address: '',
    city: '',
    state: '',
    askingPrice: '',
    arv: '',
    repairEstimate: '',
    propertyType: '',
    condition: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
              <button onClick={() => { setSubmitted(false); setForm({ address:'', city:'', state:'', askingPrice:'', arv:'', repairEstimate:'', propertyType:'', condition:'', description:'' }); }} className="bg-[#0A2647] text-white font-heading font-semibold px-6 py-3 rounded-lg hover:bg-[#0A2647]/90 transition-colors">
                Submit Another Deal
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 md:p-12 border border-gray-100 space-y-6">
              <div>
                <label className={labelClass}>Property Address *</label>
                <input type="text" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>City *</label>
                  <input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State *</label>
                  <select required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass}>
                    <option value="">Select State</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Asking Price ($) *</label>
                  <input type="number" required value={form.askingPrice} onChange={(e) => setForm({ ...form, askingPrice: e.target.value })} placeholder="150000" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>After Repair Value (ARV) ($)</label>
                  <input type="number" value={form.arv} onChange={(e) => setForm({ ...form, arv: e.target.value })} placeholder="250000" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Estimated Repair Cost ($)</label>
                <input type="number" value={form.repairEstimate} onChange={(e) => setForm({ ...form, repairEstimate: e.target.value })} placeholder="30000" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Property Type *</label>
                  <select required value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} className={inputClass}>
                    <option value="">Select Type</option>
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Property Condition *</label>
                  <select required value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={inputClass}>
                    <option value="">Select Condition</option>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Additional details about the property..." className={inputClass + ' resize-none'} />
              </div>
              <button type="submit" className="w-full bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#C9A227]/90 transition-colors text-lg">
                Submit Deal for Review
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
