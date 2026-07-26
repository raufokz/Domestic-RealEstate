"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StickyCTA() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!dismissed && window.scrollY > 500) {
        setShow(true);
      } else if (window.scrollY <= 200) {
        setShow(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A2647] border-t border-[#C9A227]/30 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex w-10 h-10 bg-[#C9A227] rounded-full items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Find Your Dream Home</p>
                <p className="text-white/70 text-xs hidden sm:block">Get a free home valuation or talk to an expert agent</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/sellers/home-valuation"
                className="px-4 py-2 bg-[#C9A227] text-white text-sm font-semibold rounded-lg hover:bg-[#b8911f] transition-colors whitespace-nowrap"
              >
                Free Valuation
              </a>
              <a
                href="/contact"
                className="px-4 py-2 border border-white/30 text-white text-sm rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap hidden sm:block"
              >
                Contact Agent
              </a>
              <button
                onClick={() => { setShow(false); setDismissed(true); }}
                className="text-white/50 hover:text-white transition-colors p-1 ml-1"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
