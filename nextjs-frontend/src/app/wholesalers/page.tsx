import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";

export const metadata: Metadata = buildMetadata({
  title: "Wholesale Real Estate Deals & Buyer Network",
  description: "Submit off-market wholesale deals, access verified cash buyer lists, and assign contracts with our streamlined wholesaler platform.",
  path: "/wholesalers",
  keywords: ["wholesale real estate", "off market deals", "cash buyer list", "assignment contract", "wholesale deals"],
});

export default function WholesalersPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Wholesale Deal Engine
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Off-Market Distressed Deals & <span className="text-[#C9A227]">Buyer Matching</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Gain immediate access to verified probate files, pre-foreclosures, and motivated sellers with direct cash buyer dispo tools.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <a href="/register?type=wholesaler" className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-extrabold text-sm px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all">
              Join Wholesaler Portal →
            </a>
          </div>
        </div>
      </section>
      <ChatWidgetWrapper context="wholesaler" leadType="wholesaler" />
    </main>
  );
}
