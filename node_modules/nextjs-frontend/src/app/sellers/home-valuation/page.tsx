'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiPost } from '@/lib/api';
import UniversalChatWidget from '@/components/ai/UniversalChatWidget';

const conditions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Needs Work'];

interface ValuationResponse {
  message: string;
  estimated_value: string;
  low_estimate: string;
  high_estimate: string;
  analysis: string;
  property_details: Record<string, unknown>;
}

export default function HomeValuationPage() {
  // Seeded from the homepage estimate widget so a visitor never retypes what
  // they already entered there.
  const searchParams = useSearchParams();
  const [address, setAddress] = useState(searchParams.get('address') ?? '');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') ?? '3');
  const [bathrooms, setBathrooms] = useState('2');
  const [sqft, setSqft] = useState('');
  const [propertyType, setPropertyType] = useState(searchParams.get('property_type') ?? 'Single Family');
  const [condition, setCondition] = useState('Good');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValuationResponse | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await apiPost<ValuationResponse>('/marketing/valuations', {
        address,
        city,
        state,
        zip,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        sqft: parseInt(sqft) || 2000,
        property_type: propertyType,
        condition,
      });
      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-[var(--primary-navy,#0A2647)] text-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--accent-gold,#C9A227)] font-heading text-sm tracking-widest uppercase mb-4">Home Valuation</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">What&apos;s Your Home Worth?</h1>
          <p className="font-body text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Get an instant, data-driven estimate of your home&apos;s current market value in seconds.
          </p>
        </div>
      </section>

      {/* Valuation Form */}
      <section className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--primary-navy,#0A2647)] mb-2">Enter Your Property Details</h2>
            <p className="font-body text-gray-500 mb-8">The more details you provide, the more accurate your estimate will be.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-body text-sm font-medium text-gray-700 mb-2">Property Address</label>
                <input
                  type="text"
                  id="hv-address"
                  name="address"
                  autoComplete="street-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[var(--accent-gold,#C9A227)] focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block font-body text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    id="hv-city"
                    name="city"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[var(--accent-gold,#C9A227)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    id="hv-state"
                    name="state"
                    autoComplete="address-level1"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[var(--accent-gold,#C9A227)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-gray-700 mb-2">ZIP</label>
                  <input
                    type="text"
                    id="hv-zip"
                    name="postal_code"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="ZIP Code"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[var(--accent-gold,#C9A227)] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block font-body text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <select
                    id="hv-beds"
                    name="bedrooms"
                    autoComplete="off"
                    inputMode="numeric"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[var(--accent-gold,#C9A227)] focus:border-transparent outline-none bg-white"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <select
                    id="hv-baths"
                    name="bathrooms"
                    autoComplete="off"
                    inputMode="numeric"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[var(--accent-gold,#C9A227)] focus:border-transparent outline-none bg-white"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-gray-700 mb-2">Square Feet</label>
                  <input
                    type="number"
                    id="hv-sqft"
                    name="sqft"
                    autoComplete="off"
                    inputMode="numeric"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    placeholder="2,000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[var(--accent-gold,#C9A227)] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-body text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body focus:ring-2 focus:ring-[var(--accent-gold,#C9A227)] focus:border-transparent outline-none bg-white"
                >
                  <option>Single Family</option>
                  <option>Condo</option>
                  <option>Townhouse</option>
                  <option>Multi-Family</option>
                  <option>Land</option>
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
                          ? 'bg-[var(--primary-navy,#0A2647)] text-white border-[var(--primary-navy,#0A2647)]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--primary-navy,#0A2647)] hover:text-[var(--primary-navy,#0A2647)]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 font-body text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--accent-gold,#C9A227)] text-[var(--primary-navy,#0A2647)] font-heading font-semibold py-4 rounded-lg hover:bg-[var(--accent-gold,#C9A227)]/90 transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing Your Property...
                  </span>
                ) : (
                  'Get Instant Estimate'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Estimate Display */}
      {result && (
        <section className="py-20 md:py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--primary-navy,#0A2647)] mb-4">Your Estimated Home Value</h2>
              <p className="font-body text-gray-600">Based on comparable sales and current market data in your area.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
              <div className="text-center mb-10">
                <p className="font-heading text-6xl md:text-7xl font-bold text-[var(--primary-navy,#0A2647)] mb-2">{result.estimated_value}</p>
                <p className="font-body text-gray-500">Estimated Market Value</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-1">Low End</p>
                  <p className="font-heading text-xl font-bold text-[var(--primary-navy,#0A2647)]">{result.low_estimate}</p>
                </div>
                <div className="bg-[var(--accent-gold,#C9A227)]/10 rounded-xl p-5 text-center">
                  <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-1">Most Likely</p>
                  <p className="font-heading text-xl font-bold text-[var(--primary-navy,#0A2647)]">{result.estimated_value}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-1">High End</p>
                  <p className="font-heading text-xl font-bold text-[var(--primary-navy,#0A2647)]">{result.high_estimate}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8">
                <h3 className="font-heading text-lg font-semibold text-[var(--primary-navy,#0A2647)] mb-4">AI-Generated Analysis</h3>
                <div className="font-body text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-6">
                  {result.analysis}
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="bg-[var(--primary-navy,#0A2647)] rounded-3xl p-8 md:p-12">
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">Get a Full Market Report</h3>
                <p className="font-body text-white/70 mb-8 max-w-xl mx-auto">Receive a comprehensive valuation report with detailed comparable sales, market trends, and a recommended listing price from a local expert.</p>
                <a href="/contact" className="inline-block bg-[var(--accent-gold,#C9A227)] text-[var(--primary-navy,#0A2647)] font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[var(--accent-gold,#C9A227)]/90 transition-colors">Contact an Agent</a>
              </div>
            </div>
          </div>
        </section>
      )}
      <UniversalChatWidget context="seller" leadType="seller" />
    </main>
  );
}
