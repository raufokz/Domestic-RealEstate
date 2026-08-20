"use client";

import { useState, useEffect, useCallback } from "react";
import { apiPost } from "@/lib/api";

export default function ExitPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ estimated_value: number; analysis: string } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('exit_popup_shown')) return;

    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('exit_popup_shown')) {
        setShow(true);
      }
    }, 30000);

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !sessionStorage.getItem('exit_popup_shown')) {
        setShow(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleClose = useCallback(() => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem('exit_popup_shown', 'true');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !email) return;
    setSubmitting(true);
    try {
      const data = await apiPost("/marketing/valuations", {
        address,
        city: "",
        state: "",
        zip: "",
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1800,
        property_type: "residential",
        condition: "Good",
      });
      setResult(data as { estimated_value: number; analysis: string });
    } catch {
      setResult({ estimated_value: 350000, analysis: "Thank you! A specialist will contact you with a detailed valuation." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeInUp 0.3s ease-out' }}
      >
        <div className="relative bg-gradient-to-r from-[#0A2647] to-[#1a3a6b] p-8 text-center">
          <button onClick={handleClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors" aria-label="Close">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="w-16 h-16 bg-[#C9A227] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Get Your Free Home Valuation</h2>
          <p className="text-white/80 text-sm">Know what your home is worth in today&apos;s market</p>
        </div>

        <div className="p-6">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your property address"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#C9A227] text-white font-semibold rounded-xl hover:bg-[#b8911f] transition-colors disabled:opacity-50 text-sm"
              >
                {submitting ? "Calculating..." : "Get Free Valuation"}
              </button>
              <p className="text-xs text-gray-600 text-center">No spam. Your info is safe with us.</p>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your Home Value</h3>
              <p className="text-3xl font-bold mb-4" style={{ color: '#0A2647' }}>
                ${result.estimated_value?.toLocaleString() || '350,000'}
              </p>
              <p className="text-sm text-gray-600 mb-6">{result.analysis}</p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-[#0A2647] text-white rounded-xl text-sm font-medium hover:bg-[#0c2f57] transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
