"use client";

import { useState, useEffect } from "react";
import UniversalChatWidget from "@/components/ai/UniversalChatWidget";
import RealEstateBeesHome from "@/components/home/RealEstateBeesHome";

function FloatingElements() {
  return null;
}

function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0 && !localStorage.getItem("exitPopupDismissed")) {
        setShow(true);
      }
    };
    document.addEventListener("mouseleave", handler);
    return () => document.removeEventListener("mouseleave", handler);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("exitPopupDismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { apiPost } = await import("@/lib/api");
      await apiPost("/marketing/valuations", { email });
      setSubmitted(true);
      localStorage.setItem("exitPopupDismissed", "true");
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "We could not submit your request. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-premium-xl max-w-md w-full p-8 animate-scale-in relative">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h3 className="font-heading font-bold text-navy text-xl mb-2">
            Wait! Get a Free Property Valuation
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            Find out what your home is worth in today&apos;s market. 100% free, no obligation.
          </p>
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4">
              <p className="text-green-800 text-sm font-semibold">Request received.</p>
              <p className="text-green-700 text-xs mt-1">
                A member of our team will email your valuation to {email || "the address you provided"}.
              </p>
              <button
                onClick={() => setShow(false)}
                className="mt-3 text-navy text-xs font-semibold underline"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-3">
                <label htmlFor="exit-valuation-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="exit-valuation-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "exit-valuation-error" : undefined}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-semibold py-3 rounded-xl hover:shadow-gold transition-all disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Get My Free Valuation"}
                </button>
              </form>

              {error && (
                <p id="exit-valuation-error" role="alert" className="text-red-600 text-xs mt-3">
                  {error}
                </p>
              )}

              <button onClick={dismiss} className="text-slate-400 text-xs mt-3 hover:text-slate-600 transition-colors">
                No thanks, I&apos;m not interested
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <RealEstateBeesHome />
      </main>

      <FloatingElements />
      <ExitIntentPopup />
      <UniversalChatWidget context="home" leadType="general" />
    </div>
  );
}
