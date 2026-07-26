"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const footerSections = [
  {
    title: "Properties",
    links: [
      { label: "Homes for Sale", href: "/properties/for-sale" },
      { label: "Rental Properties", href: "/properties/for-rent" },
      { label: "Luxury Properties", href: "/properties/luxury" },
      { label: "Commercial Properties", href: "/properties/commercial" },
      { label: "Investment Properties", href: "/properties/investment" },
      { label: "Open Houses", href: "/properties/open-houses" },
      { label: "New Listings", href: "/properties/new-listings" },
      { label: "Featured Properties", href: "/properties/featured" },
    ],
  },
  {
    title: "Buyers & Sellers",
    links: [
      { label: "Buyer Services", href: "/buyers" },
      { label: "First-Time Buyers", href: "/buyers/first-time" },
      { label: "Mortgage Calculator", href: "/buyers/mortgage-calculator" },
      { label: "Pre-Approval Guide", href: "/buyers/pre-approval" },
      { label: "Seller Services", href: "/sellers" },
      { label: "Home Valuation", href: "/sellers/home-valuation" },
      { label: "Selling Guide", href: "/sellers/selling-guide" },
      { label: "Net Proceeds Calculator", href: "/sellers/net-proceeds-calculator" },
    ],
  },
  {
    title: "Investors & Pros",
    links: [
      { label: "Investor Services", href: "/investors" },
      { label: "Deal Analyzer", href: "/investors/deal-analyzer" },
      { label: "ROI Calculator", href: "/investors/roi-calculator" },
      { label: "Cap Rate Calculator", href: "/investors/cap-rate-calculator" },
      { label: "Agent Directory", href: "/realtors/agent-directory" },
      { label: "Join as Agent", href: "/agents/apply" },
      { label: "Lender Partners", href: "/lenders" },
      { label: "Title Companies", href: "/title-companies" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Real Estate Guides", href: "/guides" },
      { label: "Market Reports", href: "/market-reports" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Newsletter", href: "/newsletter" },
      { label: "FAQ", href: "/faq" },
      { label: "Sitemap", href: "/sitemap" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Careers", href: "/about" },
      { label: "Press", href: "/press" },
      { label: "Partners", href: "/partners" },
      { label: "Wholesalers", href: "/wholesalers" },
      { label: "Property Managers", href: "/property-managers" },
    ],
  },
];

export default function FooterVariants() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <div className="bg-[#051324] border-t border-slate-800">
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top: Logo, Description & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-10 border-b border-slate-800">
          <div className="lg:col-span-5">
            <Logo size="xl" href="/" dark />
            <p className="text-slate-400 text-sm mt-4 max-w-md leading-relaxed">
              Your trusted platform for real estate investments, agent connections, and property discovery across the United States and Canada.
            </p>
            <form onSubmit={handleSubscribe} className="mt-6 flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter your email..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#C9A227]"
              />
              <button
                type="submit"
                className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] text-sm font-extrabold px-5 py-2.5 rounded-lg whitespace-nowrap"
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {footerSections.map((section, i) => (
              <div key={i}>
                <h4 className="text-[#C9A227] font-heading text-xs font-extrabold uppercase tracking-wider mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link href={link.href} className="text-slate-400 text-xs hover:text-[#C9A227] transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Copyright & Legal */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Domestic Real Estate Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-[#C9A227] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#C9A227] transition-colors">Terms of Service</Link>
            <Link href="/cookie-policy" className="hover:text-[#C9A227] transition-colors">Cookie Policy</Link>
            <Link href="/accessibility" className="hover:text-[#C9A227] transition-colors">Accessibility</Link>
            <Link href="/sitemap" className="hover:text-[#C9A227] transition-colors">Sitemap</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
