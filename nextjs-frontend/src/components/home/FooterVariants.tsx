"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { apiPost, ApiError } from "@/lib/api";

const footerSections = [
  {
    id: "properties",
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
    id: "buyers-sellers",
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
    id: "investors-pros",
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
    id: "resources",
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
    id: "company",
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Press", href: "/press" },
      { label: "Partners", href: "/partners" },
      { label: "Wholesalers", href: "/wholesalers" },
      { label: "Property Managers", href: "/property-managers" },
    ],
  },
];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2 focus-visible:ring-offset-[#051324]";

/** True below the `sm` breakpoint, where link columns collapse into accordions. */
function useIsCompact() {
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isCompact;
}

export default function FooterVariants() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const isCompact = useIsCompact();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || status === "submitting") return;

    setStatus("submitting");
    setMessage("");
    try {
      await apiPost("/marketing/newsletter", { email, source: "footer" });
      setStatus("success");
      setMessage("You're subscribed. Check your inbox for a welcome email.");
      setNewsletterEmail("");
    } catch (err) {
      setStatus("error");
      if (err instanceof ApiError && err.status === 422) {
        setMessage("That email is already subscribed — you're all set.");
      } else {
        setMessage(
          err instanceof ApiError
            ? err.message
            : "Could not subscribe right now. Please try again in a moment."
        );
      }
    }
  };

  return (
    <div className="bg-[#051324] border-t border-slate-800">
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Top: brand + newsletter, then the link columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-10 border-b border-slate-800">
          <div className="lg:col-span-5">
            <Logo size="xl" href="/" dark />
            <p className="text-slate-300 text-sm mt-4 max-w-md leading-relaxed">
              Your trusted platform for real estate investments, agent connections, and property
              discovery across the United States and Canada.
            </p>

            <form onSubmit={handleSubscribe} className="mt-6" noValidate>
              <label htmlFor="footer-newsletter" className="block text-sm font-medium text-white mb-1.5">
                Get market insights by email
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <input
                  id="footer-newsletter"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  required
                  aria-describedby="newsletter-status"
                  aria-invalid={status === "error"}
                  className={`flex-1 min-h-[48px] px-4 bg-slate-900 border rounded-lg text-[16px] sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition-colors ${
                    status === "error" ? "border-red-400" : "border-slate-600"
                  }`}
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className={`min-h-[48px] w-full sm:w-auto bg-[#C9A227] hover:bg-[#B59123] text-[#07162C] text-sm font-bold px-6 rounded-lg whitespace-nowrap transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS_RING}`}
                >
                  {status === "submitting" ? "Subscribing…" : "Subscribe"}
                </button>
              </div>

              {/* One live region covers both outcomes, so screen readers announce
                  the result without the layout shifting between states. */}
              <p
                id="newsletter-status"
                role="status"
                aria-live="polite"
                className={`mt-2 text-sm min-h-[20px] ${
                  status === "error" ? "text-red-300" : "text-[#E7C95D]"
                }`}
              >
                {message}
              </p>
            </form>
          </div>

          {/* Link columns — accordions on phones, open columns from sm up */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-1 sm:gap-y-8">
            {footerSections.map((section) => {
              const expanded = !isCompact || openSection === section.id;
              return (
                <nav key={section.id} aria-labelledby={`footer-${section.id}`} className="border-b border-slate-800 sm:border-b-0">
                  {isCompact ? (
                    <h2>
                      <button
                        type="button"
                        id={`footer-${section.id}`}
                        aria-expanded={expanded}
                        aria-controls={`footer-list-${section.id}`}
                        onClick={() => setOpenSection(expanded ? null : section.id)}
                        className={`w-full flex min-h-[52px] items-center justify-between gap-2 text-left text-[#C9A227] font-heading text-sm font-bold uppercase tracking-wider rounded ${FOCUS_RING}`}
                      >
                        {section.title}
                        <svg
                          className={`w-4 h-4 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </h2>
                  ) : (
                    <h2
                      id={`footer-${section.id}`}
                      className="text-[#C9A227] font-heading text-xs font-bold uppercase tracking-wider mb-4"
                    >
                      {section.title}
                    </h2>
                  )}

                  {expanded && (
                    <ul id={`footer-list-${section.id}`} className="pb-3 sm:pb-0 sm:space-y-2">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={`flex min-h-[44px] sm:min-h-0 items-center text-slate-300 text-[15px] sm:text-[13px] hover:text-[#C9A227] transition-colors rounded ${FOCUS_RING}`}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </nav>
              );
            })}
          </div>
        </div>

        {/* Bottom: copyright + legal */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate-300">
          <p>&copy; {new Date().getFullYear()} Domestic Real Estate Inc. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <Link href="/privacy" className={`min-h-[44px] sm:min-h-0 flex items-center hover:text-[#C9A227] transition-colors rounded ${FOCUS_RING}`}>Privacy Policy</Link>
            <Link href="/terms" className={`min-h-[44px] sm:min-h-0 flex items-center hover:text-[#C9A227] transition-colors rounded ${FOCUS_RING}`}>Terms of Service</Link>
            <Link href="/cookie-policy" className={`min-h-[44px] sm:min-h-0 flex items-center hover:text-[#C9A227] transition-colors rounded ${FOCUS_RING}`}>Cookie Policy</Link>
            <Link href="/accessibility" className={`min-h-[44px] sm:min-h-0 flex items-center hover:text-[#C9A227] transition-colors rounded ${FOCUS_RING}`}>Accessibility</Link>
            <Link href="/sitemap" className={`min-h-[44px] sm:min-h-0 flex items-center hover:text-[#C9A227] transition-colors rounded ${FOCUS_RING}`}>Sitemap</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
