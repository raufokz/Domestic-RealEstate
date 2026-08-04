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
      <div className="bg-[#FDFBF7] border border-[#EBE6DD] rounded-2xl p-8 text-center text-stone-900 shadow-sm">
        <div className="w-12 h-12 bg-[#C9A227]/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C9A227]/30">
          <span className="text-xl text-[#8C6D27]">✓</span>
        </div>
        <h3 className="font-heading text-xl font-bold text-[#0A2647] mb-2">Request Received</h3>
        <p className="text-stone-600 text-sm leading-relaxed">
          A Domestic Real Estate investment advisor will reach out to you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] border border-[#EBE6DD] rounded-2xl p-8 text-stone-900 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8C6D27]">
          Expert Consultation
        </span>
      </div>
      <h3 className="font-heading text-xl font-bold text-[#0A2647] mb-2">
        Have a question about this research?
      </h3>
      <p className="text-stone-600 text-xs mb-6 leading-relaxed">
        Speak directly with a licensed domestic real estate market advisor — no obligation.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            autoComplete="name"
            required
            placeholder="Your Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-[#EBE6DD] text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <input
            type="email"
            autoComplete="email"
            required
            placeholder="Email Address *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-[#EBE6DD] text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="Phone Number (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-[#EBE6DD] text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <textarea
            placeholder="Specific questions or topic details..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white border border-[#EBE6DD] text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent transition-all resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0A2647] text-white font-heading font-semibold py-3.5 rounded-xl hover:bg-[#081F3A] transition-all shadow-sm hover:shadow disabled:opacity-60 text-sm flex items-center justify-center gap-2"
        >
          {submitting ? (
            <span>Submitting Request…</span>
          ) : (
            <>
              <span>Talk to an Advisor</span>
              <span className="text-[#C9A227]">→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
