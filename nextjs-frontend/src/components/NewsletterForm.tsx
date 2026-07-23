"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-center bg-[#0A2647]/5 rounded-2xl p-12 border border-[#0A2647]/10">
        <div className="w-16 h-16 bg-[#C9A227]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-3">You&apos;re All Set!</h2>
        <p className="font-body text-gray-600 mb-6">
          Thank you for subscribing to the Domestic Real Estate newsletter. Check your inbox for a
          welcome email with your first set of resources.
        </p>
        <p className="font-body text-sm text-gray-500">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button onClick={() => setSubmitted(false)} className="text-[#C9A227] font-heading font-semibold hover:underline">
            try again
          </button>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm">
      <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-3 text-center">Subscribe to Our Newsletter</h2>
      <p className="font-body text-gray-600 text-center mb-8">
        Get the latest market insights, guides, and exclusive content delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          className="flex-1 px-5 py-4 rounded-lg border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
        />
        <button
          type="submit"
          className="bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#C9A227]/90 transition-colors whitespace-nowrap"
        >
          Subscribe
        </button>
      </form>
      <p className="font-body text-xs text-gray-400 text-center mt-4">
        No spam, ever. Unsubscribe anytime. We respect your privacy.
      </p>
    </div>
  );
}
