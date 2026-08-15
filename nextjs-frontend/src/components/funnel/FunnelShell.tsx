"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

export function FunnelShell({
  badge,
  step,
  totalSteps,
  onBack,
  children,
}: {
  badge: string;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <div className="max-w-lg mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          {onBack ? (
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-[#0A2647] transition-colors text-sm font-semibold flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : (
            <span />
          )}
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{badge}</span>
        </div>

        {/* Honest step counter */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? "bg-[#C9A227]" : "bg-slate-200"}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

export function TapOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-sm transition-all ${
        selected
          ? "border-[#0A2647] bg-[#0A2647] text-white shadow-md"
          : "border-slate-200 bg-white text-slate-700 hover:border-[#C9A227]"
      }`}
    >
      {label}
    </button>
  );
}

export function FunnelHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#0A2647] mb-2">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function FunnelContinueButton({
  onClick,
  disabled,
  loading,
  label = "Continue",
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="mt-auto w-full bg-[#C9A227] text-[#0A2647] font-heading font-bold py-4 rounded-2xl hover:bg-[#b8911f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-md"
    >
      {loading ? "Please wait..." : label}
    </button>
  );
}
