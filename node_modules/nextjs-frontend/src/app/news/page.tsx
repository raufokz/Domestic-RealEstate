import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Real Estate News & Market Updates",
  description: "Stay informed with the latest real estate news, housing market trends, and economic indicators affecting property values.",
  path: "/news",
  keywords: ["real estate news", "housing market", "market trends", "property news"],
});

const newsItems = [
  { category: "Mortgage Market", title: "Federal Reserve Holds Rates Steady: What Homebuyers Need to Know", date: "July 19, 2026" },
  { category: "Housing Inventory", title: "Active Single-Family Inventory Up 14% Year-Over-Year in Sunbelt Markets", date: "July 15, 2026" },
  { category: "PropTech", title: "AI valuation models achieve 98.4% accuracy compared to formal appraisals", date: "July 10, 2026" },
];

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Daily Real Estate Feed
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Industry News & <span className="text-[#C9A227]">Market Intelligence</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Stay ahead of market movements with breaking real estate news, policy updates, and economic forecasts.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 font-body space-y-6">
        {newsItems.map((n, idx) => (
          <article key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <span className="text-xs font-extrabold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 px-3 py-1 rounded-full uppercase tracking-wider block w-max mb-2">
              {n.category}
            </span>
            <h3 className="font-heading font-bold text-xl text-[#0A2647] mb-2">{n.title}</h3>
            <span className="text-xs text-slate-400">{n.date}</span>
          </article>
        ))}
      </section>
    </main>
  );
}
