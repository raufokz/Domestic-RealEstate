"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CARDS = [
  {
    icon: "🏠",
    title: "Buy a Home",
    copy: "Search homes, compare neighborhoods, and connect with a local agent.",
    cta: "Find Homes",
    href: "/buy",
    accent: "from-[#0A2647] to-[#123c6e]",
  },
  {
    icon: "💰",
    title: "Sell Your Property",
    copy: "Find out what your home could be worth and who should sell it.",
    cta: "Get My Home Value",
    href: "/sell",
    accent: "from-[#123c6e] to-[#0A2647]",
  },
  {
    icon: "📈",
    title: "Invest in Real Estate",
    copy: "Discover investment properties and specialists who know your market.",
    cta: "Explore Investments",
    href: "/invest",
    accent: "from-[#0A2647] to-[#1a4a7a]",
  },
];

/**
 * The homepage's opening question: "what do you want to do?" Consumer-
 * facing, no pricing/subscription language anywhere on this section — see
 * the funnel/homepage plan's Part 2.2 requirement. The existing B2B
 * "Explore Lead Marketplace" hero (HeroVariants) stays further down the
 * page as secondary content, since agents are still the revenue source.
 */
export default function ConsumerIntentRouter() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-14 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0A2647] tracking-tight">
            Buying, selling, or investing?
          </h1>
          <p className="text-slate-500 text-base sm:text-lg mt-3 max-w-xl mx-auto">
            Search homes, find out what yours is worth, and connect with a local real estate professional. Free, always.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                href={card.href}
                className="group block h-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.accent} flex items-center justify-center text-2xl mb-5`}>
                  {card.icon}
                </div>
                <h2 className="font-heading text-xl font-bold text-[#0A2647] mb-2">{card.title}</h2>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">{card.copy}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#C9A227] group-hover:gap-2.5 transition-all">
                  {card.cta}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 font-medium">
          <span>✓ Free for buyers and sellers. Always.</span>
          <span>✓ No account needed</span>
          <span>✓ A local professional reaches out within hours</span>
        </div>
      </div>
    </section>
  );
}
