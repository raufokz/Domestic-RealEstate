'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiPost } from '@/lib/api';
import ChatWidgetWrapper from '@/components/ai/ChatWidgetWrapper';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export default function BrokerageJoinPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    agent_count: '',
    states: '',
    website: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost("/marketing/contact", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: "Brokerage Partnership Application - " + (formData.company || "New Brokerage"),
        message: [
          formData.company ? `Company: ${formData.company}` : null,
          formData.agent_count ? `Agent Count: ${formData.agent_count}` : null,
          formData.states ? `States: ${formData.states}` : null,
          formData.website ? `Website: ${formData.website}` : null,
          formData.message ? `Message: ${formData.message}` : null,
        ].filter(Boolean).join("\n"),
        source: "brokerage_application",
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
            <p className="text-gray-600 text-lg mb-6">Thank you for your interest in partnering with Domestic Real Estate. Our team will contact you within 48 hours.</p>
            <Link href="/" className="inline-block bg-[#0A2647] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#0A2647]/90 transition-colors">Return to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Brokerage Partnership"
        title="Join as a Brokerage Partner"
        subtitle="Complete the application to explore partnership opportunities with Domestic Real Estate."
      />

      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0A2647] mb-2 font-heading">Contact Name *</label>
                  <input type="text" name="name" autoComplete="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent font-body" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0A2647] mb-2 font-heading">Email *</label>
                  <input type="email" name="email" autoComplete="email" inputMode="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent font-body" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0A2647] mb-2 font-heading">Brokerage Name *</label>
                  <input type="text" name="company" autoComplete="organization" value={formData.company} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent font-body" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0A2647] mb-2 font-heading">Phone</label>
                  <input type="tel" name="phone" autoComplete="tel" inputMode="tel" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent font-body" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0A2647] mb-2 font-heading">Number of Agents</label>
                <select name="agent_count" value={formData.agent_count} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent font-body">
                  <option value="">Select agent count</option>
                  <option value="1-5">1 - 5 agents</option>
                  <option value="6-20">6 - 20 agents</option>
                  <option value="21-50">21 - 50 agents</option>
                  <option value="50+">50+ agents</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0A2647] mb-2 font-heading">States Operated</label>
                <input type="text" name="states" value={formData.states} onChange={handleChange} placeholder="e.g., Texas, California, Florida" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent font-body" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0A2647] mb-2 font-heading">Website</label>
                <input type="url" name="website" autoComplete="url" value={formData.website} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent font-body" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0A2647] mb-2 font-heading">Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows={4} placeholder="Tell us about your brokerage and what you're looking for in a partnership..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent font-body" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#C9A227] text-[#0A2647] font-heading font-bold py-4 rounded-xl hover:bg-[#C9A227]/90 transition-colors disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <CTASection
        title="Questions About Partnership?"
        subtitle="Our brokerage development team is ready to discuss how we can support your growth."
        primaryAction={{ label: 'Schedule a Call', href: '/contact' }}
        secondaryAction={{ label: 'Back to Brokerages', href: '/brokerages' }}
      />

      <ChatWidgetWrapper context="brokerage" leadType="brokerage" />
    </main>
  );
}
