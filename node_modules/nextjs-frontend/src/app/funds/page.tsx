import type { Metadata } from "next";
import { buildMetadata, webPageLd, breadcrumbLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";

export const metadata: Metadata = buildMetadata({
  title: "Domestic Real Estate Funds | Investment Pools & Private Equity",
  description: "Explore high-performing Domestic Real Estate Funds, private equity syndicates, and institutional real estate capital pools across top US growth markets.",
  path: "/funds",
  keywords: [
    "Domestic Real Estate Funds",
    "real estate investment funds",
    "real estate private equity",
    "REIT investment funds",
    "syndicated real estate funds",
  ],
});

export default function FundsPage() {
  const fundHighlights = [
    { title: "Institutional Domestic Real Estate Funds", desc: "Diversified capital pools focusing on high-yield multi-family, industrial, and commercial property acquisitions." },
    { title: "Passive Capital Syndication", desc: "Co-invest alongside accredited private equity leaders with transparent quarterly distribution models." },
    { title: "Risk-Adjusted Asset Valuation", desc: "Rigorous underwriting standards and automated valuation metrics protecting investor principal." },
    { title: "Tax-Advantaged Yield Distribution", desc: "Capitalize on bonus depreciation, 1031 exchange opportunities, and tax-deferred dividend structures." },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <JsonLd data={[
        webPageLd({ name: "Domestic Real Estate Funds", description: "Private equity and institutional fund portal for real estate investors.", path: "/funds" }),
        breadcrumbLd([{ name: "Home", path: "/" }, { name: "Funds", path: "/funds" }]),
      ]} />

      {/* Hero Section */}
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Capital Solutions
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Institutional <span className="text-[#C9A227]">Domestic Real Estate Funds</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Access vetted private equity syndicates and high-yielding Domestic Real Estate Funds engineered for capital preservation and maximum yield.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <a
              href="/contact?topic=funds"
              className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-extrabold text-sm px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all"
            >
              Request Fund Offering Prospectus →
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-body">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0A2647]">
            Structured Private Capital & Fund Offerings
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Participate in premier domestic real estate investment opportunities backed by institutional management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {fundHighlights.map((feat, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all"
            >
              <h3 className="font-heading font-bold text-xl text-[#0A2647] mb-3">{feat.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <ChatWidgetWrapper context="investor" leadType="investor" />
    </main>
  );
}
