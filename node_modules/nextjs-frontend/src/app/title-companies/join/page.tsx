'use client';

import { useState } from 'react';
import ChatWidgetWrapper from '@/components/ai/ChatWidgetWrapper';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export default function TitleCompanyJoinPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    state: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/forms/title-company-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
    } catch {
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-card p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-heading text-3xl font-bold text-[#0A2647] mb-4">Application Submitted!</h1>
            <p className="text-gray-600 text-lg mb-6">Thank you for applying to become a title company partner. Our team will reach out within 48 hours.</p>
            <a href="/" className="inline-block bg-[#0A2647] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#0A2647]/90 transition-colors">Return to Home</a>
          </div>
        </div>
      </div>
    );
  }

  const states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Title Partnership"
        title="Join as a Title Partner"
        subtitle="Complete the application below to partner with Domestic Real Estate."
      />

      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#0A2647] mb-2 font-heading">Contact Name *</label>
                <input type="text" name="name" autoComplete="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent font-body" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0A2647] mb-2 font-heading">Email *</label>
                <input type="email" name="email" autoComplete="email" inputMode="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent font-body" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0A2647] mb-2 font-heading">Company Name *</label>
                <input type="text" name="company" autoComplete="organization" value={formData.company} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent font-body" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0A2647] mb-2 font-heading">Primary State *</label>
                <select name="state" value={formData.state} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent font-body">
                  <option value="">Select a state</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#C9A227] text-[#0A2647] font-heading font-bold py-4 rounded-xl hover:bg-[#C9A227]/90 transition-colors disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <CTASection
        title="Have Questions?"
        subtitle="Reach out to our partnerships team and we will guide you through the process."
        primaryAction={{ label: 'Contact Us', href: '/contact' }}
        secondaryAction={{ label: 'Back to Title Partners', href: '/title-companies' }}
      />

      <ChatWidgetWrapper context="title-company" leadType="title_company" />
    </main>
  );
}
