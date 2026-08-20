import type { Metadata } from "next";
import { buildMetadata, webPageLd, breadcrumbLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import MortgageCalculatorWidget from "@/components/buyers/MortgageCalculatorWidget";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";
import PersonaLeadForm from "@/components/leads/PersonaLeadForm";

export const metadata: Metadata = buildMetadata({
  title: "Home Buyer Solutions & Financing",
  description:
    "Find and secure your dream home with Domestic Real Estate. Instant access to real-time MLS listings, off-market property deals, AI property matching, and interactive mortgage tools.",
  path: "/buyers",
  keywords: [
    "home buyer solutions",
    "buy home",
    "mortgage calculator",
    "first time home buyer",
    "MLS property search",
    "pre-approval mortgage",
  ],
});

export default function BuyersPage() {
  const steps = [
    {
      step: "01",
      title: "Define Buy-Box & Criteria",
      description: "Set your target city, neighborhood, budget, and desired property amenities in our AI matching engine.",
    },
    {
      step: "02",
      title: "Get Pre-Approved",
      description: "Connect with vetted mortgage lenders to lock in competitive interest rates and secure pre-approval letters.",
    },
    {
      step: "03",
      title: "View MLS & Off-Market Deals",
      description: "Gain exclusive access to off-market seller listings before they hit public real estate databases.",
    },
    {
      step: "04",
      title: "Close With Confidence",
      description: "Work with top 1% local buyer agents to negotiate purchase agreements, inspections, and escrow closing.",
    },
  ];

  const loanTypes = [
    { name: "Conventional 30-Year", down: "3% - 20%", term: "30 Years", ideal: "Buyers with good credit looking for lower monthly payments" },
    { name: "FHA Loan", down: "3.5%", term: "15 - 30 Years", ideal: "First-time buyers with flexible credit qualifications" },
    { name: "VA Loan", down: "0%", term: "15 - 30 Years", ideal: "Eligible active military, veterans, and military spouses" },
    { name: "Jumbo Luxury Loan", down: "10% - 20%", term: "30 Years", ideal: "High-net-worth buyers purchasing high-value luxury estates" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <JsonLd data={[
        webPageLd({ name: "Home Buyer Solutions", description: "Comprehensive home buyer platform providing property search, loan options, and financing tools.", path: "/buyers" }),
        breadcrumbLd([{ name: "Home", path: "/" }, { name: "Buyers", path: "/buyers" }]),
      ]} />

      {/* Hero Section */}
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Buyer Solutions & Advisory
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Find & Secure Your <span className="text-[#C9A227]">Dream Home</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Instant access to verified MLS listings, off-market seller deals, AI property matching, and automated loan pre-approval tools.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="/properties"
              className="inline-flex items-center gap-2 bg-[#C9A227] text-[#0A2647] font-heading font-extrabold px-8 py-4 rounded-xl text-base hover:shadow-gold-lg transition-all duration-300 hover:scale-105"
            >
              Browse Available Properties →
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-heading font-bold px-8 py-4 rounded-xl text-base hover:bg-white/10 transition-all duration-300"
            >
              Talk to a Buyer Specialist
            </a>
          </div>
        </div>
      </section>

      {/* 4-Step Home Buying Process */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#806326] font-heading font-bold text-xs uppercase tracking-widest block mb-2">
            Structured Guidance
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0A2647]">
            Your 4-Step Home Buying Roadmap
          </h2>
          <p className="mt-4 text-slate-600 text-base font-body">
            From initial search setup to holding key in hand, we streamline every milestone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div className="text-3xl font-heading font-extrabold text-[#806326] font-mono mb-4">
                {s.step}
              </div>
              <h3 className="font-heading font-bold text-xl text-[#0A2647] mb-2">{s.title}</h3>
              <p className="font-body text-slate-600 text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Mortgage Calculator Section */}
      <section className="py-20 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MortgageCalculatorWidget />
        </div>
      </section>

      {/* Loan Product Matrix */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0A2647]">
            Popular Buyer Loan Options
          </h2>
          <p className="mt-3 text-slate-600 text-base font-body">
            Compare key mortgage programs to find the ideal financing structure for your purchase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loanTypes.map((loan, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-heading font-bold text-lg text-[#0A2647] mb-2">{loan.name}</h3>
              <div className="space-y-2 text-xs font-body text-slate-600 border-t border-slate-100 pt-3">
                <p>
                  <strong className="text-[#0A2647]">Min Down Payment:</strong> {loan.down}
                </p>
                <p>
                  <strong className="text-[#0A2647]">Standard Term:</strong> {loan.term}
                </p>
                <p className="pt-2 text-slate-500">{loan.ideal}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-[#0A2647] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl sm:text-5xl font-bold">
            Ready to Start Browsing Properties?
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg font-body max-w-2xl mx-auto">
            Get instant alerts when new homes matching your exact buy-box criteria enter the market.
          </p>
          <div className="mt-8 max-w-3xl mx-auto text-left">
            <PersonaLeadForm persona="buyer" source="buyer_landing_cta" />
          </div>
        </div>
      </section>
      <ChatWidgetWrapper context="buyer" leadType="buyer" />
    </main>
  );
}
