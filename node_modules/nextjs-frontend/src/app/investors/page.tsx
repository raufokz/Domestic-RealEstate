import type { Metadata } from "next";
import { buildMetadata, webPageLd, breadcrumbLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";

export const metadata: Metadata = buildMetadata({
  title: "Real Estate Investor Solutions & Off-Market Deal Flow",
  description:
    "Scale your portfolio with off-market real estate deal flow, pre-vetted distress listings, skip-tracing seller data, automated Cap Rate metrics, and buy-box alerts.",
  path: "/investors",
  keywords: [
    "real estate investor deal flow",
    "off market property leads",
    "cap rate real estate",
    "distressed property list",
    "wholesale deal portal",
    "real estate ROI calculator",
  ],
});

export default function InvestorsPage() {
  const investorFeatures = [
    { title: "Off-Market Seller Skip-Tracing", desc: "Direct phone, email, and property tax record profiles for motivated seller leads across 50 states." },
    { title: "Automated ARV & Rehab Comps", desc: "Instant After-Repair-Value estimations based on hyper-local neighborhood sales comps and repair budgets." },
    { title: "Custom Buy-Box Deal Filters", desc: "Set target Cap Rates, minimum cash-on-cash yield, property type, and zip codes for auto deal delivery." },
    { title: "Direct Title & Escrow Closing", desc: "Streamlined assignment contracts, cash buyer verification, and digital escrow closing workflows." },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <JsonLd data={[
        webPageLd({ name: "Real Estate Investor Solutions", description: "Off-market deal intelligence portal for real estate investors.", path: "/investors" }),
        breadcrumbLd([{ name: "Home", path: "/" }, { name: "Investors", path: "/investors" }]),
      ]} />

      {/* Hero Section */}
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              High-Yield Investor Portal
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Institutional Quality <span className="text-[#C9A227]">Off-Market Deals</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Gain immediate access to verified off-market seller leads, probate opportunities, fix-and-flip deals, and high cash-flow rental properties.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="/register?type=investor"
              className="inline-flex items-center gap-2 bg-[#C9A227] text-[#0A2647] font-heading font-extrabold px-8 py-4 rounded-xl text-base hover:shadow-gold-lg transition-all duration-300 hover:scale-105"
            >
              Build Your Buy-Box Now →
            </a>
          </div>
        </div>
      </section>

      {/* Investor Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-body">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0A2647]">
            Engineered For Portfolio Scalability
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Skip the MLS competition and secure deals directly from motivated property owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {investorFeatures.map((feat, idx) => (
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-[#0A2647] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl sm:text-5xl font-bold">
            Looking for Off-Market Deal Alerts?
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg font-body max-w-2xl mx-auto">
            Set your target ROI parameters and receive real-time deal alerts in your inbox.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/contact?topic=investor"
              className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-extrabold text-sm px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all"
            >
              Set Investor Deal Criteria →
            </a>
          </div>
        </div>
      </section>
      <ChatWidgetWrapper context="investor" leadType="investor" />
    </main>
  );
}
