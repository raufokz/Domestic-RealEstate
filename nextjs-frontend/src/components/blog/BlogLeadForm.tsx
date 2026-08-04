"use client";

import { useState } from "react";
import { apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function BlogLeadForm({ source = "blog" }: { source?: string }) {
  const { notifyError } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const [first_name, ...rest] = name.trim().split(/\s+/);
      await apiPost("/leads/capture", {
        first_name: first_name || name.trim() || "Website Visitor",
        last_name: rest.join(" ") || null,
        email,
        phone: phone || null,
        notes: message || null,
        source,
      });
      setSubmitted(true);
    } catch (err) {
      notifyError(err, "Could not send your request. Please try again shortly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-[#0A2647] rounded-2xl p-8 text-center text-white">
        <div className="w-12 h-12 bg-[#C9A227]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <h3 className="font-heading text-xl font-bold mb-2">Thanks — we got it!</h3>
        <p className="text-slate-300 text-sm">
          A Domestic Real Estate advisor will reach out shortly to help with your question.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0A2647] rounded-2xl p-8 text-white">
      <h3 className="font-heading text-xl font-bold mb-1">Have a question about this article?</h3>
      <p className="text-slate-300 text-sm mb-6">
        Tell us what you&apos;re working on and an advisor will follow up — no obligation.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          autoComplete="name"
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
        />
        <input
          type="email"
          autoComplete="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
        />
        <input
          type="tel"
          autoComplete="tel"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
        />
        <textarea
          placeholder="What would you like to know? (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227] resize-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#C9A227] text-[#0A2647] font-heading font-semibold py-3 rounded-lg hover:bg-[#C9A227]/90 transition-colors disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Talk to an Advisor"}
        </button>
      </form>
    </div>
  );
}
