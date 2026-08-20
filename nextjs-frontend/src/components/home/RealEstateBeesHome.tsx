"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AGENT_PLAN_TIERS, ENTERPRISE_PLAN, planPrice, type AgentPlanTier } from "@/lib/agentPlans";
import { getAgents, agentName, agentInitials, type PublicAgent } from "@/lib/agents";

// Fallback high-end agent avatars from generated images
const FALLBACK_AVATARS: Record<string, string> = {
  "Sarah Connor": "/images/agents/sarah_connor.png",
  "Michael Scott": "/images/agents/michael_scott.png",
  "Jessica Pearson": "/images/agents/jessica_pearson.png",
  "Harvey Specter": "/images/agents/harvey_specter.png",
};

export default function RealEstateBeesHome({ initialAgents = [] }: { initialAgents?: PublicAgent[] }) {
  // Navigation & Filter States
  const [searchTab, setSearchTab] = useState<"buy" | "sell" | "invest">("buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyTab, setPropertyTab] = useState<"sale" | "rent" | "new" | "featured">("sale");
  const [billingPeriod, setBillingPeriod] = useState<"annual" | "one-time">("annual");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Dynamic Agent States
  const [featuredAgents, setFeaturedAgents] = useState<PublicAgent[]>(initialAgents);
  const [loadingAgents, setLoadingAgents] = useState(initialAgents.length === 0);

  useEffect(() => {
    if (initialAgents.length > 0) return;
    let active = true;
    getAgents({ is_featured: 1 }, 4).then((res) => {
      if (!active) return;
      if (res.length === 0) {
        getAgents({}, 4).then((all) => {
          if (active) {
            setFeaturedAgents(all);
            setLoadingAgents(false);
          }
        });
      } else {
        setFeaturedAgents(res);
        setLoadingAgents(false);
      }
    });
    return () => {
      active = true;
    };
  }, [initialAgents]);

  // Lead Opportunities Static Data (Section 02)
  const leadOpportunities = [
    {
      type: "Buyer Lead",
      location: "Houston, TX",
      details: "Single Family Home • Budget: $300K - $450K • Timeline: 30-60 days",
      price: "$35.00",
      bg: "bg-slate-900/40 border-slate-800 hover:border-[#C9A227]/50",
    },
    {
      type: "Seller Lead",
      location: "San Antonio, TX",
      details: "Home Value: $300K - $350K • Timeline: 60-90 days",
      price: "$40.00",
      bg: "bg-slate-900/40 border-slate-800 hover:border-[#C9A227]/50",
    },
    {
      type: "Investor Lead",
      location: "Dallas, TX",
      details: "Multifamily • Budget: $1M - $2M • Timeline: 30-90 days",
      price: "$55.00",
      bg: "bg-[#0A2647]/30 border-[#C9A227]/30 hover:border-[#C9A227]",
    },
  ];

  // Discover Properties Static Data (Section 03)
  const discoverProperties = {
    sale: [
      { id: 1, title: "Modern Luxury Villa", price: "$625,000", desc: "4 Beds, 3 Baths", addr: "1234 River View Dr. Austin, TX", img: "/variant2-hero.jpg" },
      { id: 2, title: "Penthouse Sky loft", price: "$1,100,000", desc: "5 Beds, 4 Baths", addr: "5678 Skyline Dr. Dallas, TX", img: "/variant3-hero.jpg" },
      { id: 3, title: "Charming Suburban Estate", price: "$350,000", desc: "3 Beds, 2 Baths", addr: "910 Oak St. Houston, TX", img: "/variant4-hero.jpg" },
    ],
    rent: [
      { id: 4, title: "Downtown Modern Condo", price: "$3,200/mo", desc: "2 Beds, 2 Baths", addr: "444 High St. Miami, FL", img: "/variant1-hero.jpg" },
      { id: 5, title: "Luxury Waterfront Townhome", price: "$4,500/mo", desc: "3 Beds, 3 Baths", addr: "802 Ocean Blvd. Miami, FL", img: "/variant2-hero.jpg" },
      { id: 6, title: "Modern Studio", price: "$1,850/mo", desc: "1 Bed, 1 Bath", addr: "12 Pine Rd. Atlanta, GA", img: "/variant3-hero.jpg" },
    ],
    new: [
      { id: 7, title: "Contemporary Architectural Glasshouse", price: "$2,400,000", desc: "5 Beds, 6 Baths", addr: "707 Canyon Ridge, Los Angeles, CA", img: "/variant3-hero.jpg" },
      { id: 8, title: "Serene Garden Villa", price: "$850,000", desc: "4 Beds, 3 Baths", addr: "55 Blossom Ln. Seattle, WA", img: "/variant4-hero.jpg" },
      { id: 9, title: "Minimalist Loft", price: "$490,000", desc: "2 Beds, 1.5 Baths", addr: "302 Broadway, New York, NY", img: "/variant2-hero.jpg" },
    ],
    featured: [
      { id: 10, title: "The Twilight Mansion Oasis", price: "$4,850,000", desc: "6 Beds, 8 Baths", addr: "900 Bel Air Rd. Los Angeles, CA", img: "/variant1-hero.jpg" },
      { id: 11, title: "Modern High-Rise Penthouse", price: "$3,100,000", desc: "4 Beds, 4.5 Baths", addr: "1001 Peachtree St. Atlanta, GA", img: "/variant2-hero.jpg" },
      { id: 12, title: "Architectural Forest Villa", price: "$1,950,000", desc: "4 Beds, 4 Baths", addr: "100 Alpine Rd. Aspen, CO", img: "/variant3-hero.jpg" },
    ],
  };

  // FAQ Static Data (Section 08)
  const faqItems = [
    {
      q: "What is Domestic Real Estate (DomesticRealEstate)?",
      a: "Domestic Real Estate is an enterprise-grade proptech platform designed for property buyers, sellers, investors, and licensed brokers. We provide high-intent localized lead marketplace feeds, SaaS marketing tools, and directory indexing to streamline real estate transactions.",
    },
    {
      q: "How does the Domestic Real Estate Lead Marketplace work?",
      a: "We collect property inquiry signals from public records, digital marketing, and direct seller submissions. After undergoing skip-tracing and verification, the leads are posted to our daily deal feed where local agents and investors can claim them.",
    },
    {
      q: "Are leads shared or exclusive?",
      a: "We offer both Territory-Exclusive plans (guaranteeing solo access to zip codes) and open marketplace pay-per-lead listings for wholesaling, hard money, and lending professionals.",
    },
    {
      q: "Can I sync leads with my current CRM?",
      a: "Absolutely! Our platform integrations support native API and Webhook connectivity to popular CRMs like Follow Up Boss, kvCORE, Lofty, Salesforce, and HubSpot.",
    },
  ];

  return (
    <div className="bg-[#07162C] text-slate-100 font-sans min-h-screen">

      {/* ── SECTION 01: HERO & MARKETPLACE SEARCH ── */}
      <section className="relative min-h-[80vh] sm:min-h-[90vh] flex items-center justify-center py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#07162C]">
        {/* Cinematic Sunset Mansion Hero Background Image (LCP — preloaded) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/variant1-hero.jpg"
            alt=""
            fill
            sizes="100vw"
            preload
            fetchPriority="high"
            className="object-cover opacity-35 brightness-90 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07162C]/80 via-[#07162C]/70 to-[#07162C] pointer-events-none" />
        </div>

        {/* Hero Content Box */}
        <div className="relative z-10 max-w-5xl mx-auto text-center w-full">
          <span className="text-[#C9A227] text-xs font-black uppercase tracking-[0.25em] mb-4 inline-block font-mono bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
            01 / Marketplace Search
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 font-heading">
            Real Estate Opportunities.<br />
            Real Connections. <span className="text-[#C9A227]">Real Results.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-lg mb-8 font-normal leading-relaxed">
            The premium network connecting buyers, sellers, active investors, and real estate professionals.
          </p>

          {/* Buy / Sell / Invest Tabs & Search Input */}
          <div className="max-w-2xl mx-auto bg-slate-900/60 backdrop-blur-md p-2 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex justify-center gap-1 mb-2 bg-[#07162C]/60 p-1 rounded-2xl border border-white/5 w-fit mx-auto">
              {(["buy", "sell", "invest"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSearchTab(tab)}
                  className={`px-3 sm:px-6 py-2 rounded-xl text-xs font-black uppercase transition-all duration-300 cursor-pointer ${
                    searchTab === tab
                      ? "bg-[#C9A227] text-[#07162C] font-extrabold shadow"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="City, State, or Zip Code..."
                className="w-full bg-[#07162C]/80 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-400 outline-none focus:border-[#C9A227] transition-all"
              />
              <Link
                href={`/properties?type=${searchTab}&q=${encodeURIComponent(searchQuery)}`}
                className="bg-[#C9A227] hover:bg-amber-400 text-[#07162C] px-8 py-3.5 rounded-2xl text-sm font-black uppercase text-center transition-colors shadow-lg shadow-[#C9A227]/10 flex items-center justify-center shrink-0 border border-[#C9A227]"
              >
                Search
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── B2B SHOP LEADS BANNER & STATS ── */}
      <section className="bg-slate-950/60 border-y border-white/5 py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-left max-w-xl">
            <span className="bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 text-[10px] font-black uppercase px-3 py-1 rounded-full font-mono">
              B2B Broker Portal
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-3">Shop Leads. Grow Your Business.</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">High-quality buyer, seller, and investor leads available in your market segment.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center text-xs w-full">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 min-w-0">
              <span className="text-[#C9A227] font-black text-lg block font-mono">2,458+</span>
              <span className="text-slate-400 font-medium text-[10px]">Active Leads</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 min-w-0">
              <span className="text-[#C9A227] font-black text-lg block font-mono">1,732+</span>
              <span className="text-slate-400 font-medium text-[10px]">Verified Profiles</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 min-w-0">
              <span className="text-[#C9A227] font-black text-lg block font-mono">150+</span>
              <span className="text-slate-400 font-medium text-[10px]">Markets Covered</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 min-w-0">
              <span className="text-[#C9A227] font-black text-lg block font-mono">5,000+</span>
              <span className="text-slate-400 font-medium text-[10px]">Pros Registered</span>
            </div>
          </div>

          <Link href="/register" className="bg-white/10 hover:bg-white/15 text-white font-black text-xs uppercase px-6 py-4 rounded-xl border border-white/10 transition-colors shadow">
            Explore Leads Marketplace
          </Link>
        </div>
      </section>

      {/* ── SECTION 02: POPULAR LEAD OPPORTUNITIES ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#07162C]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[#C9A227] text-xs font-bold uppercase tracking-wider font-mono">
              02 / Popular Lead Opportunities
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              High-Intent Live Motivated Lead Feed
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-lg mx-auto">
              Real-time inbound leads updated hourly. Acquire territorial exclusivity inside your zip codes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
            {leadOpportunities.map((lead, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`border rounded-2xl p-6 transition-all flex flex-col justify-between shadow ${lead.bg}`}
              >
                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase mb-4 text-[#C9A227]">
                    <span>{lead.type}</span>
                    <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white">{lead.price}</span>
                  </div>
                  <h3 className="text-lg font-black text-white">{lead.location}</h3>
                  <p className="text-xs text-slate-350 mt-2 font-medium leading-relaxed">{lead.details}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">Status: Verified</span>
                  <Link href="/register" className="bg-[#C9A227] hover:bg-amber-400 text-[#07162C] font-extrabold text-[11px] uppercase px-4 py-2 rounded-lg transition-colors">
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Gold CTA Bar Section */}
          <div className="bg-gradient-to-r from-[#C9A227] to-amber-400 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl">
            <div className="text-left text-[#07162C] max-w-xl">
              <h3 className="font-extrabold text-base sm:text-lg">Want More Exclusive Leads in Your Target Market?</h3>
              <p className="text-xs font-semibold text-[#07162C]/80 mt-1">Specify your zip code preferences and lead filters, and get instant notifications.</p>
            </div>
            <Link href="/register" className="bg-[#07162C] hover:bg-slate-900 text-white font-extrabold text-xs uppercase px-6 py-4 rounded-xl transition-all shadow-md shrink-0">
              Set My Preferences
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 03: DISCOVER PROPERTIES ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-100 text-[#07162C] border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[#C9A227] text-xs font-black uppercase tracking-wider font-mono">
              03 / Discover Properties
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0A2647] mt-2">
              Explore Our Premium Listings Portfolio
            </h2>

            {/* Curation Tabs */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-8 bg-slate-200/60 p-1.5 rounded-2xl max-w-md mx-auto border border-slate-200">
              {([
                { id: "sale", label: "For Sale" },
                { id: "rent", label: "For Rent" },
                { id: "new", label: "New Listings" },
                { id: "featured", label: "Featured" }
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPropertyTab(tab.id)}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all duration-300 cursor-pointer ${
                    propertyTab === tab.id
                      ? "bg-[#07162C] text-[#C9A227] shadow"
                      : "text-slate-600 hover:text-[#07162C]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            <AnimatePresence mode="wait">
              {discoverProperties[propertyTab].map((prop) => (
                <motion.article
                  key={prop.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-48 sm:h-56 overflow-hidden relative">
                      <Image
                        src={prop.img}
                        alt={prop.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 bg-[#07162C] text-[#C9A227] text-xs font-black px-3.5 py-1 rounded-full shadow-sm">
                        {prop.price}
                      </div>
                    </div>

                    <div className="p-6 text-left">
                      <span className="text-[10px] font-black text-[#C9A227] uppercase tracking-wider font-mono">{prop.desc}</span>
                      <h3 className="text-lg font-black text-[#0A2647] mt-1 group-hover:text-amber-700 transition-colors uppercase tracking-tight">{prop.title}</h3>
                      <p className="text-xs text-slate-500 mt-2 font-medium">{prop.addr}</p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-mono text-[10px]">Verified Listing</span>
                    <Link href="/properties" className="text-[#07162C] font-black uppercase hover:underline">
                      View Tour →
                    </Link>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── SECTION 04: HOW IT WORKS & LOGOS ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white text-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-[#C9A227] text-xs font-black uppercase tracking-wider font-mono">
              04 / How It Works
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A2647] mt-2">
              Simple. Transparent. Effective.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 text-left mb-12 sm:mb-16">
            {/* For Clients Columns */}
            <div className="bg-slate-50 p-6 sm:p-8 lg:p-10 rounded-3xl border border-slate-200">
              <h3 className="text-xl font-black text-[#0A2647] border-b border-slate-200 pb-4 mb-6 uppercase tracking-wider">
                For Clients & Investors
              </h3>
              <ul className="space-y-6">
                {[
                  { num: "01", title: "Share Your Needs", desc: "Submit details about your target property, budget scope, or specific zip area." },
                  { num: "02", title: "Get Matched", desc: "Our platform connects you instantly with the top-performing licensed broker profiles." },
                  { num: "03", title: "Take Action", desc: "Gain off-market listing pipeline access and close with absolute confidence." }
                ].map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="text-sm font-black text-[#C9A227] font-mono bg-white border border-slate-200 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm">{step.num}</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0A2647]">{step.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Professionals Columns */}
            <div className="bg-slate-50 p-6 sm:p-8 lg:p-10 rounded-3xl border border-slate-200">
              <h3 className="text-xl font-black text-[#0A2647] border-b border-slate-200 pb-4 mb-6 uppercase tracking-wider">
                For Real Estate Agents
              </h3>
              <ul className="space-y-6">
                {[
                  { num: "01", title: "Choose Your Market", desc: "Define your service zip codes, ideal customer filters, and lead category models." },
                  { num: "02", title: "Find Leads", desc: "Browse our dynamic verified marketplace pool to select and purchase active deals." },
                  { num: "03", title: "Close More Deals", desc: "Nurture connections using integrated follow-up SaaS workflows to scale ROI." }
                ].map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="text-sm font-black text-slate-800 font-mono bg-white border border-slate-200 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm">{step.num}</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0A2647]">{step.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Grayscale Active Brand Logos Strip */}
          <div className="border-t border-slate-200 pt-12">
            <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Trusted by Professionals from top offices</p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-14 opacity-50 hover:opacity-75 transition-opacity duration-300">
              {[
                { name: "RE/MAX", img: "/companies-logos/Dallas-RE-150x150.png" },
                { name: "eXp Realty", img: "/companies-logos/exp-realty-150x150.jpg" },
                { name: "Coldwell Banker", img: "/companies-logos/CB-realty-150x150.png" },
                { name: "Sotheby's", img: "/companies-logos/sotheby-logo-150x150.png" },
                { name: "Berkshire Hathaway", img: "/companies-logos/BHHS-logo-150x150.png" },
              ].map((logo, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <Image
                    src={logo.img}
                    alt={logo.name}
                    width={24}
                    height={24}
                    loading="lazy"
                    className="h-6 sm:h-8 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  <span className="text-[10px] font-black text-slate-500 font-mono uppercase group-hover:text-slate-900 transition-colors">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 05: EXPLORE BY CITY DIRECTORY ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#07162C]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[#C9A227] text-xs font-black uppercase tracking-wider font-mono">
              05 / Explore by City
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              National Footprint. Local Expertise.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
              Find listings, local market valuations, and active lead pipelines in high-volume metropolitan regions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { city: "Dallas, Texas", bg: "/variant2-hero.jpg", path: "/properties?city=Dallas" },
              { city: "Houston, Texas", bg: "/variant3-hero.jpg", path: "/properties?city=Houston" },
              { city: "Atlanta, Georgia", bg: "/variant1-hero.jpg", path: "/properties?city=Atlanta" },
              { city: "Miami, Florida", bg: "/variant4-hero.jpg", path: "/properties?city=Miami" }
            ].map((item, idx) => (
              <Link href={item.path} key={idx} className="relative rounded-2xl overflow-hidden aspect-[4/3] group shadow-lg flex flex-col justify-end p-5 border border-white/5 hover:border-[#C9A227]/30 transition-all duration-300">
                <Image
                  src={item.bg}
                  alt={item.city}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                <div className="relative z-10 text-left">
                  <h3 className="text-base font-extrabold text-white group-hover:text-[#C9A227] transition-colors">{item.city}</h3>
                  <span className="text-[10px] text-slate-300 font-mono font-bold uppercase mt-1 inline-block">Browse Opportunities →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 06: TOP RATED AGENTS & ADVISORS ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-100 text-[#07162C] border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 sm:mb-12">
            <div>
              <span className="text-[#C9A227] text-xs font-black uppercase tracking-wider font-mono">
                06 / Top Rated Agents & Advisors
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0A2647] mt-2">
                Connect with Verified Local Experts
              </h2>
            </div>
            <Link href="/realtors/agent-directory" className="text-xs font-extrabold text-[#07162C] hover:underline uppercase tracking-wider">
              View Directory →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {loadingAgents ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-2xl h-80 p-5 flex flex-col justify-between">
                  <div className="h-40 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-2/3 mt-4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2 mt-2" />
                  <div className="h-8 bg-slate-200 rounded-lg mt-4" />
                </div>
              ))
            ) : featuredAgents.length === 0 ? (
              <div className="col-span-full bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center">
                <p className="text-base font-bold text-[#0A2647]">No Featured Broker Partners Found</p>
                <Link href="/register" className="inline-block mt-4 bg-[#C9A227] text-[#07162C] font-extrabold px-6 py-3 rounded-xl text-xs uppercase transition-colors">
                  Join Agent Network
                </Link>
              </div>
            ) : (
              featuredAgents.slice(0, 4).map((agent, idx) => {
                const name = agentName(agent);
                const role = agent.headline || agent.specialties?.[0] || "Licensed Advisor";
                const location = [agent.office_city, agent.office_state].filter(Boolean).join(", ") || "Nationwide Network";
                const transCount = agent.sales_count !== undefined ? `${agent.sales_count} Closed Deals` : "Active Partner";
                const ratingLabel = agent.rating ? `${agent.rating} ★` : "Verified";
                const avatar = agent.user?.avatar || FALLBACK_AVATARS[name] || null;

                return (
                  <motion.article
                    key={agent.id || idx}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-48 overflow-hidden relative bg-slate-200">
                        {avatar ? (
                          <Image src={avatar} alt={name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" loading="lazy" className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#07162C] to-[#0A2647] flex items-center justify-center text-[#C9A227] font-semibold text-3xl font-mono">
                            {agentInitials(agent)}
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-[#07162C] text-[#C9A227] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                          {ratingLabel}
                        </div>
                      </div>

                      <div className="p-5 text-left">
                        <span className="text-[10px] font-bold text-[#C9A227] font-mono uppercase">{role}</span>
                        <h3 className="text-base font-black text-[#0A2647] leading-snug mt-1 truncate">{name}</h3>
                        <p className="text-xs text-slate-500 mt-1 truncate">{location}</p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="font-mono text-slate-800 text-[10px] font-bold">{transCount}</span>
                      <Link href={agent.slug ? `/agents/${agent.slug}` : "/realtors/agent-directory"} className="text-[#07162C] font-black uppercase hover:underline">
                        Profile →
                      </Link>
                    </div>
                  </motion.article>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 07: CHOOSE YOUR PREFERRED PARTNERSHIP TIER ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white text-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[#C9A227] text-xs font-black uppercase tracking-wider font-mono">
              07 / Partnership Tiers
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A2647] mt-2">
              Accelerate Your Lead Pipeline
            </h2>

            {/* Billing Switcher Toggle */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-xs font-extrabold uppercase ${billingPeriod === "one-time" ? "text-[#0A2647]" : "text-slate-400"}`}>One-time package</span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === "one-time" ? "annual" : "one-time")}
                aria-label="Toggle billing duration subscription model"
                className="w-12 h-6 rounded-full bg-slate-200 p-1 flex items-center transition-colors focus:outline-none cursor-pointer"
              >
                <div className={`w-4 h-4 rounded-full bg-[#07162C] shadow-sm transform transition-transform ${billingPeriod === "annual" ? "translate-x-6 bg-[#C9A227]" : ""}`} />
              </button>
              <span className={`text-xs font-extrabold uppercase flex items-center gap-1.5 ${billingPeriod === "annual" ? "text-[#0A2647]" : "text-slate-400"}`}>
                Annual Membership <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">SAVE 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
            {(["Solo", "Starter", "Professional", "Elite"] as const).map((tierKey) => {
              const baseTier = AGENT_PLAN_TIERS.find((p) => p.name === tierKey);
              if (!baseTier) return null;
              
              /* Annual tiers quote the full yearly figure, not the monthly
                 equivalent. The two were inconsistent: this card said "$21/mo"
                 while /pricing said "$250/yr" for the same tier, which reads as
                 a different product to anyone comparing the two pages. */
              const priceVal = billingPeriod === "annual" ? baseTier.annualTotalPrice : (baseTier.oneTimePrice ?? baseTier.annualTotalPrice);
              const isPopular = tierKey === "Professional";

              return (
                <div
                  key={tierKey}
                  className={`rounded-3xl p-6 border transition-all flex flex-col justify-between text-left ${
                    isPopular
                      ? "border-[#C9A227] bg-[#07162C] text-white shadow-xl lg:scale-105 relative"
                      : "border-slate-200 bg-slate-50 text-slate-800 shadow-sm hover:shadow"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C9A227] text-[#07162C] text-[10px] font-black uppercase px-3 py-1 rounded-full shadow">
                      MOST POPULAR
                    </span>
                  )}
                  <div>
                    <h3 className={`text-lg font-black uppercase tracking-wider ${isPopular ? "text-[#C9A227]" : "text-[#0A2647]"}`}>
                      {tierKey}
                    </h3>
                    <div className="mt-4 mb-6">
                      <span className="text-3xl font-black font-mono">
                        ${priceVal}
                      </span>
                      <span className={`text-xs font-medium ${isPopular ? "text-slate-400" : "text-slate-500"}`}>
                        /{billingPeriod === "annual" ? "year" : "one-time"}
                      </span>
                      <p className={`text-[10px] font-semibold mt-1 ${isPopular ? "text-slate-300" : "text-slate-500"}`}>
                        {billingPeriod === "annual"
                          ? "Billed once per year · no monthly charge"
                          : "Pay once · no recurring charge"}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8 text-xs font-medium leading-relaxed">
                      {baseTier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className={`text-[10px] shrink-0 mt-0.5 ${isPopular ? "text-[#C9A227]" : "text-[#0A2647]"}`}>✔</span>
                          <span className={isPopular ? "text-slate-200" : "text-slate-600"}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href="/register"
                    className={`w-full text-center font-extrabold text-xs uppercase py-3.5 rounded-xl transition-all ${
                      isPopular
                        ? "bg-[#C9A227] hover:bg-amber-400 text-[#07162C] shadow-lg shadow-[#C9A227]/10"
                        : "bg-[#07162C] hover:bg-slate-900 text-white"
                    }`}
                  >
                    Select Plan
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 08: FREQUENTLY ASKED QUESTIONS ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-100 text-[#07162C] border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[#C9A227] text-xs font-black uppercase tracking-wider font-mono">
              08 / Got Questions? We Have Answers.
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0A2647] mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-extrabold text-[#0a2647]">{item.q}</span>
                    <span className="text-slate-400 text-lg transition-transform duration-300 font-mono">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-slate-50/50"
                      >
                        <div className="px-6 pb-6 pt-2 text-[#0A2647] text-xs leading-relaxed font-medium">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 09: STAY AHEAD IN REAL ESTATE ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#07162C] text-center border-t border-slate-800 relative overflow-hidden">
        {/* Dynamic Glowing Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[150px] bg-[#C9A227]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-[#C9A227] text-xs font-black uppercase tracking-wider font-mono">
            09 / Stay Ahead in Real Estate
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">
            Subscribe for Inbound Deal Alerts
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
            Get early access notifications of newly listed below-market and distressed assets.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Enter your professional email..."
              className="w-full bg-[#0A2647] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:border-[#C9A227] transition-all"
            />
            <button
              type="submit"
              className="bg-[#C9A227] hover:bg-amber-400 text-[#07162C] font-extrabold text-xs uppercase px-8 py-3.5 rounded-xl transition-all shrink-0 border border-[#C9A227]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
