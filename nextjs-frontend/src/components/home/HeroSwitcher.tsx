"use client";

import React, { useState } from "react";

interface HeroSwitcherProps {
  currentHero: number;
  onSelectHero: (heroId: number) => void;
  onIntegrateHero: (heroId: number) => void;
}

export default function HeroSwitcher({
  currentHero,
  onSelectHero,
  onIntegrateHero,
}: HeroSwitcherProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const heroOptions = [
    {
      id: 1,
      name: "Option 1: Dashboard Mockup & Dual Pill Buttons",
      tag: "Classic Iso Frame & Dual Pills",
      desc: "Laptop lead dashboard mockup inside a gold frame with solid navy & gold pill buttons.",
      btnStyle: "Pill Shaped (Full Rounded)",
    },
    {
      id: 2,
      name: "Option 2: Glassmorphic Search & Glow Buttons",
      tag: "Frosted Glass & Ambient Glow",
      desc: "Centered headline with floating glass search box, tab filters, and glowing gradient buttons.",
      btnStyle: "Glassmorphic Glow (Backdrop Blur)",
    },
    {
      id: 3,
      name: "Option 3: Hexagon Lead Matrix & 3D Chamfered Buttons",
      tag: "Hexagon Cards & 3D Shadow",
      desc: "Trust stat badges with interactive hexagon lead matrix cards and 3D chamfered gold buttons.",
      btnStyle: "3D Chamfered (Elevated Drop Shadow)",
    },
    {
      id: 4,
      name: "Option 4: Fast Zip Estimator & Sleek Flat Buttons",
      tag: "Zip Search & Modern Flat",
      desc: "Software dashboard slider with fast lead valuation form and sleek flat gold buttons.",
      btnStyle: "Sleek Flat (Rounded-XL High Contrast)",
    },
  ];

  const handleIntegrateClick = () => {
    onIntegrateHero(currentHero);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  if (isMinimized) {
    return (
      <div className="fixed top-24 right-4 z-50 animate-bounce">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-[#0A2647] text-white px-4 py-2.5 rounded-full shadow-2xl border border-[#C9A227] hover:bg-opacity-95 transition-all text-sm font-bold cursor-pointer"
        >
          <span className="w-3 h-3 rounded-full bg-[#C9A227] animate-ping" />
          ✨ Switch Hero UI & Button Style ({currentHero})
        </button>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-[#0A2647] text-white border-b border-[#C9A227]/40 shadow-2xl transition-all duration-300">
      {/* Toast Notification */}
      {showNotification && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Hero UI & Button Style #{currentHero} successfully integrated as your default website style!
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Header Title */}
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/40 rounded-lg text-xs font-bold uppercase tracking-wider">
            Hero & Button UI Controller
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              Test Hero Section & Button Styles
            </h2>
            <p className="text-[11px] text-slate-300">
              Click options to preview different Hero layouts and button aesthetics live:
            </p>
          </div>
        </div>

        {/* Options Selector */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
          {heroOptions.map((opt) => {
            const isActive = currentHero === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onSelectHero(opt.id)}
                className={`relative group px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex flex-col items-start min-w-[130px] border ${
                  isActive
                    ? "bg-[#C9A227] text-[#0A2647] border-white shadow-lg scale-105"
                    : "bg-white/10 text-slate-200 border-white/10 hover:bg-white/20 hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Hero {opt.id}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#0A2647] animate-pulse" />}
                </div>
                <span className="text-[10px] font-normal opacity-90 truncate max-w-[115px]">
                  {opt.btnStyle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleIntegrateClick}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C9A227] to-amber-500 hover:from-amber-400 hover:to-amber-600 text-[#0A2647] font-extrabold px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Integrate Hero #{currentHero}
          </button>

          <button
            onClick={() => setIsMinimized(true)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Minimize Toolbar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
