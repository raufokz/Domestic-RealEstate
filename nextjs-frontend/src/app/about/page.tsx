import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Domestic Real Estate Lead Intelligence & Deal Platform",
  description:
    "Learn how Domestic Real Estate is revolutionizing the real estate industry with AI-powered property matching, verified off-market seller leads, and skip-tracing deal technology across all 50 US states.",
  keywords: [
    "about domestic real estate",
    "real estate lead intelligence",
    "off market seller leads",
    "real estate technology",
    "top real estate platform",
    "AI property matching",
  ],
  openGraph: {
    title: "About Us | Domestic Real Estate",
    description:
      "Connecting motivated property sellers, top 1% agents, savvy real estate investors, and lenders across the US & Canada.",
    url: "https://domesticrealestate.us/about",
    siteName: "Domestic Real Estate",
  },
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Domestic Real Estate",
  description:
    "Domestic Real Estate connects motivated property sellers, top 1% producing agents, real estate investors, and lenders across the US & Canada.",
  url: "https://domesticrealestate.us/about",
  publisher: {
    "@type": "Organization",
    name: "Domestic Real Estate",
  },
};

export default function AboutPage() {
  const stats = [
    { value: "$2.5B+", label: "Total Deal Volume" },
    { value: "15,400+", label: "Verified Seller Leads" },
    { value: "2,500+", label: "Top Producing Agents" },
    { value: "50 States", label: "Nationwide Coverage" },
  ];

  const values = [
    {
      icon: "🎯",
      title: "Data Verification Integrity",
      description:
        "Every off-market motivated lead undergoes real-time tax assessment checks, skip tracing, and probate validation before reaching our marketplace.",
    },
    {
      icon: "🚀",
      title: "AI-Powered Matching",
      description:
        "Our machine learning buy-box algorithms connect buyers with ideal property listings and sellers with ready-to-transact local specialists.",
    },
    {
      icon: "🔒",
      title: "Market Exclusivity",
      description:
        "We empower local market leaders through our Zip Code Exclusivity program, protecting lead volume and maximizing conversion ROI.",
    },
    {
      icon: "🤝",
      title: "Full Ecosystem Synergy",
      description:
        "Unifying buyers, sellers, listing agents, cash investors, lenders, and title companies into one seamless transaction workflow.",
    },
  ];

  const milestones = [
    { year: "2021", title: "Platform Founding", desc: "Launched nationwide skip-tracing and seller lead distribution pipeline." },
    { year: "2023", title: "AI Valuation Engine", desc: "Integrated automated MLS comps matching and predictive market pricing." },
    { year: "2025", title: "$2.5 Billion Closed", desc: "Surpassed $2.5 billion in total real estate transactions facilitated." },
    { year: "2026", title: "Next-Gen Ecosystem", desc: "Unveiled real-time CRM webhooks, lender pre-approval engines, and video tours." },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />

      {/* Hero Section */}
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C9A227]/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              About Domestic Real Estate
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white leading-tight max-w-4xl mx-auto">
            Revolutionizing Real Estate <span className="text-[#C9A227]">Lead Intelligence</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed font-body">
            Connecting motivated property sellers, top 1% producing agents, savvy real estate investors, and trusted lenders across all 50 US states through real-time skip tracing and AI deal matching.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center gap-2 bg-[#C9A227] text-[#0A2647] font-heading font-extrabold px-8 py-4 rounded-xl text-base hover:shadow-gold-lg transition-all duration-300 hover:scale-105"
            >
              Join Our Network →
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-heading font-bold px-8 py-4 rounded-xl text-base hover:bg-white/10 transition-all duration-300"
            >
              Contact Advisory Team
            </a>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-12 bg-[#0A2647] border-y border-[#C9A227]/40 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="font-heading text-3xl sm:text-5xl font-extrabold text-[#C9A227] font-mono">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-bold mt-2 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values / Mission Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#C9A227] font-heading font-bold text-xs uppercase tracking-widest block mb-2">
            Built for Results
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0A2647]">
            Our Foundational Pillars
          </h2>
          <p className="mt-4 text-slate-600 text-base font-body">
            We eliminate real estate lead inefficiency by delivering 100% verified off-market property opportunities directly to market specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="text-4xl p-3 bg-[#0A2647]/5 rounded-2xl inline-block mb-6 border border-[#0A2647]/10">
                  {item.icon}
                </span>
                <h3 className="font-heading font-bold text-xl text-[#0A2647] mb-3">{item.title}</h3>
                <p className="font-body text-slate-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Milestone Timeline */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0A2647]">
              Our Journey of Innovation
            </h2>
            <p className="mt-3 text-slate-600 text-base font-body">
              How Domestic Real Estate became the industry leader in automated property lead technology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 p-6 rounded-2xl relative overflow-hidden"
              >
                <div className="text-3xl font-heading font-extrabold text-[#C9A227] font-mono mb-2">
                  {m.year}
                </div>
                <h3 className="font-heading font-bold text-[#0A2647] text-lg mb-2">{m.title}</h3>
                <p className="font-body text-slate-600 text-xs leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-[#0A2647] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl sm:text-5xl font-bold">
            Ready to Scale Your Real Estate Business?
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg font-body max-w-2xl mx-auto">
            Join thousands of top-producing realtors, investors, and lenders closing deals on Domestic RE today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="/register"
              className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-extrabold text-sm px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all"
            >
              Create Free Account →
            </a>
            <a
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-sm px-8 py-4 rounded-xl border border-white/20 transition-all"
            >
              Talk to an Advisor
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
