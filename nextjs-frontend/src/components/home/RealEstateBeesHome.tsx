"use client";


import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroVariants from "@/components/home/HeroVariants";
import CompanyLogos from "@/components/home/CompanyLogos";
import { AGENT_PLAN_TIERS, ENTERPRISE_PLAN, planPrice, type AgentPlanTier } from "@/lib/agentPlans";
import { getAgents, agentName, agentInitials, type PublicAgent } from "@/lib/agents";
import { renderIcon } from "@/components/ui/PageTemplate";

function TiltCard({
  children,
  bgClass,
  borderColor,
}: {
  children: React.ReactNode;
  bgClass: string;
  borderColor: string;
}) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({ x: -y / 8, y: x / 8 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div className="relative group w-full mb-6" style={{ perspective: "1000px" }}>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: rotate.x, rotateY: rotate.y, scale: isHovered ? 1.04 : 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className={`relative w-full h-44 rounded-2xl p-5 shadow-premium hover:shadow-premium-xl transition-shadow overflow-hidden flex flex-col justify-between select-none cursor-pointer border ${borderColor} ${bgClass}`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform -translate-x-[110%] group-hover:translate-x-[110%] transition-transform duration-1000 ease-out" />
        {children}
      </motion.div>
    </div>
  );
}

const planBackgrounds: Record<string, { bg: string; border: string; accentText: string; }> = {
  Solo: {
    bg: "bg-gradient-to-br from-[#4a3224] via-[#7d4f30] to-[#2b1b11] text-[#ffdca3]",
    border: "border-[#7d4f30]/40",
    accentText: "text-[#c99a6b]",
  },
  Starter: {
    bg: "bg-gradient-to-br from-[#3f4a5c] via-[#5c6f89] to-[#252f40] text-[#eef2f7]",
    border: "border-[#7a8fa9]/40",
    accentText: "text-[#9cb5d4]",
  },
  Professional: {
    bg: "bg-gradient-to-br from-[#937213] via-[#c9a227] to-[#4b3907] text-white",
    border: "border-[#c9a227]/40",
    accentText: "text-[#ffdca3]",
  },
  Elite: {
    bg: "bg-gradient-to-br from-[#1b2535] via-[#0b111e] to-[#040810] text-[#fff6d1]",
    border: "border-[#ffd700]/30 shadow-[0_0_20px_rgba(201,162,39,0.15)]",
    accentText: "text-[#ffd700] drop-shadow-[0_1px_4px_rgba(201,162,39,0.3)]",
  },
};

export default function RealEstateBeesHome({ initialAgents = [] }: { initialAgents?: PublicAgent[] }) {
  const [activeHeroTab, setActiveHeroTab] = useState<"leads" | "properties" | "directory" | "academy">("leads");
  const [activeProIndex, setActiveProIndex] = useState(0);
  const [activeDirectoryTab, setActiveDirectoryTab] = useState<"pros" | "buyers" | "category" | "directory">("pros");
  const [directorySearch, setDirectorySearch] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");

  const [featuredAgents, setFeaturedAgents] = useState<PublicAgent[]>(initialAgents);
  const [loadingAgents, setLoadingAgents] = useState(initialAgents.length === 0);

  useEffect(() => {
    // Skip client-side fetch if server already pre-loaded agents
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
      active = false;
    };
  }, [initialAgents]);

  /* Calculator State */
  const [monthlyLeads, setMonthlyLeads] = useState(50);
  const [avgCommission, setAvgCommission] = useState(8500);

  /* Interactive Investor Tools State */
  const [calcCapRate, setCalcCapRate] = useState({ noi: 45000, price: 500000 });
  const [calcFlip, setCalcFlip] = useState({ arv: 350000, repairs: 45000 });

  const proSegments = [
    {
      id: "01",
      title: "Investors",
      tagline: "High-Yield Real Estate Lead Flow & Investment Software",
      desc: "Connect directly with motivated off-market sellers, distressed property leads, and institutional funding partners. Access real-time ROI tracking, automated comps, and instant skip-tracing tools.",
      cta: "Explore Investor Tools",
      icon: "brand",
      href: "/investors",
    },
    {
      id: "02",
      title: "Agents",
      tagline: "Exclusive Buyer & Seller Leads in Your Local Zip Code",
      desc: "Supercharge your commission pipeline with pre-vetted buyer & seller inquiries. Utilize automated CRM integrations, drip campaigns, and targeted local advertising.",
      cta: "Explore Agent Solutions",
      icon: "leads",
      href: "/realtors",
    },
    {
      id: "03",
      title: "Brokers",
      tagline: "Enterprise Brokerage Management & Lead Distribution",
      desc: "Scale your team with intelligent lead routing, agent performance analytics, automated compliance reporting, and white-label transaction management.",
      cta: "Explore Brokerage Tech",
      icon: "construction",
      href: "/brokerages",
    },
    {
      id: "04",
      title: "Lenders",
      tagline: "Qualified Loan Applicants & Mortgage Lead Generation",
      desc: "Receive pre-qualified mortgage, refinance, and hard-money loan requests directly from active home buyers and property investors.",
      cta: "Explore Lending Leads",
      icon: "mls",
      href: "/lenders",
    },
    {
      id: "05",
      title: "Tech Pros",
      tagline: "Real Estate API, SaaS Integrations & Data Feeds",
      desc: "Integrate nationwide MLS feeds, property valuation APIs, AI skip tracing, and automated marketing Webhooks into your software platform.",
      cta: "Explore Developer APIs",
      icon: "tech",
      href: "/resources",
    },
    {
      id: "06",
      title: "Services",
      tagline: "Connect with Buyers, Sellers & Top-Producing Agents",
      desc: "Showcase your title, inspection, appraisal, or legal services directly to active real estate transactions in your regional market.",
      cta: "List Your Service",
      icon: "distressed",
      href: "/services",
    },
  ];

  /* Comprehensive Directory Cards Matrix with Specific Group Classifications */
  const directoryCards = [
    // FOR PROS (INVESTORS, AGENTS, BROKERS, WHOLESALERS)
    { name: "Real Estate Leads", desc: "Motivated seller & exclusive zip code leads", icon: "leads", tag: "Popular", group: "pros", route: "/realtors" },
    { name: "Wholesalers & Comps", desc: "Off-market deal finder & comp analytics", icon: "growth", tag: "Investors", group: "pros", route: "/investors" },
    { name: "CRM & Auto-Dialers", desc: "Automated pipeline management & cold dialers", icon: "tech", tag: "Software", group: "pros", route: "/realtors" },
    { name: "Virtual Assistants", desc: "Cold calling & admin ISA services", icon: "leads", tag: "Services", group: "pros", route: "/services" },
    { name: "Foreclosure Data", desc: "REO, pre-foreclosure & probate leads", icon: "foreclosure", tag: "Data", group: "pros", route: "/investors" },
    { name: "Hard Money Lenders", desc: "Fix & flip private capital & bridge loans", icon: "brand", tag: "Finance", group: "pros", route: "/lenders" },
    { name: "Lead Generators", desc: "PPC, SEO & targeted Facebook ad tools", icon: "globe", tag: "Featured", group: "pros", route: "/realtors" },
    { name: "Skip Tracing APIs", desc: "Instant owner phone & email skip tracing", icon: "tech", tag: "Tech", group: "pros", route: "/resources" },

    // FOR BUYERS & SELLERS
    { name: "Real Estate Teams", desc: "Top-producing local agent teams & groups", icon: "social", tag: "Hot", group: "buyers", route: "/realtors/agent-directory" },
    { name: "Mortgage Brokers", desc: "Conventional, FHA & VA lenders", icon: "mls", tag: "Finance", group: "buyers", route: "/lenders" },
    { name: "Home Inspectors", desc: "Certified pre-purchase property inspectors", icon: "distressed", tag: "Services", group: "buyers", route: "/services" },
    { name: "Title & Escrow", desc: "National title & closing companies", icon: "brand", tag: "Closing", group: "buyers", route: "/services" },
    { name: "Real Estate Attorneys", desc: "Title, escrow & contract closing legal pros", icon: "shield", tag: "Legal", group: "buyers", route: "/services" },
    { name: "Home Builders", desc: "Custom home builders & general contractors", icon: "construction", tag: "Directory", group: "buyers", route: "/properties" },
    { name: "Real Estate Education", desc: "Licensing & homebuyer masterclasses", icon: "events", tag: "Academy", group: "buyers", route: "/resources" },
    { name: "Home Warranty", desc: "Comprehensive home protection plans", icon: "shield", tag: "Protection", group: "buyers", route: "/properties" },

    // BY CATEGORY (TECH, MARKETING, SERVICES, LEGAL)
    { name: "Real Estate Software", desc: "CRM, analytics & valuation tech", icon: "tech", tag: "Top Rated", group: "category", route: "/resources" },
    { name: "Property Management", desc: "Landlord, rent collection & portal tech", icon: "rental", tag: "Essential", group: "category", route: "/properties" },
    { name: "Real Estate Marketing", desc: "Direct mail, virtual staging & flyers", icon: "social", tag: "Growth", group: "category", route: "/services" },
    { name: "Tax & CPA Services", desc: "1031 exchange & cost segregation tax pros", icon: "mls", tag: "Tax", group: "category", route: "/services" },
    { name: "Real Estate Photographers", desc: "HDR photos & 3D virtual tours", icon: "video", tag: "Media", group: "category", route: "/services" },
    { name: "Transaction Support", desc: "Contract-to-close virtual coordinators", icon: "leads", tag: "Services", group: "category", route: "/services" },
    { name: "Debt Recovery & Legal", desc: "Tenant eviction & legal advisory", icon: "shield", tag: "Legal", group: "category", route: "/services" },
    { name: "Real Estate Accountants", desc: "Real estate audit & CPA experts", icon: "tech", tag: "Finance", group: "category", route: "/services" },
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
    { city: "Miami, FL", state: "Florida" },
    { city: "Austin, TX", state: "Texas" },
    { city: "Los Angeles, CA", state: "California" },
    { city: "Dallas, TX", state: "Texas" },
    { city: "New York, NY", state: "New York" },
    { city: "Chicago, IL", state: "Illinois" },
    { city: "Atlanta, GA", state: "Georgia" },
    { city: "Phoenix, AZ", state: "Arizona" },
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

  const faqCategories = ["All", "Leads & Marketplace", "Integrations & Tech", "Broker Memberships", "Data & Quality"];
  const [activeFaqCategory, setActiveFaqCategory] = useState("All");

  const faqItems = [
    {
      category: "Leads & Marketplace",
      icon: "🏢",
      q: "What is Domestic Real Estate (DomesticRealEstate / Domestic Realestate)?",
      a: "Domestic Real Estate is an enterprise-grade AI proptech platform designed for property buyers, sellers, real estate investors, and licensed real estate brokers. We combine real-time off-market deal feeds, skip-tracing algorithms, and nationwide directory indexing to streamline property transactions across North America.",
    },
    {
      category: "Leads & Marketplace",
      icon: "🔥",
      q: "How does the Domestic Real Estate Lead Generation Marketplace work?",
      a: "Our platform aggregates high-intent lead signals from probate filings, pre-foreclosures, absentee owners, and direct-to-seller marketing channels. Inquiries are instantly verified using multi-point skip tracing and routed directly to agents and investors in real time.",
    },
    {
      category: "Data & Quality",
      icon: "🛡️",
      q: "Are the leads exclusive or shared among multiple agents?",
      a: "We offer both 100% Territory-Exclusive lead subscriptions (locked to specific zip codes for solo agents & teams) as well as open marketplace pay-per-lead options for wholesalers, funds, and private lenders.",
    },
    {
      category: "Integrations & Tech",
      icon: "⚡",
      q: "Can I integrate Domestic Real Estate leads with my existing CRM?",
      a: "Yes! Domestic Real Estate supports instant Webhook and REST API integrations with Follow Up Boss, KVCore, Salesforce, HubSpot, Zapier, Lofty, and over 1,000+ real estate tools.",
    },
    {
      category: "Broker Memberships",
      icon: "💎",
      q: "What benefits do partner brokerages receive upon joining?",
      a: "Partner brokerages gain verified directory status, priority lead dispatching, custom team seats, dedicated MLS sync pipelines, and a featured profile in our nationwide Realtor Network.",
    },
    {
      category: "Data & Quality",
      icon: "📊",
      q: "How are software platforms evaluated and benchmarked?",
      a: "Our independent evaluation board benchmarks software based on verified conversion ROI, platform uptime, customer support response times, API capabilities, and real client reviews.",
    },
  ];

  const filteredFaqs = activeFaqCategory === "All" 
    ? faqItems 
    : faqItems.filter(f => f.category === activeFaqCategory);


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
              <span className="text-[#C9A227] text-xs font-mono font-bold uppercase tracking-wider">Live Deal Marketplace Feed</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <p className="text-xs text-slate-200 font-medium">
                ⚡ Real-time motivated seller inquiries claimed by agents & investors in the last 60 minutes
              </p>
              <Link href="/register" className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-extrabold px-4 py-2 rounded-lg text-xs transition-all shadow-md shrink-0 text-center">
                Claim All Deals
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


      {/* ── ABOUT SECTION: DOMESTIC REAL ESTATE SOLUTIONS ── */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 text-left">
              <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest">About Our Platform</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2647] mt-1">
                Innovative Domestic Real Estate Solutions
              </h2>
              <p className="mt-4 text-slate-700 text-base leading-relaxed font-medium">
                As an industry-leading <strong>Domestic Real Estate Company</strong>, we deliver end-to-end <strong>Domestic Real Estate Solutions</strong> for property buyers, sellers, investors, and licensed <strong>Domestic Real Estate Brokers</strong> across the United States and Canada.
              </p>
              <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                From real-time skip tracing and verified motivated seller lead pipelines to instant AI property valuation algorithms, our platform powers high-intent property transactions across every major <strong>Domestic Real Estate Market</strong>.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-left">
                  <div className="text-2xl mb-1">🏢</div>
                  <h3 className="font-extrabold text-[#0A2647] text-xs mb-0.5">Company Leadership</h3>
                  <p className="text-[11px] text-slate-600">Nationwide network connecting top 1% agents, buyers, and sellers.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-left">
                  <div className="text-2xl mb-1">⚙️</div>
                  <h3 className="font-extrabold text-[#0A2647] text-xs mb-0.5">Intelligent Solutions</h3>
                  <p className="text-[11px] text-slate-600">Off-market deal matching, skip-tracing, and automated CRM sync.</p>
                </div>
              </div>
            </div>

            {/* Single Luxury Architectural AI Image Showcase */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100 group">
                <img
                  src="/images/home/about_luxury.png"
                  alt="Domestic Real Estate Luxury Architectural Villa"
                  className="w-full h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2647]/90 via-[#0A2647]/20 to-transparent flex flex-col justify-end p-6 text-left">
                  <span className="inline-block bg-[#C9A227] text-[#0A2647] text-[10px] font-black uppercase px-3 py-1 rounded-full w-fit mb-2 shadow font-mono">
                    High-End Estate Architecture
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    Domestic Real Estate Ecosystem
                  </h3>
                  <p className="text-xs text-slate-200 mt-1 font-medium">
                    Connecting motivated sellers, investors, & top-tier advisors nationwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── "EMPOWERING REAL ESTATE PROS" HEXAGONAL SELECTOR ── */}
      <section className="py-20 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest">Tailored Solutions</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2647] mt-1 mb-12">
            Empowering Domestic Real Estate Professionals
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
                      <span className="mb-2 scale-125 inline-block text-[#C9A227]">{renderIcon(pro.icon)}</span>
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
            Domestic Real Estate Services & Resource Directory
          </h2>
          <p className="mt-2 text-sm text-slate-600 font-medium max-w-2xl mx-auto">
            Browse verified tools, lead sources, lenders, and service providers tailored to your real estate role.
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
              placeholder="Search 500+ real estate lead tools, CRMs, lenders..."
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
                      <span className="scale-110 inline-block text-[#C9A227]">{renderIcon(card.icon)}</span>
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
            <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest">Platform Benchmarks</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2647] mt-1">
              Real Estate Tech Comparison Matrix
            </h2>
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
                  <th className="p-4 rounded-tr-xl font-extrabold text-sm text-center">Focus Audience</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { name: "Domestic Real Estate (DomesticRealEstate)", ver: "Real-Time Verified", skip: "Included", zip: "100% Exclusive", price: "Flexible / Deal", audience: "Agents, Buyers, & Sellers", badge: "Highest ROI" },
                  { name: "KVCore", ver: "Standard Imports", skip: "Add-on Extra", zip: "Shared Zip", price: "$499 / month", audience: "Brokerages & Teams", badge: "" },
                  { name: "Follow Up Boss", ver: "Integration Only", skip: "Third-Party", zip: "N/A", price: "$299 / month", audience: "Sales Teams", badge: "" },
                  { name: "BoomTown", ver: "Managed PPC", skip: "Not Included", zip: "Shared Zip", price: "$1,000+ / month", audience: "Large Brokerages", badge: "" },
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
                    <td className="p-4 text-center font-extrabold text-slate-700">{row.audience}</td>
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
            <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest">Interactive Modeler</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2647] mt-1">
              Investor & Agent Financial Tools Hub
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1">Run quick calculations on deal profitability and property returns in real time.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Visual Luxury Penthouse Office Card */}
            <div className="lg:col-span-4 flex">
              <div className="w-full relative rounded-3xl overflow-hidden shadow-xl border-2 border-slate-200 group flex flex-col justify-end min-h-[320px]">
                <img
                  src="/images/home/tools_luxury.png"
                  alt="Financial Tools Penthouse Office"
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2647] via-[#0A2647]/40 to-transparent" />
                <div className="relative z-10 p-6 text-left text-white">
                  <span className="bg-[#C9A227] text-[#0A2647] text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                    Financial Underwriting
                  </span>
                  <h4 className="text-lg font-extrabold text-white mt-2">
                    Precision Deal Analytics
                  </h4>
                  <p className="text-xs text-slate-200 mt-1">
                    Engineered for high-yield property ROI modeling.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Calculators */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Tool 1: Cap Rate Calculator */}
              <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-extrabold text-[#0A2647]">🧮 Rental Cap Rate Tool</h3>
                    <span className="bg-[#0A2647] text-[#C9A227] text-xs font-mono font-extrabold px-2.5 py-1 rounded-full">
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
              </div>

              {/* Tool 2: Fix & Flip 70% Rule Calculator */}
              <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-extrabold text-[#0A2647]">🏚️ Fix & Flip 70% MAO</h3>
                    <span className="bg-[#0A2647] text-emerald-400 text-xs font-mono font-extrabold px-2.5 py-1 rounded-full">
                      Max Offer: ${(calcFlip.arv * 0.7 - calcFlip.repairs).toLocaleString()}
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
                      <label className="block mb-1">Estimated Renovation ($)</label>
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
          </div>
        </div>
      </section>

      {/* ── SEO SECTION 1: TOP CITY MARKET DIRECTORY ── */}
      <section className="py-16 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <div>
              <span className="text-[#C9A227] text-xs font-mono uppercase tracking-widest">Regional Intelligence</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">Top City Real Estate Lead Markets</h2>
            </div>
            <p className="text-xs text-slate-200 max-w-md mt-2 md:mt-0 font-medium">
              Explore active motivated seller deals and average pricing metrics across major high-growth metropolitan areas.
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
                  <span className="text-emerald-400 font-mono font-bold">{item.state}</span>
                </div>
                <div className="text-xs text-[#C9A227] font-bold mt-2 hover:underline">
                  <Link href={`/properties?search=${encodeURIComponent(item.city)}`}>Browse Deals & Listings →</Link>
                </div>
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
                Calculate Your Commission Pipeline & ROI
              </h2>
              <p className="mt-4 text-slate-800 text-base leading-relaxed font-medium">
                Estimate your annual deal revenue based on monthly lead volume and average commission size using our real estate pipeline modeler.
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
              <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest">Industry Directory</span>
              <h2 className="text-3xl font-extrabold text-[#0A2647] mt-1">Top Rated Agents & Advisors</h2>
            </div>
            <Link href="/realtors/agent-directory" className="text-xs font-extrabold text-[#0A2647] hover:underline">
              View Full Agent Directory →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingAgents ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-2xl overflow-hidden h-80 p-5 flex flex-col justify-between">
                  <div className="h-36 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-2/3 mt-4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2 mt-2" />
                  <div className="h-8 bg-slate-200 rounded-lg mt-4" />
                </div>
              ))
            ) : featuredAgents.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center">
                <p className="text-base font-bold text-[#0A2647] mb-2">No Featured Advisor Profiles Found</p>
                <p className="text-slate-500 text-xs mb-6">Be the first to join the Domestic Real Estate directory as a verified local partner.</p>
                <Link href="/register" className="inline-block bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-extrabold px-6 py-3 rounded-xl text-xs transition-colors">
                  Join Directory Now →
                </Link>
              </div>
            ) : (
              featuredAgents.map((agent, idx) => {
                const name = agentName(agent);
                const role = agent.headline || agent.specialties?.[0] || "Licensed Advisor";
                const location = [agent.office_city, agent.office_state].filter(Boolean).join(", ") || "Nationwide Network";
                const transCount = agent.sales_count !== undefined ? `${agent.sales_count} Transactions` : "Active Advisor";
                const ratingLabel = agent.rating ? `${agent.rating} ★` : "Verified";
                
                return (
                  <motion.div
                    key={agent.id || idx}
                    whileHover={{ scale: 1.03, y: -4 }}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 overflow-hidden relative bg-slate-100">
                        {agent.user?.avatar ? (
                          <img src={agent.user.avatar} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#0A2647] to-[#1E627D]/40 flex items-center justify-center text-[#C9A227] font-sans font-extrabold text-3xl">
                            {agentInitials(agent)}
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-[#0A2647] text-[#C9A227] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow">
                          {ratingLabel}
                        </div>
                      </div>

                      <div className="p-5 text-left">
                        <h3 className="text-base font-extrabold text-[#0A2647] truncate">{name}</h3>
                        <p className="text-xs text-[#C9A227] font-extrabold truncate">{role}</p>
                        <p className="text-xs text-slate-700 font-medium mt-1 truncate">{location}</p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="font-mono text-slate-900 font-extrabold">{transCount}</span>
                      <Link href={agent.slug ? `/agents/${agent.slug}` : "/realtors/agent-directory"} className="text-[#0A2647] font-extrabold hover:underline">
                        View Profile →
                      </Link>
                    </div>
                  </motion.div>
                );
              })
            )}
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

      {/* ── CENTRALIZED COMMUNITY BLOCK (WITH DYNAMIC THEME IMAGE) ── */}
      <section className="py-20 bg-gradient-to-r from-[#0A2647] via-[#0D315c] to-[#0A2647] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 text-left">
              <span className="bg-[#C9A227] text-[#0A2647] text-[10px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider font-mono">
                Industry Network
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 leading-tight font-heading">
                Join The Growing Community of <span className="text-[#C9A227]">Real Estate Experts</span>
              </h2>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="bg-white/10 backdrop-blur border border-white/15 p-4 rounded-2xl">
                  <div className="w-7 h-7 rounded-full bg-[#C9A227] text-[#0A2647] font-extrabold flex items-center justify-center text-xs mb-2">✓</div>
                  <h4 className="text-[#C9A227] font-heading font-extrabold text-xs mb-1">Direct Access</h4>
                  <p className="text-[11px] font-semibold text-slate-200 leading-relaxed">
                    Connect to exclusive off-market deals and verified seller lead channels.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur border border-white/15 p-4 rounded-2xl">
                  <div className="w-7 h-7 rounded-full bg-[#C9A227] text-[#0A2647] font-extrabold flex items-center justify-center text-xs mb-2">✓</div>
                  <h4 className="text-[#C9A227] font-heading font-extrabold text-xs mb-1">Network Connections</h4>
                  <p className="text-[11px] font-semibold text-slate-200 leading-relaxed">
                    Trade directly with active investors, top brokers, lenders, and tech partners.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur border border-white/15 p-4 rounded-2xl">
                  <div className="w-7 h-7 rounded-full bg-[#C9A227] text-[#0A2647] font-extrabold flex items-center justify-center text-xs mb-2">✓</div>
                  <h4 className="text-[#C9A227] font-heading font-extrabold text-xs mb-1">Public Exposure</h4>
                  <p className="text-[11px] font-semibold text-slate-200 leading-relaxed">
                    Get listed inside nationwide real estate service directories.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/register" className="inline-block bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-extrabold px-8 py-3.5 rounded-xl text-xs sm:text-sm shadow-2xl transition-all hover:scale-105 cursor-pointer">
                  Join The Network Free →
                </Link>
              </div>
            </div>

            {/* Single Luxury Community Image Display */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border-2 border-[#C9A227]/50 shadow-2xl group h-80">
                <img
                  src="/images/home/community_luxury.png"
                  alt="Community Real Estate Executives"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2647]/80 via-transparent to-transparent p-6 flex flex-col justify-end text-left">
                  <span className="bg-[#C9A227] text-[#0A2647] text-[10px] font-black uppercase px-2.5 py-1 rounded-full w-fit font-mono">
                    Executive Network
                  </span>
                  <p className="text-xs text-white font-extrabold mt-1">
                    Nationwide PropTech Network
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PREFERRED AGENT PREMIUM TIERED PRICING SECTION ── */}
      <section className="py-24 bg-white border-t border-slate-250/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-[#C9A227] text-xs font-mono font-bold uppercase tracking-widest bg-[#C9A227]/10 px-4 py-1.5 rounded-full">
            Pricing Plans
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A2647] mt-4 mb-3 leading-tight font-heading">
            Choose Your Preferred Partnership Tier
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto mb-10 leading-relaxed font-body">
            Get a dedicated Virtual Assistant team handling your listings, marketing, tech, and admin work — pick from 21 done-for-you services. Prices below are starting points; your exact rate is confirmed once we review what you select.
          </p>

          {/* Annual Plans Subtitle Banner */}
          <div className="inline-flex items-center gap-2 bg-[#0A2647] text-[#C9A227] px-5 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-12 shadow-md">
            <span>✨ ALL PLANS BILLED ANNUALLY WITH 20% SAVINGS INCLUDED</span>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {AGENT_PLAN_TIERS.map((plan) => {
              const price = plan.annualPrice;
              const isPopular = !!plan.popular;
              const style = planBackgrounds[plan.name] || planBackgrounds.Solo;

              return (
                <div
                  key={plan.name}
                  className={`rounded-3xl border p-6 text-left transition-all duration-300 relative flex flex-col justify-between bg-white ${
                    isPopular
                      ? "border-[#C9A227] shadow-premium-lg ring-4 ring-[#c9a227]/20 scale-103 z-10"
                      : "border-slate-200 hover:shadow-premium hover:border-[#0a2647]/30"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3.5 right-6 bg-[#c9a227] text-[#0a2647] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-gold-lg">
                      ★ Best Value
                    </span>
                  )}

                  <div>
                    {/* Tilt Card Visual */}
                    <TiltCard bgClass={style.bg} borderColor={style.border}>
                      <div className="flex justify-between items-start w-full">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-mono font-bold tracking-widest opacity-80 uppercase">
                            Domestic Real Estate
                          </span>
                          <span className="text-[7px] font-mono tracking-wider opacity-60">
                            ANNUAL MEMBER PASS
                          </span>
                        </div>
                        <svg className="w-5 h-5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>

                      <div className="w-8 h-6 bg-gradient-to-r from-amber-200/90 to-amber-400 rounded-md relative shadow-sm border border-amber-300/40">
                        <div className="absolute inset-x-1.5 inset-y-1 border border-amber-800/20 rounded-sm" />
                        <div className="absolute left-1/2 top-0 bottom-0 w-[0.5px] bg-amber-800/10" />
                        <div className="absolute top-1/2 left-0 right-0 h-[0.5px] bg-amber-800/10" />
                      </div>

                      <div className="flex justify-between items-end w-full">
                        <div className="flex flex-col">
                          <span className="text-sm font-black tracking-normal uppercase font-heading">
                            {plan.name} Partner
                          </span>
                          <span className="text-[9px] font-mono tracking-wider opacity-70 flex items-center gap-1 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-[#C9A227] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m-3.418-4.418A3 3 0 1112.582 7H13a2 2 0 012 2v3.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 01-1.414 0L3.293 16.12a1 1 0 010-1.414l6.414-6.414A1 1 0 0110.414 8h3.172v.005z" />
                            </svg>
                            ANNUAL PASS
                          </span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                          <span className="text-xs font-black text-white">RE</span>
                        </div>
                      </div>
                    </TiltCard>

                    <p className="text-xs font-semibold mt-2 mb-6 leading-relaxed text-slate-500 min-h-[32px]">
                      {plan.tagline}
                    </p>

                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl font-extrabold font-heading text-[#0A2647]">
                        ${plan.annualTotalPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-slate-600 font-mono">
                        / year
                      </span>
                    </div>

                    <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-extrabold text-[#0a2647] mb-6">
                      ⚡ Capacity: Up to {plan.cap ?? "Unlimited"} Services
                    </div>

                    <ul className="space-y-3.5 mb-8 text-[11px] font-semibold leading-relaxed text-slate-700">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                            ✓
                          </span>
                          <span className="text-slate-700">
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={`/register?role=agent&plan=${encodeURIComponent(plan.name)}&billing=annual`}
                    className={`block w-full text-center py-4 rounded-xl text-xs font-bold transition-all ${
                      isPopular
                        ? "bg-[#0A2647] hover:bg-[#0c2e56] text-white shadow-premium"
                        : "bg-[#C9A227]/10 hover:bg-[#C9A227] hover:text-[#0a2647] text-[#0a2647] border border-[#C9a227]/30"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Full-width Enterprise Custom Plan Banner */}
          <div className="bg-gradient-to-r from-[#0a2647] to-[#07162c] border border-slate-700 shadow-premium-lg rounded-3xl p-8 text-white text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🏛️</span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold font-heading">{ENTERPRISE_PLAN.name}</h3>
                    <p className="text-sm font-semibold text-[#c9a227]">{ENTERPRISE_PLAN.tagline}</p>
                  </div>
                </div>
                
                <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-3xl">
                  Bespoke CRM mapping, custom integrations, MLS webhooks, and unlimited Virtual Assistants (VA) team support. Built specifically for high-growth real estate institutions, teams, and nationwide brokerages.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {ENTERPRISE_PLAN.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-xs font-semibold text-slate-200">
                      <span className="text-[#c9a227] text-sm">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-end">
                <Link
                  href="/contact"
                  className="w-full lg:w-auto bg-[#c9a227] hover:bg-amber-400 text-[#0a2647] font-black px-10 py-4.5 rounded-xl text-center text-sm shadow-gold transition-all"
                >
                  {ENTERPRISE_PLAN.cta} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LUXURY SCHEMA FAQ ACCORDION & KNOWLEDGE BASE ── */}
      <section className="py-24 bg-gradient-to-b from-slate-50 via-slate-100 to-white border-t border-slate-200 relative overflow-hidden">
        {/* Ambient Glow Decorative Backdrops */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#C9A227]/5 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
          
          {/* FAQ Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#0A2647] text-[#C9A227] text-[10px] font-black uppercase px-3.5 py-1.5 rounded-full font-mono tracking-widest shadow-md mb-3">
              <span>💡</span> KNOWLEDGE BASE & FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A2647] tracking-tight font-heading">
              Got Questions? We Have Answers.
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
              Everything you need to know about our off-market deal pipelines, motivated seller lead subscriptions, CRM integrations, and nationwide brokerage network.
            </p>

            {/* Category Filter Pills */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {faqCategories.map((cat) => {
                const isActive = activeFaqCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveFaqCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-[#0A2647] text-[#C9A227] shadow-lg ring-2 ring-[#C9A227]/50 scale-105"
                        : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-sm"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Luxury FAQ Accordion Cards */}
          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`rounded-2xl transition-all duration-300 overflow-hidden border-2 ${
                    isOpen
                      ? "bg-white border-[#C9A227] shadow-xl ring-2 ring-[#C9A227]/20"
                      : "bg-white/80 hover:bg-white border-slate-200 hover:border-[#0A2647]/40 shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-6 text-left font-extrabold text-[#0A2647] flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Number & Icon Pill */}
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0 font-mono font-black transition-all ${
                        isOpen
                          ? "bg-[#0A2647] text-[#C9A227] shadow-md"
                          : "bg-slate-100 text-slate-700 group-hover:bg-[#C9A227]/20 group-hover:text-[#0A2647]"
                      }`}>
                        {faq.icon || `0${idx + 1}`}
                      </span>

                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-[#C9A227] block mb-0.5">
                          {faq.category}
                        </span>
                        <h3 className="text-base sm:text-lg font-extrabold text-[#0A2647] group-hover:text-[#C9A227] transition-colors leading-snug">
                          {faq.q}
                        </h3>
                      </div>
                    </div>

                    {/* Expand/Collapse Chevron Indicator */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 font-extrabold text-sm ${
                      isOpen
                        ? "bg-[#C9A227] text-[#0A2647] rotate-180 shadow"
                        : "bg-slate-100 text-slate-500 group-hover:bg-[#0A2647] group-hover:text-white"
                    }`}>
                      ↓
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium border-t border-slate-100 pt-4"
                      >
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Concierge Support & Questions CTA Banner */}
          <div className="mt-12 bg-gradient-to-r from-[#07162C] via-[#0A2647] to-[#07162C] rounded-3xl p-8 text-white border border-[#C9A227]/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-left">
              <span className="text-4xl p-3 bg-white/10 rounded-2xl border border-white/15 shrink-0">💬</span>
              <div>
                <h4 className="text-lg font-extrabold text-white">Still Have Questions About Our Platform?</h4>
                <p className="text-xs text-slate-300 font-medium mt-1">
                  Our 24/7 Concierge Support Team is ready to help you select the best plan or territory.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <Link
                href="/contact"
                className="w-full md:w-auto bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-black px-6 py-3 rounded-xl text-xs shadow-gold transition-all text-center"
              >
                Contact Concierge Team →
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
