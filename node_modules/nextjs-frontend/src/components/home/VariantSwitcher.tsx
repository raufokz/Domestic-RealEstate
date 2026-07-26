"use client";

import React, { useState } from "react";

interface VariantSwitcherProps {
  currentVariant: number;
  onSelectVariant: (variantId: number) => void;
  onIntegrate: (variantId: number) => void;
}

export default function VariantSwitcher({
  currentVariant,
  onSelectVariant,
  onIntegrate,
}: VariantSwitcherProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const variants = [
    {
      id: 5,
      name: "RealEstateBees UI & UX (Featured)",
      tag: "Directory Matrix & Pro Hexagon Selector",
      desc: "Structured directory matrix, interactive hexagon selector, software reviews & 3D growth banner.",
      color: "from-blue-900 via-[#0A2647] to-amber-500",
    },
    {
      id: 1,
      name: "Luxury Glassmorphism",
      tag: "Midnight & Gold",
      desc: "Ultra-exclusive cinematic look with glassmorphic cards, gold glow, and luxury estate showcases.",
      color: "from-amber-500 to-yellow-600",
    },
    {
      id: 2,
      name: "Modern AI & Tech",
      tag: "Cyber Slate & Emerald",
      desc: "Data-driven tech design with AI natural search bar, market analytics tickers, and ROI radar.",
      color: "from-cyan-500 to-emerald-500",
    },
    {
      id: 3,
      name: "Minimalist Editorial",
      tag: "Warm Ivory & Serif",
      desc: "Clean magazine style with elegant serif typography, spacious galleries, and architectural collections.",
      color: "from-amber-700 to-amber-900",
    },
    {
      id: 4,
      name: "Vibrant Marketplace",
      tag: "Indigo, Coral & Live Stats",
      desc: "High-energy portal with active filter pills, live open house timers, and neighborhood quiz.",
      color: "from-indigo-600 to-rose-500",
    },
  ];

  const handleIntegrateClick = () => {
    onIntegrate(currentVariant);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  if (isMinimized) {
    return (
      <div className="fixed top-24 right-4 z-50 animate-bounce">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-[#0A2647] text-white px-4 py-2.5 rounded-full shadow-2xl border border-amber-500/40 hover:bg-opacity-95 transition-all text-sm font-semibold cursor-pointer"
        >
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
          🎨 Switch Homepage Design ({currentVariant})
        </button>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-[#0A2647]/95 backdrop-blur-md border-b border-amber-500/30 text-white shadow-2xl transition-all duration-300">
      {/* Toast Notification */}
      {showNotification && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Homepage Design #{currentVariant} successfully set as your default integrated design!
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Header Title */}
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold uppercase tracking-wider">
            Live Preview Controller
          </span>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Select Homepage Design Variant
            </h2>
            <p className="text-xs text-slate-300">
              Click options below to test different home page styles live:
            </p>
          </div>
        </div>

        {/* Variant Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
          {variants.map((variant) => {
            const isActive = currentVariant === variant.id;
            return (
              <button
                key={variant.id}
                onClick={() => onSelectVariant(variant.id)}
                className={`relative group px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex flex-col items-start min-w-[130px] border ${
                  isActive
                    ? "bg-gradient-to-r " +
                      variant.color +
                      " text-white border-white/40 shadow-lg scale-[1.03]"
                    : "bg-white/10 text-slate-200 border-white/10 hover:bg-white/20 hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Variant {variant.id}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] font-normal opacity-90 truncate max-w-[110px]">
                  {variant.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleIntegrateClick}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0A2647] font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer hover:scale-[1.02]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Integrate Design #{currentVariant}
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
