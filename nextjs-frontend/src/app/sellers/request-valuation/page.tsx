'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';
import { apiPost, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Turnstile from '@/components/Turnstile';

const propertyTypes = ['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land'];
const conditions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Needs Work'];
const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function RequestValuationPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [propertyType, setPropertyType] = useState('Single Family');
  const [condition, setCondition] = useState('Good');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const { notifyError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost('/forms/seller-request', {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || undefined,
        property_address: address,
        city,
        state,
        zip: zip || undefined,
        condition,
        message: `Property type: ${propertyType}`,
        turnstile_token: turnstileToken || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      notifyError(
        err,
        err instanceof ApiError ? err.message : 'Failed to submit your valuation request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-white">
        <PageHero
          badge="Valuation Requested"
          title="Thank You!"
          subtitle="We've received your property details. An agent will reach out within 24 hours with your custom market valuation."
        />
        <section className="py-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-[#0A2647]/5 rounded-3xl p-12 border border-[#0A2647]/10">
              <div className="w-16 h-16 bg-[#C9A227]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-3">Valuation Request Confirmed</h2>
              <p className="font-body text-gray-600 mb-8">
                Our team is preparing a detailed Comparative Market Analysis (CMA) for your property at <strong>{address}, {city}, {state} {zip}</strong>. You&apos;ll receive:
              </p>
              <ul className="text-left font-body text-gray-600 space-y-3 mb-8 max-w-md mx-auto">
                <li className="flex items-center gap-3">
                  <span className="text-[#C9A227] font-bold">→</span> AI-powered home value estimate
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#C9A227] font-bold">→</span> Comparable sales in your neighborhood
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#C9A227] font-bold">→</span> Recommended listing price range
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#C9A227] font-bold">→</span> Custom marketing strategy
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/sellers" className="bg-[#0A2647] text-white font-heading font-semibold px-6 py-3 rounded-lg hover:bg-[#0A2647]/90 transition-colors">
                  Back to Sellers
                </Link>
                <Link href="/" className="border border-gray-300 text-[#0A2647] font-heading font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Free Valuation"
        title="Request Your Home Valuation"
        subtitle="Tell us about your property and receive a free, data-driven market analysis from our expert agents."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0A2647] mb-2">Property Information</h2>
            <p className="font-body text-gray-500 mb-8">Fill in the details below and we&apos;ll prepare your custom valuation report.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="valuation-first-name" className="block font-body text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    id="valuation-first-name"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="valuation-last-name" className="block font-body text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    id="valuation-last-name"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="valuation-email" className="block font-body text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    id="valuation-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="valuation-phone" className="block font-body text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
                  <input
                    id="valuation-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="valuation-address" className="block font-body text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  id="valuation-address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="valuation-city" className="block font-body text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    id="valuation-city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="valuation-state" className="block font-body text-sm font-medium text-gray-700 mb-2">State</label>
                  <select
                    id="valuation-state"
                    name="state"
                    autoComplete="address-level1"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Select</option>
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="valuation-zip" className="block font-body text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    id="valuation-zip"
                    name="zip"
                    type="text"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="00000"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="valuation-property-type" className="block font-body text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  id="valuation-property-type"
                  name="propertyType"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none bg-white"
                >
                  {propertyTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-body text-sm font-medium text-gray-700 mb-2">Property Condition</label>
                <div className="flex flex-wrap gap-3">
                  {conditions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCondition(c)}
                      className={`px-5 py-2.5 rounded-lg font-body text-sm font-medium border transition-colors ${
                        condition === c
                          ? 'bg-[#0A2647] text-white border-[#0A2647]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#0A2647] hover:text-[#0A2647]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <Turnstile onVerify={setTurnstileToken} className="flex justify-center" />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C9A227] text-[#0A2647] font-heading font-semibold py-4 rounded-lg hover:bg-[#C9A227]/90 transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting Request...
                  </span>
                ) : (
                  'Submit Valuation Request'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <CTASection
        title="Need Answers Now?"
        subtitle="Talk to a local agent who knows your neighborhood inside and out."
        primaryAction={{ label: 'Contact an Agent', href: '/sellers/list-your-property' }}
        secondaryAction={{ label: 'Back to Sellers', href: '/sellers' }}
      />
    </main>
  );
}
