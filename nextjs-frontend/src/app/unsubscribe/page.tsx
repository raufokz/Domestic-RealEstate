'use client';

import { useState } from 'react';
import { PageHero } from '@/components/ui/PageTemplate';
import { apiPost, ApiError } from '@/lib/api';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await apiPost('/email/unsubscribe', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to unsubscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <PageHero badge="Unsubscribe" title="Unsubscribe" subtitle="We're sorry to see you go." bg="burgundy" />

      <section className="py-16 md:py-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <div className="text-center bg-gray-50 rounded-2xl p-12 border border-gray-100">
              <div className="w-16 h-16 bg-[#0A2647]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-3">You&apos;ve Been Unsubscribed</h2>
              <p className="font-body text-gray-600 mb-6">
                You will no longer receive emails from the Domestic Real Estate newsletter. If this was
                a mistake, you can always resubscribe.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-[#C9A227] font-heading font-semibold text-sm hover:underline"
              >
                Resubscribe
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm">
              <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-3 text-center">Unsubscribe from Our Newsletter</h2>
              <p className="font-body text-gray-600 text-center mb-8">
                Enter the email address you used to subscribe and we&apos;ll remove you from our mailing list.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <label htmlFor="unsubscribe-email" className="sr-only">Email address</label>
                <input
                  id="unsubscribe-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-5 py-4 rounded-lg border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#8B1E3F] text-white font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#8B1E3F]/90 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Unsubscribing...' : 'Unsubscribe'}
                </button>
              </form>
              {error && (
                <p className="font-body text-sm text-red-600 text-center mt-4">{error}</p>
              )}
              <p className="font-body text-xs text-gray-400 text-center mt-4">
                You can resubscribe at any time by visiting our newsletter page.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
