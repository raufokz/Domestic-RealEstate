import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Press & Media Coverage",
  description: "Domestic Real Estate in the news. Press releases, media mentions, and company announcements.",
  path: "/press",
  keywords: ["press release", "media coverage", "company news", "real estate press"],
});

const pressReleases = [
  { date: "June 15, 2026", title: "Domestic RE Reaches $2.5 Billion in Closed Off-Market Deal Volume", outlet: "Real Estate Tech News" },
  { date: "April 02, 2026", title: "Domestic RE Launches AI-Powered Skip-Tracing Comps Engine Nationwide", outlet: "HousingWire" },
  { date: "January 10, 2026", title: "Domestic RE Expands Realtor Exclusivity Program across 500 New Metropolitan Zip Codes", outlet: "Inman News" },
];

export default function PressPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Official Media Relations
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Press Room & <span className="text-[#C9A227]">Media Kit</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Latest company news, press coverage, executive announcements, and downloadable brand assets.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 font-body space-y-6">
        {pressReleases.map((pr, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs text-[#C9A227] font-bold uppercase tracking-wider block mb-1">{pr.outlet} • {pr.date}</span>
              <h3 className="font-heading font-bold text-lg text-[#0A2647]">{pr.title}</h3>
            </div>
            <a href="/contact?topic=media" className="bg-[#0A2647] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#C9A227] hover:text-[#0A2647] transition-all whitespace-nowrap">
              Read Release →
            </a>
          </div>
        ))}
      </section>
    </main>
  );
}
