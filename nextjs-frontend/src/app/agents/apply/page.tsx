'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiPost } from '@/lib/api';
import { useToast } from '@/components/Toast';
import ChatWidgetWrapper from '@/components/ai/ChatWidgetWrapper';
import JsonLd from '@/components/seo/JsonLd';
import { SITE_URL } from '@/lib/seo';

export default function AgentApplicationPage() {
  const { success, notifyError } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    license_number: '',
    brokerage: '',
    years_experience: '',
    markets_served: '',
    languages: '',
    availability: 'full-time',
    bio: '',
    social_links: {
      linkedin: '',
      facebook: '',
      instagram: '',
      website: '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const socialKey = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost('/forms/agent-application', formData);
      setSubmitted(true);
      success('Your agent application has been submitted successfully! Our managing broker will review your application within 24 hours.', 'Application Submitted');
    } catch (err) {
      notifyError(err, 'Failed to submit application. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const applySchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: 'Licensed Real Estate Agent & Partner Realtor',
    description: 'Join Domestic Real Estate as a licensed agent. Enjoy 90/10 commission splits, zero monthly fees, AI leads, and 1-on-1 brokerage support.',
    identifier: {
      '@type': 'PropertyValue',
      name: 'Domestic Real Estate',
      value: 'AGENT-APP-2026',
    },
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Domestic Real Estate',
      sameAs: SITE_URL,
    },
    employmentType: 'FULL_TIME',
    jobLocationType: 'TELECOMMUTE',
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 flex items-center justify-center">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-slate-200 space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 font-bold text-4xl">
              ✓
            </div>
            <h1 className="font-heading text-3xl font-extrabold text-[#0A2647]">Application Submitted!</h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              Thank you for applying to join the Domestic Real Estate agent network. Our broker team will review your license and credentials within 24 hours.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Link href="/" className="bg-[#0A2647] text-white font-bold text-xs px-6 py-3.5 rounded-xl hover:bg-[#07162C] transition-all uppercase tracking-wider">
                Return to Home
              </Link>
              <Link href="/agents" className="bg-[#C9A227] text-[#0A2647] font-bold text-xs px-6 py-3.5 rounded-xl hover:bg-amber-400 transition-all uppercase tracking-wider shadow-gold">
                Browse Directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-[#0A2647] font-body py-12">
      <JsonLd data={applySchema} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
            🤝 Join Our Brokerage Network
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-[#0A2647]">
            Agent Partner <span className="text-[#C9A227]">Application</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
            Take your production to the next level with 90/10 splits, zero desk fees, and automated AI lead generation.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex justify-between items-center max-w-2xl mx-auto">
          {[
            { step: 1, label: 'Contact & License' },
            { step: 2, label: 'Markets & Specialty' },
            { step: 3, label: 'Bio & Socials' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setCurrentStep(item.step)}
              className={`flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                currentStep === item.step
                  ? 'text-[#C9A227]'
                  : currentStep > item.step
                  ? 'text-[#0A2647]'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                  currentStep === item.step
                    ? 'bg-[#C9A227] text-[#0A2647] shadow-gold'
                    : currentStep > item.step
                    ? 'bg-[#0A2647] text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {item.step}
              </span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Application Form Box */}
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="font-heading text-2xl font-bold text-[#0A2647] pb-2 border-b border-slate-100">
                  Step 1: Contact &amp; License Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      autoComplete="given-name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      placeholder="Jane"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C9A227] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      autoComplete="family-name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      placeholder="Smith"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C9A227] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="jane.smith@realty.com"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C9A227] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="(555) 000-0000"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C9A227] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Real Estate License # *</label>
                    <input
                      type="text"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleChange}
                      required
                      placeholder="RE-1092837"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C9A227] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Brokerage *</label>
                    <input
                      type="text"
                      name="brokerage"
                      value={formData.brokerage}
                      onChange={handleChange}
                      required
                      placeholder="Premier Realty Group"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C9A227] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="bg-[#0A2647] hover:bg-[#07162C] text-white font-heading font-bold text-xs px-8 py-3.5 rounded-xl transition-all uppercase tracking-wider"
                  >
                    Continue to Step 2 →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="font-heading text-2xl font-bold text-[#0A2647] pb-2 border-b border-slate-100">
                  Step 2: Experience &amp; Target Markets
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      name="years_experience"
                      value={formData.years_experience}
                      onChange={handleChange}
                      min="0"
                      placeholder="5"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C9A227] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status / Availability</label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C9A227] focus:outline-none"
                    >
                      <option value="full-time">Full-time Agent</option>
                      <option value="part-time">Part-time Agent</option>
                      <option value="team-leader">Team Leader</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Metro Cities / Zip Codes</label>
                    <input
                      type="text"
                      name="markets_served"
                      value={formData.markets_served}
                      onChange={handleChange}
                      placeholder="e.g., Miami, Fort Lauderdale, 33139"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C9A227] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Languages Spoken</label>
                    <input
                      type="text"
                      name="languages"
                      value={formData.languages}
                      onChange={handleChange}
                      placeholder="e.g., English, Spanish, French"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C9A227] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-6 py-3.5 rounded-xl transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="bg-[#0A2647] hover:bg-[#07162C] text-white font-heading font-bold text-xs px-8 py-3.5 rounded-xl transition-all uppercase tracking-wider"
                  >
                    Continue to Final Step →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="font-heading text-2xl font-bold text-[#0A2647] pb-2 border-b border-slate-100">
                  Step 3: Agent Bio &amp; Professional Socials
                </h2>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Short Professional Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Share your sales background, awards, local area expertise, and career goals..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C9A227] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                    <input
                      type="url"
                      name="social_linkedin"
                      value={formData.social_links.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C9A227] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Instagram Handle / URL</label>
                    <input
                      type="url"
                      name="social_instagram"
                      value={formData.social_links.instagram}
                      onChange={handleChange}
                      placeholder="https://instagram.com/..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C9A227] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-6 py-3.5 rounded-xl transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-black text-xs px-8 py-3.5 rounded-xl transition-all shadow-gold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Submitting Application...' : 'Submit Application Now →'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      <ChatWidgetWrapper context="agent" leadType="agent" />
    </div>
  );
}

