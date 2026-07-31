"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Logo from "@/components/Logo";

interface SubMenuItem {
  title: string;
  href: string;
  badge?: string;
}

interface NavCategory {
  id: string;
  label: string;
  items: SubMenuItem[];
}

const navCategories: NavCategory[] = [
  {
    id: "properties",
    label: "Properties",
    items: [
      { title: "All Properties", href: "/properties" },
      { title: "Homes for Sale", href: "/properties/for-sale" },
      { title: "Rental Properties", href: "/properties/for-rent" },
      { title: "Featured Properties", href: "/properties/featured", badge: "Hot" },
      { title: "New Listings", href: "/properties/new-listings", badge: "New" },
      { title: "Luxury Properties", href: "/properties/luxury" },
      { title: "Commercial Properties", href: "/properties/commercial" },
      { title: "Investment Properties", href: "/properties/investment" },
      { title: "Open Houses", href: "/properties/open-houses" },
      { title: "Map Search", href: "/properties/map" },
      { title: "Compare Properties", href: "/properties/compare" },
    ],
  },
  {
    id: "buyers",
    label: "Buyers",
    items: [
      { title: "Buyer Services", href: "/buyers" },
      { title: "Get Started", href: "/buyers/get-started" },
      { title: "First-Time Buyers", href: "/buyers/first-time" },
      { title: "Buyer Guide", href: "/buyers/guide" },
      { title: "Mortgage Calculator", href: "/buyers/mortgage-calculator" },
      { title: "Affordability Calculator", href: "/buyers/affordability-calculator" },
      { title: "Closing Cost Calculator", href: "/buyers/closing-cost-calculator" },
      { title: "Pre-Approval Info", href: "/buyers/pre-approval" },
      { title: "Relocation Services", href: "/buyers/relocation" },
    ],
  },
  {
    id: "sellers",
    label: "Sellers",
    items: [
      { title: "Seller Services", href: "/sellers" },
      { title: "Get Started", href: "/sellers/get-started" },
      { title: "Home Valuation", href: "/sellers/home-valuation", badge: "Free" },
      { title: "Selling Guide", href: "/sellers/selling-guide" },
      { title: "List Your Property", href: "/sellers/list-your-property" },
      { title: "Net Proceeds Calculator", href: "/sellers/net-proceeds-calculator" },
      { title: "Marketing Plan", href: "/sellers/marketing-plan" },
      { title: "Prepare to Sell", href: "/sellers/prepare-to-sell" },
    ],
  },
  {
    id: "investors",
    label: "Investors",
    items: [
      { title: "Investor Services", href: "/investors" },
      { title: "Investment Opportunities", href: "/investors/deals" },
      { title: "Deal Analyzer", href: "/investors/deal-analyzer" },
      { title: "ROI Calculator", href: "/investors/roi-calculator" },
      { title: "Cap Rate Calculator", href: "/investors/cap-rate-calculator" },
      { title: "Cash Flow Calculator", href: "/investors/cash-flow-calculator" },
      { title: "Fix & Flip Calculator", href: "/investors/flip-calculator" },
      { title: "Market Reports", href: "/investors/market-reports" },
    ],
  },
  {
    id: "agents",
    label: "Agents",
    items: [
      { title: "Find Property Agents", href: "/agents" },
      { title: "Join Preferred Network", href: "/register?role=agent", badge: "Join" },
      { title: "Agent Lounge & Tools", href: "/agent/dashboard", badge: "Pro" },
      { title: "Apply as Partner Broker", href: "/register?role=broker" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    items: [
      { title: "Blog", href: "/blog" },
      { title: "Real Estate Guides", href: "/guides" },
      { title: "Market Reports", href: "/market-reports" },
      { title: "Resource Center", href: "/resources" },
      { title: "Testimonials", href: "/testimonials" },
      { title: "Case Studies", href: "/case-studies" },
      { title: "About Us", href: "/about" },
      { title: "Contact Us", href: "/contact" },
    ],
  },
];

export default function HeaderVariants() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full sticky top-0 z-50 transition-all font-body">
      {/* ── TOP UTILITY TIER (DARK High Contrast Crown) ── */}
      <div className="w-full bg-[#07162C] text-slate-350 border-b border-[#C9A227]/30 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between text-[11px] font-bold tracking-wide uppercase">
          {/* Left Side: status info & direct links */}
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 bg-[#C9A227]/10 border border-[#C9A227]/30 !text-[#C9A227] px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
              Pro Network
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
              <span>📞</span> <span className="text-slate-300 font-medium">+1 (800) 555-REAL</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
              <span>✉️</span> <span className="text-slate-300 font-medium">info@domesticrealestate.us</span>
            </span>
          </div>

          {/* Right Side: Quick secondary actions */}
          <div className="flex items-center gap-4 text-slate-300 font-extrabold">
            <Link href="/about" className="hover:text-[#C9A227] transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-[#C9A227] transition-colors">
              Contact
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/login" className="hover:text-[#C9A227] transition-colors flex items-center gap-1 text-white">
              <span>👤</span> Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN BOTTOM NAVIGATION TIER (Light high-contrast base) ── */}
      <header className="w-full bg-white border-b border-slate-200/80 shadow-md backdrop-blur-xl transition-all py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo - Uses light bg version */}
          <div className="flex items-center shrink-0">
            <Logo size="md" href="/" dark={false} />
          </div>

          {/* Spaced Nav links for Desktop */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 font-extrabold text-sm shrink-0">
            {navCategories.map((cat) => {
              const isOpen = activeDropdown === cat.id;
              return (
                <div
                  key={cat.id}
                  className="relative shrink-0"
                  onMouseEnter={() => setActiveDropdown(cat.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={`px-3 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1 font-extrabold text-xs xl:text-sm tracking-wide whitespace-nowrap shrink-0 ${
                      isOpen
                        ? "bg-[#0A2647] text-white shadow-md scale-105"
                        : "text-slate-705 hover:text-[#0A2647] hover:bg-slate-100"
                    }`}
                  >
                    <span className="font-extrabold whitespace-nowrap">{cat.label}</span>
                    <motion.svg
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                        isOpen ? "text-white" : "text-[#C9A227]"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-white border-2 border-[#0A2647] rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-50"
                      >
                        <div className="text-[10px] font-mono text-[#C9A227] font-extrabold uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
                          {cat.label}
                        </div>
                        <div className="grid grid-cols-1 gap-0.5">
                          {cat.items.map((sub, idx) => (
                            <Link
                              key={idx}
                              href={sub.href}
                              onClick={() => setActiveDropdown(null)}
                              className="px-3 py-2 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-slate-100"
                            >
                              <span className="text-xs font-bold text-slate-700 group-hover:text-[#0A2647] transition-colors">
                                {sub.title}
                              </span>
                              {sub.badge && (
                                <span className="bg-[#C9A227] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full font-mono">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Right Actions & 3D Gold Accent Button */}
          <div className="flex items-center gap-2 xl:gap-3.5 shrink-0">
            {/* Round Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="bg-slate-55 hover:bg-slate-100 text-slate-800 text-xs font-extrabold px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-full border border-slate-200/80 shadow-sm transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 hover:scale-105"
              title="Search Portal"
            >
              <span className="text-sm">🔍</span>
              <span className="hidden sm:inline text-xs font-extrabold text-slate-700">Search</span>
            </button>

            {/* Marketplace Button */}
            <Link
              href="/properties"
              className="bg-[#C9A227] hover:bg-[#B59123] text-[#07162C] text-xs font-extrabold px-4 py-2.5 sm:px-5 sm:py-3 rounded-full shadow-[0_4px_16px_rgba(201,162,39,0.35)] border-b-2 border-[#A1821F] cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 hover:scale-105 transition-transform"
            >
              <span>Explore Marketplace</span>
              <span>→</span>
            </Link>

            {/* Mobile Hamburger menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 shrink-0"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

        </div>
      </header>

      {/* ── MOBILE NAV DRAWER (Drawer content styled for light mode) ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="lg:hidden mt-2 max-w-lg mx-auto bg-white border-2 border-[#0A2647] text-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto"
          >
            {navCategories.map((cat) => (
              <div key={cat.id} className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-extrabold text-[#0D2C54] uppercase tracking-wider mb-2">
                  {cat.label}
                </h4>
                <div className="grid grid-cols-1 gap-1 text-xs font-bold font-heading">
                  {cat.items.map((sub, idx) => (
                    <Link
                      key={idx}
                      href={sub.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2.5 bg-slate-50 rounded-xl text-slate-700 hover:text-[#0A2647] flex items-center justify-between"
                    >
                      <span className="truncate">{sub.title}</span>
                      {sub.badge && (
                        <span className="bg-[#C9A227] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                          {sub.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="border-b border-slate-100 pb-3">
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block p-2.5 text-xs font-bold text-slate-600 hover:text-slate-900">About Us</Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block p-2.5 text-xs font-bold text-slate-600 hover:text-slate-900">Contact Us</Link>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="block p-2.5 text-xs font-bold text-slate-600 hover:text-slate-900">Blog</Link>
            </div>
            <div className="flex gap-3 pt-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 rounded-xl border border-slate-350 text-xs font-bold text-slate-700">
                Sign In
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 rounded-xl bg-[#C9A227] text-[#0A2647] text-xs font-extrabold">
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── QUICK PORTAL SEARCH MODAL ── */}
      <AnimatePresence>
        {searchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-[#0A2647] rounded-3xl p-6 w-full max-w-xl shadow-2xl text-slate-800 relative z-50"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-extrabold text-[#0a2647]">🔍 Search Real Estate Portal</h3>
                <button
                  onClick={() => setSearchModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-slate-100 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-205 rounded-xl p-3 focus-within:border-[#0A2647] transition-all">
                <input
                  type="text"
                  placeholder="Search zip codes, motivated seller leads, top agents, CRMs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-semibold"
                  autoFocus
                />
                <button className="bg-[#0A2647] text-white font-extrabold px-4 py-2 rounded-xl text-xs hover:bg-[#07162C] transition-colors cursor-pointer shrink-0">
                  Search
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                <span className="text-slate-400 font-normal">Popular Searches:</span>
                <span className="bg-slate-100 hover:bg-[#C9A227] hover:text-[#07162C] px-2.5 py-1 rounded-full cursor-pointer transition-colors">Miami Off-Market</span>
                <span className="bg-slate-100 hover:bg-[#C9A227] hover:text-[#07162C] px-2.5 py-1 rounded-full cursor-pointer transition-colors">Dallas Wholesalers</span>
                <span className="bg-slate-100 hover:bg-[#C9A227] hover:text-[#07162C] px-2.5 py-1 rounded-full cursor-pointer transition-colors">Hard Money Lenders</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
