import type { Metadata } from "next";
import { buildMetadata, webPageLd, breadcrumbLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import HomeValuationWidget from "@/components/sellers/HomeValuationWidget";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";
import PersonaLeadForm from "@/components/leads/PersonaLeadForm";

export const metadata: Metadata = buildMetadata({
  title: "Sell Your Home for Top Dollar",
  description:
    "Get an instant AI home valuation estimate or connect with cash buyers and top 1% listing agents in your neighborhood. Maximum equity, zero hassle.",
  path: "/sellers",
  keywords: [
    "sell home top dollar",
    "instant home valuation",
    "cash offers real estate",
    "home equity value",
    "top listing agent",
    "off market cash buyer",
  ],
});

export default function SellersPage() {
  const steps = [
    {
      step: "01",
      title: "Get Instant AI Valuation",
      description: "Enter your home address to generate instant market comps based on recent zip code sales.",
    },
    {
      step: "02",
      title: "Choose Selling Path",
      description: "Compare zero-repair instant cash offers against traditional top 1% MLS listing representation.",
    },
    {
      step: "03",
      title: "Professional Media & Staging",
      description: "If listing on MLS, receive high-definition 4K photography, drone footage, and targeted buyer ads.",
    },
    {
      step: "04",
      title: "Review Offers & Close",
      description: "Receive competitive offers, select your preferred closing timeline, and transfer title smoothly.",
    },
  ];

  const comparison = [
    { feature: "Agent Commission Fees", mls: "Standard 5% - 6%", cash: "0% Commission" },
    { feature: "Closing Cost Obligations", mls: "Seller pays ~2%", cash: "100% Buyer Paid" },
    { feature: "Average Time to Close", mls: "30 - 60 Days", cash: "7 - 14 Days" },
    { feature: "Required Repairs & Staging", mls: "Full Repairs & Staging", cash: "Sold 100% As-Is" },
    { feature: "Showings & Open Houses", mls: "Multiple Showings", cash: "Zero Public Showings" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <JsonLd data={[
        webPageLd({ name: "Sell Your Home", description: "Instant real estate home valuation and selling options portal.", path: "/sellers" }),
        breadcrumbLd([{ name: "Home", path: "/" }, { name: "Sellers", path: "/sellers" }]),
      ]} />

      {/* Hero Section */}
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Seller Equity Maximizer
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Sell Your Property For <span className="text-[#C9A227]">Top Dollar</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Instant AI home valuation estimates, competitive cash offers, and top 1% listing agent partnerships tailored to your goals.
          </p>
        </div>
      </section>

      {/* Valuation Widget Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeValuationWidget />
      </section>

      {/* 4-Step Selling Roadmap */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#806326] font-heading font-bold text-xs uppercase tracking-widest block mb-2">
              Step-By-Step Guidance
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0A2647]">
              How Selling Works on Domestic RE
            </h2>
            <p className="mt-4 text-slate-600 text-base font-body">
              Simple, transparent, and engineered for maximum net seller profit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-3xl font-heading font-extrabold text-[#806326] font-mono mb-4">
                  {s.step}
                </div>
                <h3 className="font-heading font-bold text-xl text-[#0A2647] mb-2">{s.title}</h3>
                <p className="font-body text-slate-600 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cash Offer vs MLS Listing Comparison */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0A2647]">
            Compare Your Selling Paths
          </h2>
          <p className="mt-3 text-slate-600 text-base font-body">
            Choose the option that matches your priority: maximum price or maximum speed.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-card font-body">
          <div className="grid grid-cols-3 bg-[#0A2647] text-white p-6 font-heading font-bold text-sm sm:text-base border-b border-slate-700">
            <div>Feature</div>
            <div className="text-[#806326]">Full MLS Agent Listing</div>
            <div className="text-[#806326]">Direct Cash Offer</div>
          </div>
          {comparison.map((row, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-3 p-6 text-xs sm:text-sm ${
                idx % 2 === 0 ? "bg-slate-50" : "bg-white"
              }`}
            >
              <div className="font-bold text-[#0A2647]">{row.feature}</div>
              <div className="text-slate-700 font-medium">{row.mls}</div>
              <div className="text-slate-900 font-extrabold">{row.cash}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-[#0A2647] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl sm:text-5xl font-bold">
            Find Out What Your Property Is Worth Today
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg font-body max-w-2xl mx-auto">
            Get your instant valuation report with zero obligation.
          </p>
          <div className="mt-8 max-w-3xl mx-auto text-left">
            <PersonaLeadForm persona="seller" source="seller_landing_cta" />
          </div>
        </div>
      </section>
      <ChatWidgetWrapper context="seller" leadType="seller" />
    </main>
  );
}
