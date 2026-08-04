'use client';

import { useState } from 'react';
import { apiPost } from '@/lib/api';
import { useToast } from '@/components/Toast';
import ChatWidgetWrapper from '@/components/ai/ChatWidgetWrapper';

export default function AgentApplicationPage() {
  const { success, notifyError } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
    availability: '',
    bio: '',
    social_links: {
      linkedin: '',
      facebook: '',
      instagram: '',
      website: '',
    },
    documents: [] as string[],
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
      success('Your application has been submitted successfully! We will review and contact you soon.');
    } catch (err) {
      notifyError(err, 'Failed to submit application. Please try again.');
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
            <h1 className="font-heading text-3xl font-bold text-navy mb-4">Application Submitted!</h1>
            <p className="text-slate-600 text-lg mb-6">
              Thank you for applying to join our agent team. We will review your application and contact you soon.
            </p>
            <a href="/" className="inline-block bg-navy text-white font-semibold px-8 py-3 rounded-xl hover:bg-navy-600 transition-colors">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-navy mb-4">
            Agent <span className="text-gold">Application</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Join our team of elite real estate agents and access premium tools, training, and support.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">First Name *</label>
                  <input
                    type="text"
                    name="first_name" autoComplete="given-name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="last_name" autoComplete="family-name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Email *</label>
                  <input
                    type="email"
                    name="email" autoComplete="email" inputMode="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone" autoComplete="tel" inputMode="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* License & Brokerage */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy mb-6">License & Brokerage</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">License Number *</label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Brokerage *</label>
                  <input
                    type="text"
                    name="brokerage" autoComplete="organization"
                    value={formData.brokerage}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Years of Experience</label>
                  <input
                    type="number"
                    name="years_experience"
                    value={formData.years_experience}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Availability</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  >
                    <option value="">Select availability</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Markets & Languages */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy mb-6">Markets & Languages</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Markets Served</label>
                  <input
                    type="text"
                    name="markets_served"
                    value={formData.markets_served}
                    onChange={handleChange}
                    placeholder="e.g., Los Angeles, Orange County, San Diego"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Languages Spoken</label>
                  <input
                    type="text"
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    placeholder="e.g., English, Spanish, Mandarin"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy mb-6">Professional Bio</h2>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={6}
                placeholder="Tell us about your experience, achievements, and what makes you a great agent..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>

            {/* Social Links */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy mb-6">Social Media & Website</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">LinkedIn</label>
                  <input
                    type="url"
                    name="social_linkedin"
                    value={formData.social_links.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Facebook</label>
                  <input
                    type="url"
                    name="social_facebook"
                    value={formData.social_links.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Instagram</label>
                  <input
                    type="url"
                    name="social_instagram"
                    value={formData.social_links.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Personal Website</label>
                  <input
                    type="url"
                    name="social_website"
                    value={formData.social_links.website}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-bold py-4 rounded-xl hover:shadow-gold transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>

      <ChatWidgetWrapper context="agent" leadType="agent" />
    </div>
  );
}
