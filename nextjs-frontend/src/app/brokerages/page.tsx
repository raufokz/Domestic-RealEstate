import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Domestic Real Estate Brokers & Brokerage Solutions | Company Tech",
  description: "Enterprise solutions for Domestic Real Estate Brokers and agent teams. Scale your Domestic Real Estate Company with automated lead distribution, white-label branding, and CRM integrations.",
  path: "/brokerages",
  keywords: [
    "Domestic Real Estate Brokers",
    "Domestic Real Estate Company",
    "real estate brokerage",
    "brokerage solutions",
    "white label real estate",
    "agent management",
  ],
});

export default function BrokeragesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Domestic Real Estate Brokers Platform
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Empowering <span className="text-[#C9A227]">Domestic Real Estate Brokers</span> & Teams
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Scale your Domestic Real Estate Company with automated lead routing, zip code market protection, white-label transaction management, and institutional CRM integrations.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <a href="/contact?topic=brokerage" className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-extrabold text-sm px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all">
              Schedule Enterprise Demo →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
