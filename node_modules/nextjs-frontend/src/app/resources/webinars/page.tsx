import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, breadcrumbLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { PageHero, FeaturesSection, CTASection, renderIcon } from "@/components/ui/PageTemplate";

export const metadata: Metadata = buildMetadata({
  title: "Real Estate Webinars & Live Events",
  description: "Free live and on-demand real estate webinars covering market trends, investment strategies, home buying tips, and agent training.",
  path: "/resources/webinars",
  keywords: ["real estate webinar", "property investment webinar", "home buying seminar", "real estate training online", "market update webinar"],
});

const upcomingWebinars = [
  { icon: "events", title: "Market Update: Q3 2026 Outlook", description: "Live analysis of current housing market trends, interest rate projections, and investment opportunities across major US markets." },
  { icon: "construction", title: "First-Time Home Buyer Masterclass", description: "A comprehensive 90-minute session covering pre-approval, home search strategy, offer negotiation, and closing." },
  { icon: "growth", title: "Building Wealth Through Rental Properties", description: "Learn how to analyze deals, calculate ROI, and build a profitable rental property portfolio from scratch." },
  { icon: "tech", title: "AI-Powered Real Estate: What's Next", description: "Explore how artificial intelligence is transforming property search, valuations, and market analysis." },
  { icon: "rental", title: "Selling Your Home for Top Dollar", description: "Proven strategies for pricing, staging, marketing, and negotiating to maximize your sale price." },
  { icon: "growth", title: "Wholesaling 101: Finding Off-Market Deals", description: "Introduction to wholesaling real estate including skip-tracing, direct mail, and contract assignment basics." },
];

const onDemandTopics = [
  { icon: "events", title: "Real Estate Investing Fundamentals", description: "Core concepts every investor needs to know before buying their first rental property." },
  { icon: "leads", title: "Understanding Mortgage Options", description: "Deep dive into conventional, FHA, VA, and jumbo loan programs with comparison breakdowns." },
  { icon: "construction", title: "Due Diligence for Property Investors", description: "How to evaluate neighborhoods, analyze rent comps, and inspect properties before purchasing." },
  { icon: "brand", title: "Agent Success Blueprint", description: "Training series for real estate agents on lead generation, CRM management, and closing techniques." },
];

export default function WebinarsPage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }, { name: "Webinars", path: "/resources/webinars" }])} />
      <PageHero badge="Webinars" title="Real Estate Webinars & Events" subtitle="Learn from industry experts through live and on-demand educational sessions." />

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[#C9A227] font-heading font-bold text-xs uppercase tracking-widest block mb-2">
              Upcoming Sessions
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0A2647]">Live Webinars</h2>
            <p className="mt-3 text-slate-600 font-body">Register for free and join from anywhere.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingWebinars.map((w, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all">
                <div className="w-12 h-12 bg-[#0A2647]/10 rounded-xl flex items-center justify-center mb-5 hover:bg-[#C9A227]/20 transition-colors text-[#C9A227]">{renderIcon(w.icon)}</div>
                <h3 className="font-heading font-bold text-lg text-[#0A2647] mb-2">{w.title}</h3>
                <p className="font-body text-slate-600 text-sm leading-relaxed">{w.description}</p>
                <Link href="/contact?type=webinar" className="mt-4 inline-block text-[#C9A227] font-heading font-semibold text-sm hover:underline">
                  Register Free →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturesSection
        title="On-Demand Library"
        subtitle="Watch anytime — recordings from past webinars and training sessions."
        features={onDemandTopics}
        columns={2}
      />

      <CTASection
        title="Have a Topic Request?"
        subtitle="Let us know what you'd like to learn about and we'll add it to our upcoming schedule."
        primaryAction={{ label: "Suggest a Topic", href: "/contact" }}
        secondaryAction={{ label: "Subscribe for Updates", href: "/newsletter" }}
      />
    </main>
  );
}
