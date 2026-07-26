import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Strategic Partnerships & Integrations",
  description: "Explore partnership opportunities with Domestic Real Estate. Technology integrations, affiliate programs, and co-marketing.",
  path: "/partners",
  keywords: ["real estate partnership", "technology integration", "affiliate program", "co-marketing"],
});

const partners = [
  { name: "Follow Up Boss", category: "CRM & Pipeline Automation", desc: "Real-time lead sync and automated text/call follow-up triggers." },
  { name: "KVCore / Inside Real Estate", category: "Enterprise Platform", desc: "Bi-directional lead webhook integration and smart drip campaigns." },
  { name: "Zapier", category: "Workflow Integration", desc: "Connect Domestic RE to over 5,000+ business applications effortlessly." },
  { name: "Salesforce Financial Cloud", category: "Institutional CRM", desc: "Enterprise deal routing and custom property pipeline analytics." },
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Technology & Industry Ecosystem
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Integrated With Your <span className="text-[#C9A227]">Tech Stack</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Native integrations and instant API webhooks with leading real estate CRMs, title companies, and analytics engines.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {partners.map((p, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all">
              <span className="text-xs font-extrabold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 px-3 py-1 rounded-full uppercase tracking-wider block w-max mb-4">
                {p.category}
              </span>
              <h3 className="font-heading font-bold text-xl text-[#0A2647] mb-2">{p.name}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
