import Link from "next/link";
import FaqAccordionWidget from "@/components/faq/FaqAccordionWidget";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, faqLd, breadcrumbLd } from "@/lib/seo";
import { faqs } from "@/lib/faqData";

export const metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about buying, selling, and investing on Domestic Real Estate — home valuations, mortgage pre-approval, agent partnerships, investor deal metrics, pricing, and integrations.",
  path: "/faq",
  keywords: [
    "real estate FAQ",
    "frequently asked questions real estate",
    "home valuation questions",
    "mortgage pre-approval help",
    "real estate agent questions",
  ],
});

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <JsonLd
        data={[
          faqLd(faqs.map((f) => ({ question: f.question, answer: f.answer }))),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />

      {/* Hero Section */}
      <section className="relative bg-[#0A2647] text-white py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Help Center & Knowledge Base
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white">
            Frequently Asked <span className="text-[#C9A227]">Questions</span>
          </h1>
          <p className="mt-4 text-base sm:text-xl text-slate-200 max-w-2xl mx-auto font-body">
            Everything you need to know about buying, selling, lead verification, and platform partnerships.
          </p>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FaqAccordionWidget />
      </section>

      {/* Need Further Assistance Banner */}
      <section className="py-16 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-[#0A2647] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl sm:text-4xl font-bold">
            Still Have Questions?
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base font-body max-w-xl mx-auto">
            Our advisory team is ready to provide personalized assistance 24/7.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/contact"
              className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-extrabold text-sm px-7 py-3.5 rounded-xl shadow-gold hover:scale-105 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Contact Support Team →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
