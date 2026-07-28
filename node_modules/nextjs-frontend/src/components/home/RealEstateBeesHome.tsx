"use client";


import Link from "next/link";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroVariants from "@/components/home/HeroVariants";
import CompanyLogos from "@/components/home/CompanyLogos";

export default function RealEstateBeesHome() {
  const [activeHeroTab, setActiveHeroTab] = useState<"leads" | "properties" | "directory" | "academy">("leads");
  const [activeProIndex, setActiveProIndex] = useState(0);
  const [activeDirectoryTab, setActiveDirectoryTab] = useState<"pros" | "buyers" | "category" | "directory">("pros");
  const [directorySearch, setDirectorySearch] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  /* Calculator State */
  const [monthlyLeads, setMonthlyLeads] = useState(50);
  const [avgCommission, setAvgCommission] = useState(8500);

  /* Interactive Investor Tools State */
  const [calcCapRate, setCalcCapRate] = useState({ noi: 45000, price: 500000 });
  const [calcFlip, setCalcFlip] = useState({ arv: 350000, repairs: 45000 });

  const proSegments = [
    {
      id: "01",
      title: "Domestic Real Estate Investors",
      tagline: "High-Yield Domestic Real Estate Lead Flow & Investment Software",
      desc: "Connect directly with motivated off-market sellers, distressed property leads, and institutional funding partners on DomesticRealEstate. Access real-time ROI tracking, automated comps, and instant skip-tracing tools.",
      cta: "Explore Investor Tools",
      icon: "💼",
      href: "/investors",
    },
    {
      id: "02",
      title: "Domestic Real Estate Agents",
      tagline: "Exclusive Domestic RealEstate Buyer & Seller Leads in Your Zip Code",
      desc: "Supercharge your commission pipeline with pre-vetted buyer & seller inquiries from domestic realestate campaigns. Utilize automated CRM integrations, drip campaigns, and targeted local advertising.",
      cta: "Explore Agent Solutions",
      icon: "🏆",
      href: "/realtors",
    },
    {
      id: "03",
      title: "Brokers",
      tagline: "Enterprise Brokerage Management on DomesticRealEstate",
      desc: "Scale your team with intelligent domestic real estate lead routing, agent performance analytics, automated compliance reporting, and white-label transaction management.",
      cta: "Explore Brokerage Tech",
      icon: "🏢",
      href: "/brokerages",
    },
    {
      id: "04",
      title: "Lenders",
      tagline: "Qualified Loan Applicants & Domestic Real Estate Mortgage Leads",
      desc: "Receive pre-qualified mortgage, refinance, and hard-money loan requests directly from active domestic real estate buyers and property investors on DomesticRealEstate.",
      cta: "Explore Lending Leads",
      icon: "💳",
      href: "/lenders",
    },
    {
      id: "05",
      title: "Tech Pros",
      tagline: "Domestic Real Estate API, SaaS Integrations & Data Feeds",
      desc: "Integrate nationwide MLS feeds, property valuation APIs, AI skip tracing, and automated marketing Webhooks with DomesticRealEstate developer tools.",
      cta: "Explore Developer APIs",
      icon: "⚡",
      href: "/resources",
    },
    {
      id: "06",
      title: "Services",
      tagline: "Connect with Domestic Real Estate Buyers, Sellers & Agents",
      desc: "Showcase your title, inspection, appraisal, or legal services directly to active domestic realestate transactions on Domestic Real Estate.",
      cta: "List Your Service",
      icon: "🛠️",
      href: "/services",
    },
  ];

  /* Comprehensive Directory Cards Matrix with Specific Group Classifications */
  const directoryCards = [
    // FOR PROS (INVESTORS, AGENTS, BROKERS, WHOLESALERS)
    { name: "Real Estate Leads", desc: "Motivated seller & exclusive zip code leads", icon: "🎯", tag: "Popular", group: "pros", route: "/realtors" },
    { name: "Wholesalers & Comps", desc: "Off-market deal finder & comp analytics", icon: "📊", tag: "Investors", group: "pros", route: "/investors" },
    { name: "CRM & Auto-Dialers", desc: "Automated pipeline management & cold dialers", icon: "📱", tag: "Software", group: "pros", route: "/realtors" },
    { name: "Virtual Assistants", desc: "Cold calling & admin ISA services", icon: "🎧", tag: "Services", group: "pros", route: "/services" },
    { name: "Foreclosure Data", desc: "REO, pre-foreclosure & probate leads", icon: "🏚️", tag: "Data", group: "pros", route: "/investors" },
    { name: "Hard Money Lenders", desc: "Fix & flip private capital & bridge loans", icon: "💵", tag: "Finance", group: "pros", route: "/lenders" },
    { name: "Lead Generators", desc: "PPC, SEO & targeted Facebook ad tools", icon: "🚀", tag: "Featured", group: "pros", route: "/realtors" },
    { name: "Skip Tracing APIs", desc: "Instant owner phone & email skip tracing", icon: "⚡", tag: "Tech", group: "pros", route: "/resources" },

    // FOR BUYERS & SELLERS
    { name: "Real Estate Teams", desc: "Top-producing local agent teams & groups", icon: "👥", tag: "Hot", group: "buyers", route: "/realtors/agent-directory" },
    { name: "Mortgage Brokers", desc: "Conventional, FHA & VA lenders", icon: "🏦", tag: "Finance", group: "buyers", route: "/lenders" },
    { name: "Home Inspectors", desc: "Certified pre-purchase property inspectors", icon: "🔍", tag: "Services", group: "buyers", route: "/services" },
    { name: "Title & Escrow", desc: "National title & closing companies", icon: "📜", tag: "Closing", group: "buyers", route: "/services" },
    { name: "Real Estate Attorneys", desc: "Title, escrow & contract closing legal pros", icon: "⚖️", tag: "Legal", group: "buyers", route: "/services" },
    { name: "Home Builders", desc: "Custom home builders & general contractors", icon: "🏗️", tag: "Directory", group: "buyers", route: "/properties" },
    { name: "Real Estate Education", desc: "Licensing & homebuyer masterclasses", icon: "🎓", tag: "Academy", group: "buyers", route: "/resources" },
    { name: "Home Warranty", desc: "Comprehensive home protection plans", icon: "🏠", tag: "Protection", group: "buyers", route: "/properties" },

    // BY CATEGORY (TECH, MARKETING, SERVICES, LEGAL)
    { name: "Real Estate Software", desc: "CRM, analytics & valuation tech", icon: "💻", tag: "Top Rated", group: "category", route: "/resources" },
    { name: "Property Management", desc: "Landlord, rent collection & portal tech", icon: "🔑", tag: "Essential", group: "category", route: "/properties" },
    { name: "Real Estate Marketing", desc: "Direct mail, virtual staging & flyers", icon: "📢", tag: "Growth", group: "category", route: "/services" },
    { name: "Tax & CPA Services", desc: "1031 exchange & cost segregation tax pros", icon: "🧾", tag: "Tax", group: "category", route: "/services" },
    { name: "Real Estate Photographers", desc: "HDR photos & 3D virtual tours", icon: "📸", tag: "Media", group: "category", route: "/services" },
    { name: "Transaction Support", desc: "Contract-to-close virtual coordinators", icon: "📋", tag: "Services", group: "category", route: "/services" },
    { name: "Debt Recovery & Legal", desc: "Tenant eviction & legal advisory", icon: "🛡️", tag: "Legal", group: "category", route: "/services" },
    { name: "Real Estate Accountants", desc: "Real estate audit & CPA experts", icon: "📈", tag: "Finance", group: "category", route: "/services" },
  ];

  /* Filter Directory Cards by Active Tab & Search Query */
  const filteredDirectoryCards = directoryCards.filter((card) => {
    const matchesTab =
      activeDirectoryTab === "directory" || card.group === activeDirectoryTab;
    const matchesSearch =
      !directorySearch ||
      card.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      card.desc.toLowerCase().includes(directorySearch.toLowerCase()) ||
      card.tag.toLowerCase().includes(directorySearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const cityDirectory = [
    { city: "Miami, FL", leads: "1,240 Active Deals", avgPrice: "$850/sqft", growth: "+6.4%" },
    { city: "Austin, TX", leads: "980 Active Deals", avgPrice: "$620/sqft", growth: "+4.8%" },
    { city: "Los Angeles, CA", leads: "1,850 Active Deals", avgPrice: "$980/sqft", growth: "+5.2%" },
    { city: "Dallas, TX", leads: "1,410 Active Deals", avgPrice: "$450/sqft", growth: "+7.1%" },
    { city: "New York, NY", leads: "2,100 Active Deals", avgPrice: "$1,850/sqft", growth: "+3.9%" },
    { city: "Chicago, IL", leads: "1,150 Active Deals", avgPrice: "$390/sqft", growth: "+4.2%" },
    { city: "Atlanta, GA", leads: "1,320 Active Deals", avgPrice: "$410/sqft", growth: "+6.8%" },
    { city: "Phoenix, AZ", leads: "940 Active Deals", avgPrice: "$380/sqft", growth: "+5.9%" },
  ];

  const topAgents = [
    { name: "Alexandra Vance", role: "Luxury Specialist", location: "Miami & Palm Beach", volume: "$145M Sold", rating: "4.9 ★", image: "/variant1-hero.jpg" },
    { name: "Marcus Sterling", role: "Off-Market Wholesaler", location: "Dallas & Austin", volume: "120+ Deals/yr", rating: "4.9 ★", image: "/variant2-hero.jpg" },
    { name: "Elena Rostova", role: "Commercial Broker", location: "New York & Tribeca", volume: "$210M Sold", rating: "5.0 ★", image: "/variant3-hero.jpg" },
    { name: "David Chen", role: "Investment Advisor", location: "San Jose & Tech Corridor", volume: "$95M Sold", rating: "4.8 ★", image: "/variant4-hero.jpg" },
  ];

  const popularReviews = [
    {
      id: 1,
      title: "Best Real Estate Lead Generation Platforms of 2026",
      category: "Software Guide",
      rating: "4.9 ★★★★★",
      badge: "Verified Benchmark",
      snippet: "Comprehensive comparison of conversion rates, cost-per-lead, and CRM integration for top seller lead providers.",
      updated: "Updated 3 days ago",
    },
    {
      id: 2,
      title: "Top 10 Property Management & Tenant Screening Systems",
      category: "Software Review",
      rating: "4.8 ★★★★★",
      badge: "Editor's Choice",
      snippet: "In-depth review of online rent collection, automated lease agreements, and maintenance ticketing platforms.",
      updated: "Updated 1 week ago",
    },
    {
      id: 3,
      title: "Top Real Estate CRM Systems for Single Agents & Teams",
      category: "Tech Roundup",
      rating: "4.9 ★★★★★",
      badge: "Highest ROI",
      snippet: "We tested 15 leading CRMs for speed, automated SMS follow-ups, and AI contact scoring capabilities.",
      updated: "Updated 5 days ago",
    },
    {
      id: 4,
      title: "Best Hard Money & Private Lenders for Fix-and-Flip Investors",
      category: "Lender Index",
      rating: "4.7 ★★★★★",
      badge: "Top Rated",
      snippet: "Comparing loan-to-value ratios, fast 7-day closing capabilities, and interest rates across national lenders.",
      updated: "Updated 2 days ago",
    },
  ];

  const faqItems = [
    {
      q: "How does the Domestic Real Estate (DomesticRealEstate) Lead Generation Marketplace work?",
      a: "Our Domestic Real Estate network connects real estate agents, investors, and brokers directly with motivated seller leads, off-market property owners, and pre-screened home buyers. Leads are verified using real-time skip tracing and domestic realestate property data feeds.",
    },
    {
      q: "Are Domestic Real Estate leads exclusive or shared among multiple agents?",
      a: "We offer both 100% exclusive zip code lead packages assigned to a single agent as well as shared marketplace inquiries on DomesticRealEstate for wholesalers and private lenders.",
    },
    {
      q: "Can I integrate domestic realestate leads with my existing CRM?",
      a: "Yes! Our DomesticRealEstate platform features native Webhook and API integrations supporting Follow Up Boss, KVCore, Salesforce, HubSpot, Zapier, and leading real estate CRMs.",
    },
    {
      q: "How are domestic real estate software platforms evaluated and reviewed on DomesticRealEstate?",
      a: "Our Domestic Real Estate editorial board benchmarks software based on conversion ROI, customer service ratings, platform uptime, API access, and verified user testimonials.",
    },
  ];

  const currentPro = proSegments[activeProIndex];
  const estAnnualRevenue = Math.round(monthlyLeads * 0.06 * avgCommission);

  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen">
      
      {/* ── HERO OPTION 3 (FRAMER MOTION INTEGRATED HERO) ── */}
      <HeroVariants heroId={3} />

      {/* ── PARTNER BROKERAGES TRUST BAR (real logos from /public/companies-logos) ── */}
      <CompanyLogos />

      {/* ── NEW SECTION 1: LIVE OFF-MARKET MOTIVATED SELLER LEAD FEED ── */}
      <section className="py-12 bg-[#07162C] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[#C9A227] text-xs font-mono font-bold uppercase tracking-wider">Live Domestic Real Estate Deal Marketplace Feed</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <p className="text-xs text-slate-200 font-medium">
                ⚡ Real-time motivated seller inquiries claimed on DomesticRealEstate in the last 60 minutes
              </p>
              <Link href="/register" className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-extrabold px-4 py-2 rounded-lg text-xs transition-all shadow-md shrink-0 text-center">
                Claim Domestic Real Estate Deals
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { loc: "Dallas, TX 75201", type: "Pre-Foreclosure Single Family", arv: "$340,000", time: "4 mins ago", status: "Claimed by Agent" },
              { loc: "Miami, FL 33139", type: "Absentee Owner Condo", arv: "$520,000", time: "12 mins ago", status: "Pending Inspection" },
              { loc: "Phoenix, AZ 85001", type: "High-Equity Fixer Upper", arv: "$295,000", time: "18 mins ago", status: "Exclusive Access" },
              { loc: "Atlanta, GA 30301", type: "Probate Multi-Family", arv: "$410,000", time: "25 mins ago", status: "Hot Lead" },
            ].map((lead, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                className="bg-slate-800/90 border border-slate-700 hover:border-[#C9A227] p-4 rounded-xl shadow-lg"
              >
                <div className="flex justify-between items-center text-[11px] mb-2 font-mono">
                  <span className="text-[#C9A227] font-bold">{lead.time}</span>
                  <span className="bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded border border-emerald-500/40">
                    {lead.status}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white">{lead.loc}</h4>
                <p className="text-xs text-slate-200 mt-1 font-medium">{lead.type}</p>
                <div className="mt-3 pt-2 border-t border-slate-700 flex justify-between items-center text-xs">
                  <span className="text-slate-300">Est. ARV: <strong className="text-white font-mono">{lead.arv}</strong></span>
                  <Link href="/register" className="text-[#C9A227] font-extrabold hover:underline">
                    Claim →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── "EMPOWERING REAL ESTATE PROS" HEXAGONAL SELECTOR ── */}
      <section className="py-20 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest">Tailored Domestic Real Estate Solutions</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2647] mt-1 mb-12">
            Empowering Domestic Real Estate Professionals | DomesticRealEstate
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
            
            {/* Left Interactive 6-Tile Hexagon Grid */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-md">
                {proSegments.map((pro, idx) => {
                  const isActive = activeProIndex === idx;
                  return (
                    <motion.button
                      key={pro.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveProIndex(idx)}
                      className={`relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer ${
                        isActive
                          ? "bg-[#0A2647] border-[#C9A227] text-[#C9A227] shadow-[0_8px_25px_rgba(10,38,71,0.3)] scale-105 ring-2 ring-[#C9A227]/40"
                          : "bg-white border-slate-200 hover:border-[#0A2647] text-[#0A2647] font-extrabold hover:shadow"
                      }`}
                    >
                      <span className="text-3xl mb-2">{pro.icon}</span>
                      <span className={`text-xs font-extrabold ${isActive ? "text-[#C9A227]" : "text-[#0A2647]"}`}>{pro.title}</span>
                      <span className={`text-[10px] mt-1 font-mono font-bold ${isActive ? "text-[#C9A227]" : "text-slate-500"}`}>
                        {pro.id}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Right Segment Info Display Card (AnimatePresence) */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPro.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-xl relative"
                >
                  <div className="text-4xl font-extrabold text-[#0A2647]/15 font-mono mb-2">{currentPro.id}</div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0A2647]">{currentPro.title}</h3>
                  <p className="text-sm font-bold text-[#C9A227] mt-1">{currentPro.tagline}</p>
                  
                  <p className="mt-4 text-slate-800 text-base leading-relaxed font-medium">
                    {currentPro.desc}
                  </p>

                  <div className="mt-8 flex items-center gap-4">
                    <Link href={currentPro.href || "/"} passHref legacyBehavior>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="bg-[#C9A227] hover:bg-[#0A2647] text-[#0A2647] hover:text-white font-extrabold px-6 py-3.5 rounded-xl text-sm shadow-md transition-all cursor-pointer border border-[#C9A227]"
                      >
                        {currentPro.cta} →
                      </motion.button>
                    </Link>
                    <span className="text-xs text-slate-600 font-semibold">Free Access Included</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* ── "ONE-STOP SHOP" RESOURCE DIRECTORY MATRIX (FIXED & DYNAMICALLY FILTERED) ── */}
      <section id="directory" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest">Complete Directory</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2647] mt-1">
            One-Stop Shop for All Domestic Real Estate & DomesticRealEstate Resources
          </h2>
          <p className="mt-2 text-sm text-slate-600 font-medium max-w-2xl mx-auto">
            Browse verified domestic real estate tools, lead sources, lenders, and service providers on domestic realestate.
          </p>

          {/* Directory Category Filter Tabs */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              { id: "pros", label: "For Pros (Investors & Agents)" },
              { id: "buyers", label: "For Buyers & Sellers" },
              { id: "category", label: "By Software & Tech" },
              { id: "directory", label: "Full Directory (All)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveDirectoryTab(tab.id as any);
                  setDirectorySearch("");
                }}
                className={`px-6 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer border-2 ${
                  activeDirectoryTab === tab.id
                    ? "bg-[#C9A227] text-[#0A2647] border-[#C9A227] shadow-lg scale-105"
                    : "bg-white text-[#0A2647] border-slate-200 hover:border-[#0A2647] hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dynamic Search Bar & Counter */}
          <div className="mt-6 max-w-lg mx-auto flex items-center gap-3 bg-white border-2 border-slate-200 rounded-full px-4 py-2 shadow-sm focus-within:border-[#C9A227]">
            <span className="text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search 500+ domestic real estate lead tools, CRMs, DomesticRealEstate resources..."
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none placeholder-slate-400"
            />
            {directorySearch && (
              <button
                onClick={() => setDirectorySearch("")}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
              >
                ✕
              </button>
            )}
            <button
              className="bg-[#0A2647] hover:bg-[#0c2f57] text-white font-extrabold px-4 py-1.5 rounded-full text-xs transition-all shadow-sm shrink-0 cursor-pointer"
            >
              Search
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-500 font-semibold">
            Showing <strong className="text-[#0A2647]">{filteredDirectoryCards.length}</strong> verified resources
          </div>
        </div>

        {/* Dynamic 4-Column Directory Cards Matrix with Framer Motion AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDirectoryTab + directorySearch}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filteredDirectoryCards.map((card, idx) => (
              <Link href={card.route || "/"} key={idx} passHref legacyBehavior>
                <motion.a
                  whileHover={{ scale: 1.04, y: -4 }}
                  className="bg-white border border-slate-200 hover:border-[#0A2647] rounded-2xl p-5 transition-all duration-200 hover:shadow-xl group cursor-pointer flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{card.icon}</span>
                      <span className="bg-slate-100 text-[#0A2647] group-hover:bg-[#0A2647] group-hover:text-[#C9A227] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full transition-colors">
                        {card.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#0A2647] group-hover:text-[#C9A227] transition-colors">
                      {card.name}
                    </h3>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">{card.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-extrabold text-[#0A2647] group-hover:text-[#C9A227] flex items-center justify-between">
                    <span>Explore Category</span>
                    <span>→</span>
                  </div>
                </motion.a>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── NEW SECTION 2: REAL ESTATE SOFTWARE BENCHMARK & COMPARISON TABLE ── */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest">Domestic RealEstate Benchmarks</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2647] mt-1">
              Domestic Real Estate Tech Comparison Matrix
            </h2>
            <p className="text-xs text-slate-600 font-medium max-w-xl mx-auto mt-2">
              Compare domestic real estate lead quality, automation features, and verified DomesticRealEstate user ratings across top platforms.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0A2647] text-white">
                  <th className="p-4 rounded-tl-xl font-extrabold text-sm">Platform</th>
                  <th className="p-4 font-extrabold text-sm">Lead Verification</th>
                  <th className="p-4 font-extrabold text-sm">AI Skip Tracing</th>
                  <th className="p-4 font-extrabold text-sm">Zip Code Lock</th>
                  <th className="p-4 font-extrabold text-sm">Pricing</th>
                  <th className="p-4 rounded-tr-xl font-extrabold text-sm text-center">User Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { name: "Domestic Real Estate (DomesticRealEstate)", ver: "Real-Time Verified", skip: "Included", zip: "100% Exclusive", price: "Flexible / Deal", rating: "4.9 ★★★★★", badge: "Highest ROI" },
                  { name: "KVCore", ver: "Standard Imports", skip: "Add-on Extra", zip: "Shared Zip", price: "$499 / month", rating: "4.4 ★★★★☆", badge: "" },
                  { name: "Follow Up Boss", ver: "Integration Only", skip: "Third-Party", zip: "N/A", price: "$299 / month", rating: "4.7 ★★★★★", badge: "" },
                  { name: "BoomTown", ver: "Managed PPC", skip: "Not Included", zip: "Shared Zip", price: "$1,000+ / month", rating: "4.3 ★★★★☆", badge: "" },
                ].map((row, idx) => (
                  <tr key={idx} className={idx === 0 ? "bg-amber-500/10 font-bold border-2 border-[#C9A227]" : "hover:bg-slate-50"}>
                    <td className="p-4 font-extrabold text-[#0A2647] text-sm flex items-center gap-2">
                      {row.name}
                      {row.badge && <span className="bg-[#C9A227] text-[#0A2647] text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold">{row.badge}</span>}
                    </td>
                    <td className="p-4 text-slate-800">{row.ver}</td>
                    <td className="p-4 text-slate-800">{row.skip}</td>
                    <td className="p-4 text-slate-800">{row.zip}</td>
                    <td className="p-4 font-mono font-bold text-[#0A2647]">{row.price}</td>
                    <td className="p-4 text-center font-extrabold text-amber-600">{row.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── NEW SECTION 3: FREE REAL ESTATE CALCULATORS & INVESTOR TOOLS HUB ── */}
      <section className="py-20 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest">Interactive Domestic Real Estate Modeler</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2647] mt-1">
              Domestic Real Estate Investor & Agent Financial Tools Hub
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1">Run quick calculations on deal profitability and property returns in real time with DomesticRealEstate tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tool 1: Cap Rate Calculator */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-[#0A2647]">🧮 Rental Property Cap Rate Tool</h3>
                <span className="bg-[#0A2647] text-[#C9A227] text-xs font-mono font-extrabold px-3 py-1 rounded-full">
                  Cap Rate: {((calcCapRate.noi / calcCapRate.price) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="space-y-4 text-xs font-bold text-slate-700">
                <div>
                  <label className="block mb-1">Net Operating Income (NOI / yr)</label>
                  <input
                    type="number"
                    value={calcCapRate.noi}
                    onChange={(e) => setCalcCapRate({ ...calcCapRate, noi: Number(e.target.value) })}
                    className="w-full bg-slate-100 p-3 rounded-xl border border-slate-300 font-mono text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1">Total Purchase Price ($)</label>
                  <input
                    type="number"
                    value={calcCapRate.price}
                    onChange={(e) => setCalcCapRate({ ...calcCapRate, price: Number(e.target.value) })}
                    className="w-full bg-slate-100 p-3 rounded-xl border border-slate-300 font-mono text-slate-900 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Tool 2: Fix & Flip 70% Rule Calculator */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-[#0A2647]">🏚️ Fix & Flip 70% Maximum Offer Tool</h3>
                <span className="bg-[#0A2647] text-emerald-400 text-xs font-mono font-extrabold px-3 py-1 rounded-full">
                  Max Allowable Offer: ${(calcFlip.arv * 0.7 - calcFlip.repairs).toLocaleString()}
                </span>
              </div>
              <div className="space-y-4 text-xs font-bold text-slate-700">
                <div>
                  <label className="block mb-1">After Repair Value (ARV / $)</label>
                  <input
                    type="number"
                    value={calcFlip.arv}
                    onChange={(e) => setCalcFlip({ ...calcFlip, arv: Number(e.target.value) })}
                    className="w-full bg-slate-100 p-3 rounded-xl border border-slate-300 font-mono text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1">Estimated Renovation Budget ($)</label>
                  <input
                    type="number"
                    value={calcFlip.repairs}
                    onChange={(e) => setCalcFlip({ ...calcFlip, repairs: Number(e.target.value) })}
                    className="w-full bg-slate-100 p-3 rounded-xl border border-slate-300 font-mono text-slate-900 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEO SECTION 1: TOP CITY MARKET DIRECTORY ── */}
      <section className="py-16 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <div>
              <span className="text-[#C9A227] text-xs font-mono uppercase tracking-widest">Regional Intelligence</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">Top City Domestic Real Estate Markets</h2>
            </div>
            <p className="text-xs text-slate-200 max-w-md mt-2 md:mt-0 font-medium">
              Explore active motivated seller deals and average pricing metrics across major domestic real estate metropolitan areas on DomesticRealEstate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cityDirectory.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                className="bg-slate-800/90 border border-slate-700 hover:border-[#C9A227] p-4 rounded-xl transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-white text-sm font-extrabold">{item.city}</span>
                  <span className="text-emerald-400 font-mono font-bold">{item.growth}</span>
                </div>
                <div className="text-xs text-[#C9A227] font-bold">{item.leads}</div>
                <div className="text-[11px] text-slate-200 mt-2 font-mono font-semibold">Avg Price: {item.avgPrice}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEO SECTION 2: INTERACTIVE ROI & LEAD CALCULATOR ── */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 text-left">
              <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest">Interactive Calculator</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2647] mt-1 leading-tight">
                Calculate Your Domestic Real Estate Commission Pipeline & ROI
              </h2>
              <p className="mt-4 text-slate-800 text-base leading-relaxed font-medium">
                Estimate your annual domestic realestate deal revenue based on monthly lead volume and average commission size using our DomesticRealEstate pipeline modeler.
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
                    <span>Monthly Lead Volume</span>
                    <span className="text-[#0A2647] font-mono text-sm bg-amber-100 text-[#0A2647] px-2 py-0.5 rounded font-extrabold">{monthlyLeads} Leads / mo</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={monthlyLeads}
                    onChange={(e) => setMonthlyLeads(parseInt(e.target.value))}
                    className="w-full accent-[#C9A227] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
                    <span>Avg Commission Per Closed Deal</span>
                    <span className="text-[#0A2647] font-mono text-sm bg-amber-100 text-[#0A2647] px-2 py-0.5 rounded font-extrabold">${avgCommission.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="3000"
                    max="25000"
                    step="500"
                    value={avgCommission}
                    onChange={(e) => setAvgCommission(parseInt(e.target.value))}
                    className="w-full accent-[#C9A227] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Live Calculation Display Box */}
            <div className="lg:col-span-6 bg-[#0A2647] text-white p-8 rounded-3xl shadow-2xl border-2 border-[#C9A227] text-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#C9A227]">Projected Annual Revenue</span>
              <motion.div
                key={estAnnualRevenue}
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl sm:text-5xl font-extrabold text-[#C9A227] font-mono my-4"
              >
                ${estAnnualRevenue.toLocaleString()}
              </motion.div>

              <div className="text-xs text-slate-100 font-medium max-w-sm mx-auto leading-relaxed">
                Based on an industry standard 6% conversion rate from verified seller lead to closed escrow.
              </div>

              <Link href="/realtors/join" className="mt-8 bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-lg hover:scale-105 transition-all cursor-pointer">
                Unlock My Zip Code Pipeline →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── SEO SECTION 3: TOP VERIFIED AGENTS SHOWCASE ── */}
      <section className="py-20 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest">Domestic Real Estate Directory</span>
              <h2 className="text-3xl font-extrabold text-[#0A2647] mt-1">Top Rated Domestic Real Estate Agents & Advisors</h2>
            </div>
            <Link href="/realtors/agent-directory" className="text-xs font-extrabold text-[#0A2647] hover:underline">
              View Full DomesticRealEstate Agent Directory →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topAgents.map((agent, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
              >
                <div className="h-44 overflow-hidden relative">
                  <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-[#0A2647] text-[#C9A227] text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow">
                    {agent.rating}
                  </div>
                </div>

                <div className="p-5 text-left">
                  <h3 className="text-base font-extrabold text-[#0A2647]">{agent.name}</h3>
                  <p className="text-xs text-[#C9A227] font-extrabold">{agent.role}</p>
                  <p className="text-xs text-slate-700 font-medium mt-1">{agent.location}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-900 font-extrabold">{agent.volume}</span>
                    <Link href="/realtors/agent-directory" className="text-[#0A2647] font-extrabold hover:underline">
                      Contact →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR REVIEWS & BENCHMARKS ── */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest">Expert Evaluations</span>
              <h2 className="text-3xl font-extrabold text-[#0A2647] mt-1">Popular Software Reviews & Comparisons</h2>
            </div>
            <Link href="/testimonials" className="text-xs font-extrabold text-[#0A2647] hover:underline">
              View All Reviews →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularReviews.map((rev) => (
              <motion.div
                key={rev.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-[#0A2647] font-extrabold">{rev.category}</span>
                    <span className="text-amber-600 font-extrabold">{rev.rating}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#0A2647] leading-snug">{rev.title}</h3>
                  <p className="text-xs text-slate-800 mt-3 leading-relaxed font-medium">{rev.snippet}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">{rev.updated}</span>
                  <Link href="/testimonials" className="font-extrabold text-[#0A2647] hover:text-[#C9A227] hover:underline">
                    Read Review →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3D GROWTH & COMMUNITY BANNER (REAL ESTATE BEES STYLE) ── */}
      <section className="py-20 bg-gradient-to-r from-[#0A2647] via-[#0D315c] to-[#0A2647] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7">
              <span className="bg-[#C9A227] text-[#0A2647] text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                DomesticRealEstate Network
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 leading-tight">
                Join The Largest Rapidly Growing Community of <span className="text-[#C9A227]">Domestic Real Estate Experts</span>
              </h2>

              <ul className="mt-6 space-y-3 text-sm text-slate-100 font-medium">
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#C9A227] text-[#0A2647] font-extrabold flex items-center justify-center text-xs">✓</span>
                  Access exclusive off-market deals and verified domestic realestate motivated seller lead channels.
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#C9A227] text-[#0A2647] font-extrabold flex items-center justify-center text-xs">✓</span>
                  Network directly with 45,000+ domestic real estate investors, top brokers, lenders, and tech partners.
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#C9A227] text-[#0A2647] font-extrabold flex items-center justify-center text-xs">✓</span>
                  Get featured in nationwide DomesticRealEstate directories and rank higher locally.
                </li>
              </ul>

              <Link href="/register" className="mt-8 bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-extrabold px-8 py-4 rounded-xl text-sm shadow-2xl hover:scale-105 transition-all cursor-pointer">
                Join The Club Free →
              </Link>
            </div>

            {/* Right 3D Bar Chart Visual Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-center w-full max-w-sm">
                <div className="text-5xl mb-4">🚀</div>
                <div className="text-4xl font-extrabold text-[#C9A227] font-mono">+340%</div>
                <div className="text-xs uppercase tracking-wider text-slate-200 font-extrabold mt-1">Quarterly Growth Rate</div>
                
                <div className="mt-6 flex items-end justify-center gap-3 h-28">
                  <div className="w-8 bg-slate-400/40 rounded-t-lg h-[30%]" />
                  <div className="w-8 bg-slate-300/60 rounded-t-lg h-[50%]" />
                  <div className="w-8 bg-amber-400/80 rounded-t-lg h-[75%]" />
                  <div className="w-8 bg-[#C9A227] rounded-t-lg h-[100%] animate-pulse" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SEO SECTION 6: SCHEMA FAQ ACCORDION WITH FRAMER MOTION ── */}
      <section className="py-20 bg-slate-100 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-left">
          <div className="text-center mb-12">
            <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest">Frequently Asked Questions</span>
            <h2 className="text-3xl font-extrabold text-[#0A2647] mt-1">Everything You Need to Know About Domestic Real Estate</h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-extrabold text-[#0A2647] flex justify-between items-center cursor-pointer hover:text-[#C9A227] transition-colors"
                  >
                    <span className="text-sm sm:text-base">{faq.q}</span>
                    <span className="text-xl font-mono text-[#C9A227] font-bold">{isOpen ? "−" : "+"}</span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 text-xs sm:text-sm text-slate-800 leading-relaxed border-t border-slate-100 pt-3 font-medium"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
