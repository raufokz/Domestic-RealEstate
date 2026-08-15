"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

function dashboardPathForRole(role: string): string {
  if (role === "super_admin" || role === "admin") return "/admin";
  return `/${role}/dashboard`;
}

function roleLabel(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface SubMenuItem {
  title: string;
  href: string;
  badge?: string;
}

interface NavCategory {
  id: string;
  label: string;
  items: SubMenuItem[];
}

const navCategories: NavCategory[] = [
  {
    id: "properties",
    label: "Properties",
    items: [
      { title: "All Properties", href: "/properties" },
      { title: "Homes for Sale", href: "/properties/for-sale" },
      { title: "Rental Properties", href: "/properties/for-rent" },
      { title: "Featured Properties", href: "/properties/featured", badge: "Hot" },
      { title: "New Listings", href: "/properties/new-listings", badge: "New" },
      { title: "Luxury Properties", href: "/properties/luxury" },
      { title: "Commercial Properties", href: "/properties/commercial" },
      { title: "Investment Properties", href: "/properties/investment" },
      { title: "Open Houses", href: "/properties/open-houses" },
      { title: "Map Search", href: "/properties/map" },
      { title: "Compare Properties", href: "/properties/compare" },
    ],
  },
  {
    id: "buyers",
    label: "Buyers",
    items: [
      { title: "Buyer Services", href: "/buyers" },
      { title: "Get Started", href: "/buyers/get-started" },
      { title: "First-Time Buyers", href: "/buyers/first-time" },
      { title: "Buyer Guide", href: "/buyers/guide" },
      { title: "Mortgage Calculator", href: "/buyers/mortgage-calculator" },
      { title: "Affordability Calculator", href: "/buyers/affordability-calculator" },
      { title: "Closing Cost Calculator", href: "/buyers/closing-cost-calculator" },
      { title: "Pre-Approval Info", href: "/buyers/pre-approval" },
      { title: "Relocation Services", href: "/buyers/relocation" },
    ],
  },
  {
    id: "sellers",
    label: "Sellers",
    items: [
      { title: "Seller Services", href: "/sellers" },
      { title: "Get Started", href: "/sellers/get-started" },
      { title: "Home Valuation", href: "/sellers/home-valuation", badge: "Free" },
      { title: "Selling Guide", href: "/sellers/selling-guide" },
      { title: "List Your Property", href: "/sellers/list-your-property" },
      { title: "Net Proceeds Calculator", href: "/sellers/net-proceeds-calculator" },
      { title: "Marketing Plan", href: "/sellers/marketing-plan" },
      { title: "Prepare to Sell", href: "/sellers/prepare-to-sell" },
    ],
  },
  {
    id: "investors",
    label: "Investors",
    items: [
      { title: "Investor Services", href: "/investors" },
      { title: "Investment Opportunities", href: "/investors/deals" },
      { title: "Deal Analyzer", href: "/investors/deal-analyzer" },
      { title: "ROI Calculator", href: "/investors/roi-calculator" },
      { title: "Cap Rate Calculator", href: "/investors/cap-rate-calculator" },
      { title: "Cash Flow Calculator", href: "/investors/cash-flow-calculator" },
      { title: "Fix & Flip Calculator", href: "/investors/flip-calculator" },
      { title: "Market Reports", href: "/investors/market-reports" },
    ],
  },
  {
    id: "leads",
    label: "Leads",
    items: [
      { title: "Buy Leads (Pay-Per-Lead)", href: "/marketplace", badge: "New" },
      { title: "My Purchased Leads", href: "/marketplace/purchased" },
      { title: "How It Works", href: "/marketplace/how-it-works" },
    ],
  },
  {
    id: "agents",
    label: "Agents",
    items: [
      { title: "Find Property Agents", href: "/agents" },
      { title: "Join Preferred Network", href: "/register?role=agent", badge: "Join" },
      { title: "Agent Lounge & Tools", href: "/agent/dashboard", badge: "Pro" },
      { title: "Apply as Partner Broker", href: "/register?role=broker" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    items: [
      { title: "Blog", href: "/blog" },
      { title: "Real Estate Guides", href: "/guides" },
      { title: "Market Reports", href: "/market-reports" },
      { title: "Resource Center", href: "/resources" },
      { title: "Testimonials", href: "/testimonials" },
      { title: "Case Studies", href: "/case-studies" },
      { title: "About Us", href: "/about" },
      { title: "Contact Us", href: "/contact" },
    ],
  },
];

/** Searches offered as one-tap shortcuts in the search dialog. */
const POPULAR_SEARCHES = [
  { label: "Miami Off-Market", q: "Miami" },
  { label: "Dallas Wholesalers", q: "Dallas" },
  { label: "Luxury Homes", q: "Luxury" },
];

/** Shared focus ring so every interactive control in the header matches. */
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2";

export default function HeaderVariants() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const navRef = useRef<HTMLElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchDialogRef = useRef<HTMLDivElement | null>(null);
  const searchTriggerRef = useRef<HTMLButtonElement | null>(null);

  /** A category is "current" when the visited page lives underneath one of its links. */
  const isCategoryActive = useCallback(
    (cat: NavCategory) =>
      cat.items.some((item) => {
        const base = item.href.split("?")[0];
        return base !== "/" && pathname === base;
      }),
    [pathname]
  );

  const isLinkActive = useCallback(
    (href: string) => pathname === href.split("?")[0],
    [pathname]
  );

  /* Close every transient surface whenever the route changes, so navigating
     from inside a menu never leaves that menu hanging open on the new page.
     Adjusted during render rather than in an effect — React's documented
     pattern for state derived from a changing input, and it avoids the extra
     commit (and visible flash of the still-open menu) an effect would cause. */
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
    setSearchModalOpen(false);
  }

  /* Escape closes the topmost surface; click-outside closes menus. */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (searchModalOpen) {
        setSearchModalOpen(false);
        searchTriggerRef.current?.focus();
      } else if (activeDropdown) {
        setActiveDropdown(null);
      } else if (accountMenuOpen) {
        setAccountMenuOpen(false);
      } else if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (navRef.current && !navRef.current.contains(target)) setActiveDropdown(null);
      if (accountRef.current && !accountRef.current.contains(target)) setAccountMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [searchModalOpen, activeDropdown, accountMenuOpen, mobileMenuOpen]);

  /* Lock background scroll while a full-screen surface is open, otherwise the
     page behind the drawer scrolls under the user's finger on mobile. */
  useEffect(() => {
    const locked = searchModalOpen || mobileMenuOpen;
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [searchModalOpen, mobileMenuOpen]);

  /* Move focus into the search dialog when it opens. */
  useEffect(() => {
    if (searchModalOpen) searchInputRef.current?.focus();
  }, [searchModalOpen]);

  /** Keep Tab focus inside the open search dialog. */
  const trapFocus = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const focusable = searchDialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const handleLogout = async () => {
    setAccountMenuOpen(false);
    await logout();
    window.location.href = "/";
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      searchInputRef.current?.focus();
      return;
    }
    setSearchModalOpen(false);
    router.push(`/properties?q=${encodeURIComponent(q)}`);
  };

  return (
    /* z-[60] keeps the header and its open mobile drawer above the floating
       chat widget, which is also z-50 but paints later in the DOM. */
    <div className="w-full sticky top-0 z-[60] font-body">
      {/* ── TOP UTILITY TIER ──
          Hidden below md: on a phone this tier only competed with the real
          navigation for space. Its links all live in the drawer instead. */}
      <div className="hidden md:block w-full bg-[#07162C] border-b border-[#C9A227]/30 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between text-[11px] tracking-wide">
          {/* Left: status + direct contact */}
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" aria-hidden="true" />
              Pro Network
            </span>
            <a
              href="mailto:info@domesticrealestate.us"
              className={`text-slate-300 hover:text-[#C9A227] transition-colors rounded ${FOCUS_RING} focus-visible:ring-offset-[#07162C]`}
            >
              info@domesticrealestate.us
            </a>
          </div>

          {/* Right: secondary destinations + account */}
          <div className="flex items-center gap-4 text-slate-300">
            <Link
              href="/about"
              aria-current={isLinkActive("/about") ? "page" : undefined}
              className={`hover:text-[#C9A227] transition-colors rounded ${FOCUS_RING} focus-visible:ring-offset-[#07162C] ${
                isLinkActive("/about") ? "text-[#C9A227]" : ""
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              aria-current={isLinkActive("/contact") ? "page" : undefined}
              className={`hover:text-[#C9A227] transition-colors rounded ${FOCUS_RING} focus-visible:ring-offset-[#07162C] ${
                isLinkActive("/contact") ? "text-[#C9A227]" : ""
              }`}
            >
              Contact
            </Link>
            <span className="text-slate-600" aria-hidden="true">
              |
            </span>
            {!loading && user ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                  className={`hover:text-[#C9A227] transition-colors flex items-center gap-1.5 text-white cursor-pointer rounded px-1 py-0.5 ${FOCUS_RING} focus-visible:ring-offset-[#07162C]`}
                  onClick={() => setAccountMenuOpen((v) => !v)}
                >
                  <span className="font-medium">{user.name}</span>
                  <span className="hidden sm:inline text-[10px] font-semibold bg-[#C9A227]/20 text-[#C9A227] px-1.5 py-0.5 rounded-full">
                    {roleLabel(user.role)}
                  </span>
                </button>
                <AnimatePresence>
                  {accountMenuOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl p-1.5 shadow-xl z-50"
                    >
                      <Link
                        href={dashboardPathForRole(user.role)}
                        role="menuitem"
                        onClick={() => setAccountMenuOpen(false)}
                        className={`flex min-h-[44px] items-center px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0A2647] transition-colors ${FOCUS_RING}`}
                      >
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className={`w-full text-left flex min-h-[44px] items-center px-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer ${FOCUS_RING}`}
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className={`hover:text-[#C9A227] transition-colors text-white rounded px-1 py-0.5 ${FOCUS_RING} focus-visible:ring-offset-[#07162C]`}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN NAVIGATION TIER ── */}
      <header className="w-full bg-white border-b border-slate-200 shadow-sm py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          {/* Brand — allowed to shrink first so the actions never overflow */}
          <div className="flex items-center min-w-0 shrink">
            <Logo size="md" href="/" dark={false} className="max-w-[130px] sm:max-w-none" />
          </div>

          {/* Desktop navigation.
              Each trigger is a real button: it opens on click for keyboard and
              touch users, and on hover as a convenience for pointer users. */}
          <nav
            ref={navRef}
            aria-label="Main"
            className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0"
          >
            {navCategories.map((cat) => {
              const isOpen = activeDropdown === cat.id;
              const isActive = isCategoryActive(cat);
              return (
                <div
                  key={cat.id}
                  className="relative shrink-0"
                  onMouseEnter={() => setActiveDropdown(cat.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => setActiveDropdown(isOpen ? null : cat.id)}
                    className={`relative flex min-h-[44px] items-center gap-1 px-3 rounded-lg transition-colors cursor-pointer text-sm font-semibold whitespace-nowrap ${FOCUS_RING} ${
                      isOpen
                        ? "bg-[#0A2647] text-white"
                        : isActive
                        ? "text-[#0A2647] bg-slate-100"
                        : "text-slate-700 hover:text-[#0A2647] hover:bg-slate-50"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <motion.svg
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className={`w-3.5 h-3.5 shrink-0 ${isOpen ? "text-white" : "text-[#C9A227]"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                    {/* Current-section marker: not colour alone, a visible bar. */}
                    {isActive && !isOpen && (
                      <span className="absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-[#C9A227]" aria-hidden="true" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.16 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl z-50"
                      >
                        <div className="px-2 pt-1 pb-2 mb-1 text-[11px] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                          {cat.label}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {cat.items.map((sub) => {
                            const active = isLinkActive(sub.href);
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                aria-current={active ? "page" : undefined}
                                onClick={() => setActiveDropdown(null)}
                                className={`flex min-h-[44px] items-center justify-between gap-2 px-3 rounded-lg transition-colors ${FOCUS_RING} ${
                                  active
                                    ? "bg-slate-100 text-[#0A2647]"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-[#0A2647]"
                                }`}
                              >
                                <span className="text-sm font-medium">{sub.title}</span>
                                {sub.badge && (
                                  <span className="shrink-0 bg-[#C9A227] text-[#07162C] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {sub.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Right-hand actions.
              One primary CTA (gold) only; search and menu stay secondary. */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              ref={searchTriggerRef}
              onClick={() => setSearchModalOpen(true)}
              aria-label="Search properties"
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#0A2647] transition-colors cursor-pointer ${FOCUS_RING}`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              {/* Label appears only at xl: between lg and xl the seven-item nav
                  needs the horizontal space, and the icon alone is clear. */}
              <span className="hidden xl:inline text-sm font-semibold">Search</span>
            </button>

            <Link
              href="/properties"
              className={`flex min-h-[44px] items-center gap-1.5 px-3 sm:px-5 rounded-lg bg-[#C9A227] text-[#07162C] text-sm font-bold shadow-sm hover:bg-[#B59123] transition-colors whitespace-nowrap ${FOCUS_RING}`}
            >
              {/* Short label on phones (fits 320–375px) and again between lg and
                  xl, where the full desktop nav competes for the same row. */}
              <span className="xl:hidden">Browse</span>
              <span className="hidden xl:inline">Browse Properties</span>
              <span aria-hidden="true">→</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className={`lg:hidden flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer ${FOCUS_RING}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ──
          Categories are collapsed accordions rather than ~50 links in one
          scroll, so the first screen shows the whole site structure at once. */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-xl max-h-[calc(100vh-100%)] overflow-y-auto overscroll-contain"
          >
            <nav aria-label="Mobile" className="px-4 py-3">
              {navCategories.map((cat) => {
                const expanded = mobileSection === cat.id;
                const isActive = isCategoryActive(cat);
                return (
                  <div key={cat.id} className="border-b border-slate-100 last:border-b-0">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`section-${cat.id}`}
                      onClick={() => setMobileSection(expanded ? null : cat.id)}
                      className={`w-full flex min-h-[52px] items-center justify-between gap-2 px-1 text-left cursor-pointer rounded-lg ${FOCUS_RING} ${
                        isActive ? "text-[#0A2647]" : "text-slate-800"
                      }`}
                    >
                      <span className="text-base font-semibold">{cat.label}</span>
                      <motion.svg
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-4 h-4 text-slate-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    </button>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          id={`section-${cat.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col pb-2">
                            {cat.items.map((sub) => {
                              const active = isLinkActive(sub.href);
                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  aria-current={active ? "page" : undefined}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={`flex min-h-[48px] items-center justify-between gap-2 px-3 rounded-lg transition-colors ${FOCUS_RING} ${
                                    active
                                      ? "bg-slate-100 text-[#0A2647] font-semibold"
                                      : "text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  <span className="text-[15px]">{sub.title}</span>
                                  {sub.badge && (
                                    <span className="shrink-0 bg-[#C9A227] text-[#07162C] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                      {sub.badge}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Account actions pinned at the end of the drawer */}
              <div className="flex flex-col gap-2 pt-4 pb-2">
                {!loading && user ? (
                  <>
                    <Link
                      href={dashboardPathForRole(user.role)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex min-h-[48px] items-center justify-center rounded-lg bg-[#C9A227] text-[#07162C] text-sm font-bold ${FOCUS_RING}`}
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className={`flex min-h-[48px] items-center justify-center rounded-lg border border-slate-300 text-sm font-semibold text-red-600 cursor-pointer ${FOCUS_RING}`}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex min-h-[48px] items-center justify-center rounded-lg bg-[#C9A227] text-[#07162C] text-sm font-bold ${FOCUS_RING}`}
                    >
                      Get Started Free
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex min-h-[48px] items-center justify-center rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 ${FOCUS_RING}`}
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SEARCH DIALOG ──
          Submits to the properties listing, which already reads ?q=. */}
      <AnimatePresence>
        {searchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 sm:pt-24 px-4"
            onClick={() => setSearchModalOpen(false)}
          >
            <motion.div
              ref={searchDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="search-dialog-title"
              initial={{ scale: 0.97, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 12 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={trapFocus}
              className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-xl shadow-2xl relative z-50"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 id="search-dialog-title" className="text-lg font-bold text-[#0A2647]">
                  Search properties
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setSearchModalOpen(false);
                    searchTriggerRef.current?.focus();
                  }}
                  aria-label="Close search"
                  className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer ${FOCUS_RING}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={submitSearch}>
                <label htmlFor="site-search" className="block text-sm font-medium text-slate-700 mb-1.5">
                  City, neighborhood, or ZIP code
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="site-search"
                    ref={searchInputRef}
                    type="search"
                    placeholder="e.g. Miami, 33139"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 min-h-[48px] px-3 rounded-lg border border-slate-300 text-[16px] text-slate-800 placeholder-slate-400 focus:border-[#C9A227] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30"
                  />
                  <button
                    type="submit"
                    className={`min-h-[48px] px-5 rounded-lg bg-[#0A2647] text-white font-semibold text-sm hover:bg-[#07162C] transition-colors cursor-pointer shrink-0 ${FOCUS_RING}`}
                  >
                    Search
                  </button>
                </div>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-2">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((item) => (
                    <Link
                      key={item.label}
                      href={`/properties?q=${encodeURIComponent(item.q)}`}
                      onClick={() => setSearchModalOpen(false)}
                      className={`inline-flex min-h-[40px] items-center px-3 rounded-full bg-slate-100 text-sm font-medium text-slate-700 hover:bg-[#C9A227] hover:text-[#07162C] transition-colors ${FOCUS_RING}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
