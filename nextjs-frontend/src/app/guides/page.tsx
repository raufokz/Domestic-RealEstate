import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Real Estate Guides & Expert Resources",
  description: "Comprehensive real estate guides for buyers, sellers, and investors. Market insights, negotiation tips, and investment strategies.",
  path: "/guides",
  keywords: ["real estate guides", "home buying guide", "selling tips", "investment strategy"],
});

const guides = [
  {
    title: "The Ultimate First-Time Homebuyer Survival Guide",
    category: "For Buyers",
    desc: "Complete 45-page playbook covering credit optimization, mortgage pre-approval, inspection red flags, and closing cost negotiations.",
    badge: "Free PDF Download",
  },
  {
    title: "Maximum Equity: Staging & Pricing Your Property For Top Dollar",
    category: "For Sellers",
    desc: "Step-by-step checklist used by top 1% listing agents to generate competitive bidding wars and shorten days on market.",
    badge: "Best Seller Guide",
  },
  {
    title: "Off-Market Deal Sourcing & Skip-Tracing Masterclass",
    category: "For Investors",
    desc: "Learn how institutional investors find 15%+ Cap Rate off-market deals using skip tracing, probate data, and tax default leads.",
    badge: "Investor Playbook",
  },
  {
    title: "Realtor Zip Code Exclusivity & Lead Conversion Systems",
    category: "For Agents",
    desc: "How top producing agents build 7-figure real estate practices with automated lead workflows and CRM webhooks.",
    badge: "Agent Strategy",
  },
];

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      {/* Hero Section */}
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Resource & Download Library
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Real Estate <span className="text-[#C9A227]">Playbooks & Guides</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Free actionable ebooks, deal modeling templates, and checklists designed for home buyers, sellers, realtors, and investors.
          </p>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {guides.map((guide, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold bg-[#0A2647]/5 text-[#0A2647] border border-[#0A2647]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    {guide.category}
                  </span>
                  <span className="text-xs font-bold text-[#C9A227] bg-[#C9A227]/10 px-2.5 py-0.5 rounded-full border border-[#C9A227]/30">
                    {guide.badge}
                  </span>
                </div>

                <h2 className="font-heading font-bold text-xl text-[#0A2647] mb-3 leading-snug">
                  {guide.title}
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">{guide.desc}</p>
              </div>

              <a
                href="/contact?type=guide"
                className="w-full bg-[#0A2647] hover:bg-[#C9A227] hover:text-[#0A2647] text-white font-heading font-bold text-xs py-3.5 rounded-xl transition-all text-center"
              >
                Download Free Playbook →
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
