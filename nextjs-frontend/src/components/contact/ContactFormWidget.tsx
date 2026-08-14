"use client";

import React, { useState } from "react";
import { apiPost } from "@/lib/api";

export default function ContactFormWidget() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiPost("/marketing/contact", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject,
        message: formData.message,
        source: "contact_page",
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0A2647] border-2 border-[#C9A227]/50 p-8 sm:p-10 rounded-3xl shadow-premium-xl text-white">
      <h3 className="text-2xl font-heading font-bold text-white mb-2">Send Us a Direct Message</h3>
      <p className="text-slate-300 text-sm mb-8 font-body">
        Our dedicated real estate advisors respond to inquiries within 15 minutes during business hours.
      </p>

      {submitted ? (
        <div className="bg-[#C9A227]/10 border border-[#C9A227] text-[#C9A227] p-8 rounded-2xl text-center space-y-3 animate-fade-in">
          <div className="text-4xl">✓</div>
          <h4 className="text-xl font-heading font-bold text-white">Inquiry Received</h4>
          <p className="text-sm text-slate-200 font-body">
            Thank you, <strong className="text-white">{formData.name}</strong>! An advisor will reach out to{" "}
            <strong className="text-white">{formData.email}</strong> shortly.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: "", email: "", phone: "", subject: "general", message: "" });
            }}
            className="mt-4 inline-block bg-[#C9A227] text-[#0A2647] font-bold text-xs px-6 py-2.5 rounded-xl hover:scale-105 transition-all cursor-pointer"
          >
            Send Another Inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 font-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Full Name <span aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                id="contact-name"
                type="text"
                required
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/30 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Email Address <span aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                id="contact-email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane@example.com"
                className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/30 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="contact-phone" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Phone Number <span className="normal-case tracking-normal font-medium text-slate-300">(optional)</span>
              </label>
              <input
                id="contact-phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 000-0000"
                className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/30 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="contact-subject" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">Inquiry Topic</label>
              <select
                id="contact-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/30 transition-colors"
              >
                <option value="general" className="bg-white text-slate-900">General Information</option>
                <option value="buy" className="bg-white text-slate-900">Buying a Property</option>
                <option value="sell" className="bg-white text-slate-900">Selling / Home Valuation</option>
                <option value="leads" className="bg-white text-slate-900">Motivated Seller Lead Access</option>
                <option value="realtor" className="bg-white text-slate-900">Agent Partnership Program</option>
                <option value="investor" className="bg-white text-slate-900">Institutional Deal Flow</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Your Message <span aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <textarea
              id="contact-message"
              rows={5}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us about your property goals or how our platform can assist you..."
              className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/30 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-400/30 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-extrabold text-base py-4 rounded-xl shadow-gold hover:shadow-gold-lg transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? (
              <span>Sending...</span>
            ) : (
              <>
                <span>Submit Inquiry</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
