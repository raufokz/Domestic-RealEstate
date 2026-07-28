import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Domestic Real Estate Market Reports & Economic Analytics",
  description:
    "Explore comprehensive Domestic Real Estate Market reports, median home price metrics, inventory forecasts, and cap rate indexes across major US metropolitan regions.",
  keywords: [
    "Domestic Real Estate Market",
    "housing market report",
    "real estate analytics",
    "median home price trend",
    "real estate data report",
  ],
  openGraph: {
    title: "Domestic Real Estate Market Reports",
    description: "Quarterly real estate data and economic forecasts across the domestic market.",
    url: "https://domesticrealestate.us/market-reports",
    siteName: "Domestic Real Estate",
  },
};

const reports = [
  { quarter: "Q2 2026", title: "Domestic Real Estate Market & Interest Rate Benchmark", pages: "28 Pages PDF", focus: "Price Stability & Mortgage Trends" },
  { quarter: "Q1 2026", title: "Sunbelt Regional Growth & Domestic Real Estate Yields", pages: "32 Pages PDF", focus: "Multi-Family & Single-Family Rental Comps" },
];

export default function MarketReportsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Domestic Real Estate Market Research
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Domestic Real Estate <span className="text-[#C9A227]">Market Analytics</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            In-depth economic research, median sales trends, and regional cap rate benchmarks across the Domestic Real Estate Market.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reports.map((r, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 px-3 py-1 rounded-full uppercase tracking-wider">
                    {r.quarter}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{r.pages}</span>
                </div>
                <h3 className="font-heading font-bold text-xl text-[#0A2647] mb-2">{r.title}</h3>
                <p className="text-slate-600 text-sm mb-6 font-medium">Focus: {r.focus}</p>
              </div>
              <a href="/contact?type=report" className="w-full bg-[#0A2647] text-white font-heading font-bold text-xs py-3.5 rounded-xl transition-all text-center hover:bg-[#C9A227] hover:text-[#0A2647]">
                Download Report PDF →
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
