import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real Estate Case Studies & ROI Success Stories | Domestic Real Estate",
  description:
    "Discover how top real estate brokerages, listing agents, cash buyers, and mortgage lenders scale deal volume using Domestic Real Estate's AI platform.",
  keywords: ["real estate case studies", "agent success stories", "brokerage ROI case study", "off market deal results"],
  openGraph: {
    title: "Real Estate Case Studies | Domestic Real Estate",
    description: "Quantifiable ROI case studies from top real estate practitioners.",
    url: "https://domesticrealestate.us/case-studies",
    siteName: "Domestic Real Estate",
  },
};

const studies = [
  {
    title: "How Beverly Hills Luxury Group Scaled Volume by $18M in 6 Months",
    client: "Beverly Hills Luxury Group",
    metric: "+$18M Volume",
    desc: "By locking in 5 exclusive zip codes, this 8-agent team secured 14 off-market seller listings with an average sale price of $2.4M.",
  },
  {
    title: "Institutional Buyer Closes 42 Off-Market Homes with 16.2% Cap Rate",
    client: "Vanguard Equity Partners",
    metric: "16.2% Cap Rate",
    desc: "Leveraging direct skip-tracing feeds and automated ARV comps, Vanguard streamlined acquisition from 45 days down to 8 days.",
  },
];

export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Proven Results
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Client Growth <span className="text-[#C9A227]">Case Studies</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Real data, real transaction volume, and verified ROI case studies from leading real estate firms.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {studies.map((s, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold bg-[#0A2647]/5 text-[#0A2647] border border-[#0A2647]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    {s.client}
                  </span>
                  <span className="text-sm font-extrabold text-[#C9A227] font-mono bg-[#C9A227]/10 px-3 py-1 rounded-full border border-[#C9A227]/30">
                    {s.metric}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-xl text-[#0A2647] mb-3">{s.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">{s.desc}</p>
              </div>
              <a href="/contact" className="w-full bg-[#0A2647] text-white font-heading font-bold text-xs py-3.5 rounded-xl transition-all text-center hover:bg-[#C9A227] hover:text-[#0A2647]">
                Read Full Case Study →
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
