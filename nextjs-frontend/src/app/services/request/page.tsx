"use client";

import { useState } from "react";
import Link from "next/link";

type ServiceType = "buying" | "selling" | "investing" | "valuation" | "consultation";

const SERVICE_TYPES: { value: ServiceType; label: string; description: string; icon: string }[] = [
  { value: "buying", label: "Buy a Home", description: "Find your dream property with AI-powered search and expert guidance.", icon: "🏠" },
  { value: "selling", label: "Sell a Home", description: "Maximize your sale price with professional marketing and pricing strategy.", icon: "📈" },
  { value: "investing", label: "Real Estate Investing", description: "ROI analysis, market trends, and investment property opportunities.", icon: "💰" },
  { value: "valuation", label: "Home Valuation", description: "Get a free, AI-powered estimate of your property's current market value.", icon: "🔍" },
  { value: "consultation", label: "General Consultation", description: "Speak with an expert about any real estate question or need.", icon: "🤝" },
];

const BUDGET_RANGES = ["Under $200K", "$200K - $500K", "$500K - $750K", "$750K - $1M", "$1M - $2M", "$2M+", "Not Sure / N/A"];
const TIMELINES = ["Immediately", "1-3 Months", "3-6 Months", "6-12 Months", "Just Exploring"];

export default function ServiceRequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    service_type: "" as ServiceType | "",
    budget_range: "",
    timeline: "",
    message: "",
    how_did_you_hear: "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.service_type) { setError("Please select a service type."); return; }
    setSubmitting(true);
    setError("");

    try {
      const { apiPost } = await import("@/lib/api");
      const res = await apiPost<{ request_number: string }>("/service-requests", form);
      setRequestNumber(res.request_number);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl p-10 shadow-card">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl font-bold text-navy mb-2">Request Submitted!</h1>
            <p className="text-slate-500 mb-4">Your request number is:</p>
            <p className="font-heading text-xl font-bold text-gold bg-gold-50 rounded-xl px-6 py-3 inline-block mb-6">{requestNumber}</p>
            <p className="text-slate-500 mb-8">Our team will review your request and contact you within 24 hours with a custom quote.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="px-6 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-600 transition-colors">
                Back to Home
              </Link>
              <Link href="/properties" className="px-6 py-3 border border-navy text-navy font-semibold rounded-xl hover:bg-navy/5 transition-colors">
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-navy to-navy-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-gold font-semibold text-sm tracking-wider uppercase mb-3">Get Started</span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Tell Us What You Need
          </h1>
          <p className="mt-4 text-navy-200 text-lg max-w-2xl mx-auto">
            Fill out the form below and our team will provide a customized solution with a personal quote.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 sm:p-10 shadow-card space-y-8">

          {/* Step 1: Service Type */}
          <div>
            <h2 className="font-heading text-lg font-bold text-navy mb-1">What can we help you with?</h2>
            <p className="text-slate-500 text-sm mb-4">Select the service that best fits your needs.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SERVICE_TYPES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => update("service_type", s.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    form.service_type === s.value
                      ? "border-gold bg-gold-50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{s.icon}</span>
                  <span className="font-heading font-semibold text-navy text-sm block">{s.label}</span>
                  <span className="text-slate-500 text-xs mt-1 block leading-snug">{s.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Contact Info */}
          <div>
            <h2 className="font-heading text-lg font-bold text-navy mb-1">Your Information</h2>
            <p className="text-slate-500 text-sm mb-4">How can our team reach you?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="service-full-name" className="block text-sm font-medium text-navy mb-1">Full Name *</label>
                <input id="service-full-name" name="full_name" type="text" autoComplete="name" required value={form.full_name} onChange={(e) => update("full_name", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold transition-colors" placeholder="John Doe" />
              </div>
              <div>
                <label htmlFor="service-email" className="block text-sm font-medium text-navy mb-1">Email *</label>
                <input id="service-email" name="email" type="email" autoComplete="email" inputMode="email" required value={form.email} onChange={(e) => update("email", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold transition-colors" placeholder="john@example.com" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="service-phone" className="block text-sm font-medium text-navy mb-1">Phone</label>
                <input id="service-phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold transition-colors bg-slate-50 text-slate-400"
                  placeholder="Coming Soon" disabled />
                <p className="text-xs text-slate-400 mt-1">Phone verification coming soon.</p>
              </div>
            </div>
          </div>

          {/* Step 3: Details */}
          <div>
            <h2 className="font-heading text-lg font-bold text-navy mb-1">Project Details</h2>
            <p className="text-slate-500 text-sm mb-4">Help us understand your needs better.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Budget Range</label>
                <select value={form.budget_range} onChange={(e) => update("budget_range", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold transition-colors appearance-none">
                  <option value="">Select budget...</option>
                  {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Timeline</label>
                <select value={form.timeline} onChange={(e) => update("timeline", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold transition-colors appearance-none">
                  <option value="">Select timeline...</option>
                  {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">How did you hear about us?</label>
                <select value={form.how_did_you_hear} onChange={(e) => update("how_did_you_hear", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold transition-colors appearance-none">
                  <option value="">Select...</option>
                  <option value="google">Google Search</option>
                  <option value="social">Social Media</option>
                  <option value="referral">Friend / Referral</option>
                  <option value="agent">Agent Recommendation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-navy mb-1">Message / Details</label>
                <textarea value={form.message} onChange={(e) => update("message", e.target.value)} rows={4}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold transition-colors resize-none"
                  placeholder="Tell us more about what you're looking for..." />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-semibold py-4 rounded-xl text-lg hover:shadow-gold transition-all duration-300 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
          <p className="text-slate-400 text-xs text-center">
            No obligation. Our team will review and contact you within 24 hours.
          </p>
        </form>
      </div>
    </div>
  );
}
