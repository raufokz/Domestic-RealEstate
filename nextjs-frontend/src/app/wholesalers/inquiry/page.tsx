'use client';

import { useState, type FormEvent } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export default function InquiryPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
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
        badge="Contact"
        title="Wholesaler Inquiry"
        subtitle="Have a question about our wholesaler services? Reach out and our team will get back to you promptly."
      />
      <section className="py-20 md:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-4">Message Sent</h2>
              <p className="font-body text-gray-600 mb-8">Thank you for reaching out. A member of our wholesaling team will respond within one business day.</p>
              <button onClick={() => { setSubmitted(false); setForm({ name:'', email:'', phone:'', message:'' }); }} className="bg-[#0A2647] text-white font-heading font-semibold px-6 py-3 rounded-lg hover:bg-[#0A2647]/90 transition-colors">
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 md:p-12 border border-gray-100 space-y-6">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Smith" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Message *</label>
                <textarea rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us how we can help you..." className={inputClass + ' resize-none'} />
              </div>
              <button type="submit" className="w-full bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#C9A227]/90 transition-colors text-lg">
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>
      <CTASection
        title="Explore Our Wholesaler Tools"
        subtitle="Use our deal calculator, submit properties, and join our buyer network."
        primaryAction={{ label: 'Assignment Calculator', href: '/wholesalers/assignment-calculator' }}
        secondaryAction={{ label: 'Wholesaling Guide', href: '/wholesalers/guide' }}
      />
    </main>
  );
}
