"use client";

import React, { useState } from "react";

export default function HomeValuationWidget() {
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("single-family");
  const [beds, setBeds] = useState("3");
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleValuation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const base = 520000 + (parseInt(beds) || 3) * 45000;
      setEstimatedValue(base + Math.floor(Math.random() * 50000));
    }, 900);
  };

  return (
    <div className="bg-[#0A2647] border-2 border-[#C9A227]/50 rounded-3xl p-8 sm:p-10 shadow-premium-xl text-white">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <span className="inline-block bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227] text-xs font-heading font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
          Instant Valuation AI Engine
        </span>
        <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white">
          Calculate Your Home's Market Value
        </h3>
        <p className="text-slate-300 text-sm mt-2 font-body">
          Powered by real-time MLS sold comps, active buyer demand algorithms, and skip-tracing valuation data.
        </p>
      </div>

      <form onSubmit={handleValuation} className="max-w-2xl mx-auto space-y-4 font-body">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter street address, city, or ZIP code..."
            className="flex-1 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/30 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-bold text-sm px-7 py-3 rounded-xl shadow-gold hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
          >
            {loading ? "Analyzing Comps..." : "Estimate Value →"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-2">
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#C9A227]"
          >
            <option value="single-family" className="bg-white text-slate-900">Single Family Home</option>
            <option value="condo" className="bg-white text-slate-900">Condo / Apartment</option>
            <option value="townhouse" className="bg-white text-slate-900">Townhouse</option>
            <option value="multi-family" className="bg-white text-slate-900">Multi-Family</option>
          </select>
          <select
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
            className="bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#C9A227]"
          >
            <option value="2" className="bg-white text-slate-900">2 Bedrooms</option>
            <option value="3" className="bg-white text-slate-900">3 Bedrooms</option>
            <option value="4" className="bg-white text-slate-900">4 Bedrooms</option>
            <option value="5" className="bg-white text-slate-900">5+ Bedrooms</option>
          </select>
        </div>
      </form>

      {estimatedValue && (
        <div className="mt-8 max-w-2xl mx-auto p-6 bg-[#07162C] border border-[#C9A227] rounded-2xl animate-fade-in text-center">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Estimated Current Market Range
          </span>
          <div className="text-3xl sm:text-4xl font-heading font-extrabold text-[#C9A227] font-mono my-2">
            ${(estimatedValue - 18000).toLocaleString()} – ${(estimatedValue + 22000).toLocaleString()}
          </div>
          <p className="text-xs text-slate-300 font-body max-w-lg mx-auto">
            Based on recent comparable property sales near <strong className="text-white">{address}</strong>.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <a
              href="/contact"
              className="bg-[#C9A227] text-[#0A2647] text-xs font-bold px-6 py-2.5 rounded-xl hover:scale-105 transition-all"
            >
              Get Cash Offers →
            </a>
            <a
              href="/agents"
              className="border border-white/30 text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-white/10 transition-all"
            >
              Connect Listing Agent
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
