"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { renderIcon } from "@/components/ui/PageTemplate";

interface HeroVariantsProps {
  heroId: number;
}

export default function HeroVariants({ heroId }: HeroVariantsProps) {
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "directory">("buy");
  const [zipInput, setZipInput] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const heroSlides = [
    "/variant1-hero.jpg",
    "/variant2-hero.jpg",
    "/variant4-hero.jpg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  /* ──────────────────────────────────────────────
     HERO OPTION 3 (FRAMER MOTION & WCAG AAA CONTRAST ENHANCED HERO)
     ────────────────────────────────────────────── */
  return (
    <section className="relative py-20 sm:py-28 bg-[#07162C] text-white overflow-hidden border-b border-slate-800">
      {/* Background Image / Thumbnail loads directly from link */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none transition-all duration-1000 opacity-20"
        style={{ backgroundImage: `url(${heroSlides[activeSlide]})` }}
      />

      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-amber-500/10 pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#C9A227]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text & Chamfered Button CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6 text-left"
          >
            <div className="inline-flex items-center gap-2 bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
              #1 Domestic Real Estate Company & Platform
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
              Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#C9A227] to-amber-400">Domestic Real Estate</span> <br />
              Investors & Brokers
            </h1>

            <p className="mt-5 text-slate-100 text-base sm:text-lg leading-relaxed font-normal drop-shadow-sm">
              As a leading Domestic Real Estate Company, we connect home buyers, sellers, investors, and licensed Domestic Real Estate Brokers with exclusive off-market property deals, AI valuations, and market data.
            </p>

            {/* 3D Chamfered Button UI with Framer Motion Feedback (Fitts's Law Target Size) */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <motion.a
                href="#directory"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-extrabold px-8 py-4 rounded-xl text-sm shadow-[0_8px_20px_rgba(201,162,39,0.35)] border-b-4 border-amber-600 active:translate-y-1 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Explore Lead Marketplace</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.a>
              
              <motion.a
                href="#demo"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-6 py-4 rounded-xl text-sm border-b-4 border-slate-950 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>View Platform Demo</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Right Floating 4-Card Hexagon Lead Matrix */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-6 flex justify-center"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
              {[
                { title: "Off-Market Single Family", loc: "Dallas, TX", score: "99 Match", price: "$310,000", tag: "Hot Seller", icon: "construction" },
                { title: "Pre-Foreclosure Duplex", loc: "Tampa, FL", score: "96 Match", price: "$490,000", tag: "Exclusive", icon: "distressed" },
                { title: "Absentee Owner Home", loc: "Phoenix, AZ", score: "94 Match", price: "$280,000", tag: "High Yield", icon: "rental" },
                { title: "High-Equity Penthouse", loc: "Atlanta, GA", score: "92 Match", price: "$360,000", tag: "Verified", icon: "globe" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -5 }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    y: { duration: 3 + idx, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 0.2 },
                  }}
                  className="bg-slate-800/95 border border-slate-700 hover:border-[#C9A227] rounded-2xl p-5 shadow-xl backdrop-blur-md group cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[#C9A227] scale-110 inline-block">{renderIcon(item.icon)}</span>
                    <span className="text-[10px] font-mono bg-[#C9A227] text-[#0A2647] font-extrabold px-2.5 py-0.5 rounded-full shadow">
                      {item.tag}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white group-hover:text-[#C9A227] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-200 mt-1 font-medium">{item.loc}</p>

                  <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center">
                    <span className="text-base font-extrabold text-[#C9A227]">{item.price}</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                      {item.score}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

