import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Domestic Real Estate Services | Premier Solutions & Lead Generation",
  description:
    "Explore Domestic Real Estate Services: AI deal matching, off-market motivated seller lead generation, MLS search, skip tracing, PPC management, and virtual assistants.",
  keywords: [
    "Domestic Real Estate Services",
    "real estate services",
    "lead generation",
    "AI real estate assistant",
    "property listing marketing",
    "real estate SEO",
    "realtor branding",
    "off market property search",
  ],
  openGraph: {
    title: "Domestic Real Estate Services | Premier Solutions & Lead Generation",
    description: "Empowering real estate agents, buyers, sellers, investors, and lenders with technology.",
    url: "https://domesticrealestate.us/services",
    siteName: "Domestic Real Estate",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Domestic Real Estate Services",
  provider: {
    "@type": "Organization",
    name: "Domestic Real Estate",
  },
  areaServed: "US & Canada",
};

export default function ServicesPage() {
  const servicesList = [
    {
      slug: "lead-generation",
      title: "Motivated Seller Lead Generation",
      icon: "🎯",
      badge: "Flagship Service",
      description: "100% verified off-market motivated seller leads, probate filings, and tax default properties delivered straight to your CRM.",
      features: ["Skip Traced Phone & Email", "Real-Time Property Tax Data", "Zip Code Exclusivity Available"],
    },
    {
      slug: "ai-assistant",
      title: "AI Property Matchmaker & Assistant",
      icon: "🤖",
      badge: "AI Powered",
      description: "Intelligent chatbot & automated deal matchmaker that nurtures buyer and seller leads 24/7 with zero delay.",
      features: ["Instant Comps Analysis", "Automated Follow-up Sequences", "Omnichannel CRM Sync"],
    },
    {
      slug: "property-listing",
      title: "Luxury Property Listing Marketing",
      icon: "🏡",
      badge: "High Converting",
      description: "Omnichannel listing amplification including HD video walkthroughs, 3D floorplans, targeted social ads, and syndication.",
      features: ["HD Aerial Drone Capture", "Targeted Social Retargeting", "MLS & Global Syndication"],
    },
    {
      slug: "seo",
      title: "Real Estate SEO & Authority Ranking",
      icon: "📈",
      badge: "Organic Growth",
      description: "Dominate Google search results for local neighborhood real estate keywords and build long-term organic lead flow.",
      features: ["Hyper-Local Keyword Strategy", "Google Business Optimization", "Backlink & Authority Building"],
    },
    {
      slug: "ppc",
      title: "High-ROI PPC & Google Ads Management",
      icon: "⚡",
      badge: "Instant Traffic",
      description: "Precision-targeted pay-per-click advertising campaigns engineered specifically for high-intent home buyers and sellers.",
      features: ["Negative Keyword Filtering", "Custom Conversion Landing Pages", "ROAS Optimization"],
    },
    {
      slug: "branding",
      title: "Realtor & Investor Brand Identity",
      icon: "✨",
      badge: "Premium Design",
      description: "Stand out in your market with custom logo design, brand guidelines, social media assets, and print media packages.",
      features: ["Logo & Visual Guidelines", "Listing Pitch Decks", "Custom Social Media Templates"],
    },
    {
      slug: "social-media",
      title: "Social Media Growth & Marketing",
      icon: "📲",
      badge: "Viral Engagement",
      description: "Build an active social presence on Instagram, YouTube, TikTok, and Facebook to position yourself as the premier local agent.",
      features: ["Short-Form Video Editing", "Monthly Content Calendars", "Paid Ad Campaign Strategy"],
    },
    {
      slug: "web-development",
      title: "Custom Real Estate Website Engineering",
      icon: "💻",
      badge: "Next.js Powered",
      description: "Lightning-fast, mobile-responsive IDX real estate websites built with modern frameworks and conversion-first UI.",
      features: ["IDX / RETS Feed Integration", "Instant Valuation Calculators", "Sub-Second Load Speeds"],
    },
    {
      slug: "virtual-assistant",
      title: "Real Estate Virtual Assistants",
      icon: "👩‍💼",
      badge: "Operational Scale",
      description: "Trained real estate VAs to handle cold calling, transaction coordination, administrative tasks, and lead qualification.",
      features: ["Bilingual Cold Callers", "Transaction Management", "Daily KPI Reporting"],
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Hero Section */}
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Full-Spectrum Domestic Real Estate Services
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Accelerate Growth With <span className="text-[#C9A227]">Domestic Real Estate Services</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Whether you are a listing agent, cash buyer, mortgage lender, or investor, our comprehensive Domestic Real Estate Services turn property targets into closed transactions.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#C9A227] font-heading font-bold text-xs uppercase tracking-widest block mb-2">
            Tailored For Industry Leaders
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0A2647]">
            Core Service Offerings
          </h2>
          <p className="mt-4 text-slate-600 text-base font-body">
            Choose individual services or combine them for a complete market dominance campaign.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((srv, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl p-3 bg-[#0A2647]/5 rounded-2xl inline-block border border-[#0A2647]/10">
                    {srv.icon}
                  </span>
                  <span className="text-[10px] font-extrabold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 px-3 py-1 rounded-full uppercase tracking-wider">
                    {srv.badge}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-xl text-[#0A2647] mb-3">{srv.title}</h3>
                <p className="font-body text-slate-600 text-sm leading-relaxed mb-6">{srv.description}</p>

                <ul className="space-y-2 mb-8 text-xs font-body text-slate-700">
                  {srv.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <span className="text-[#C9A227] font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={`/services/${srv.slug}`}
                className="w-full bg-[#0A2647] hover:bg-[#C9A227] hover:text-[#0A2647] text-white font-heading font-bold text-xs py-3.5 rounded-xl transition-all text-center"
              >
                Learn More About {srv.title.split(" ")[0]} →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-[#0A2647] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl sm:text-5xl font-bold">
            Need a Custom Growth Strategy?
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg font-body max-w-2xl mx-auto">
            Schedule a 1-on-1 strategy call with our real estate specialists to build a campaign tailored to your market.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/contact"
              className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-extrabold text-sm px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all"
            >
              Request Service Strategy →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
