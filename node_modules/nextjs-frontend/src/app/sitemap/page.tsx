import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, webPageLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sitemap",
  description:
    "Browse every public section of Domestic Real Estate — property search, buyer, seller, investor and wholesaler services, agent and brokerage programs, partners, and company resources.",
  path: "/sitemap",
  keywords: ["sitemap", "site index", "domestic real estate pages"],
});

interface LinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

const groups: LinkGroup[] = [
  {
    title: "Company & Support",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Frequently Asked Questions", href: "/faq" },
      { label: "Blog", href: "/blog" },
      { label: "Guides", href: "/guides" },
      { label: "Market Reports", href: "/market-reports" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
  {
    title: "Property Discovery",
    links: [
      { label: "All Properties", href: "/properties" },
      { label: "Map Search", href: "/properties/map" },
      { label: "Featured Properties", href: "/properties/featured" },
      { label: "New Listings", href: "/properties/new-listings" },
      { label: "Homes for Sale", href: "/properties/for-sale" },
      { label: "Rentals", href: "/properties/for-rent" },
      { label: "Luxury Properties", href: "/properties/luxury" },
      { label: "Commercial", href: "/properties/commercial" },
      { label: "Open Houses", href: "/properties/open-houses" },
      { label: "Advanced Search", href: "/properties" },
    ],
  },
  {
    title: "For Buyers",
    links: [
      { label: "Buyer Services", href: "/buyers" },
      { label: "Home Search", href: "/properties" },
      { label: "Buyer Guide", href: "/buyers/guide" },
      { label: "Mortgage Calculator", href: "/buyers/mortgage-calculator" },
      { label: "Affordability Calculator", href: "/buyers/affordability-calculator" },
      { label: "First-Time Buyers", href: "/buyers/first-time" },
    ],
  },
  {
    title: "For Sellers",
    links: [
      { label: "Seller Services", href: "/sellers" },
      { label: "Home Valuation", href: "/sellers/home-valuation" },
      { label: "List Your Property", href: "/sellers/list-your-property" },
      { label: "Selling Guide", href: "/sellers/selling-guide" },
      { label: "Net Proceeds Calculator", href: "/sellers/net-proceeds-calculator" },
    ],
  },
  {
    title: "For Investors & Wholesalers",
    links: [
      { label: "Investor Services", href: "/investors" },
      { label: "Investment Deals", href: "/investors/deals" },
      { label: "Deal Analyzer", href: "/investors/deal-analyzer" },
      { label: "ROI Calculator", href: "/investors/roi-calculator" },
      { label: "Wholesaler Services", href: "/wholesalers" },
      { label: "Submit a Deal", href: "/wholesalers/submit-deal" },
    ],
  },
  {
    title: "Agents, Brokers & Partners",
    links: [
      { label: "Realtor Services", href: "/realtors" },
      { label: "Join as a Realtor", href: "/realtors/join" },
      { label: "Agent Recruitment", href: "/agents" },
      { label: "Brokerage Solutions", href: "/brokerages" },
      { label: "Lender Partners", href: "/lenders" },
      { label: "Title Companies", href: "/title-companies" },
      { label: "Property Managers", href: "/property-managers" },
      { label: "Partner Program", href: "/partners" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/login" },
      { label: "Create Account", href: "/register" },
      { label: "Forgot Password", href: "/forgot-password" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Accessibility Statement", href: "/accessibility" },
    ],
  },
];

export default function HTMLSitemapPage() {
  return (
    <main className="min-h-screen bg-[#07162C] text-white py-16 px-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webPageLd({ name: "Sitemap", description: "Index of all public Domestic Real Estate pages.", path: "/sitemap" }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Sitemap", path: "/sitemap" },
          ]),
        ]}
      />
      <div className="max-w-6xl mx-auto">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-slate-400">
            <li>
              <Link href="/" className="hover:text-[#C9A227] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] rounded">
                Home
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li className="text-white font-semibold" aria-current="page">Sitemap</li>
          </ol>
        </nav>

        <header className="text-center mb-12">
          <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest">Navigation Directory</span>
          <h1 className="text-4xl font-heading font-extrabold text-white mt-1">Sitemap</h1>
          <p className="mt-2 text-slate-300 text-sm max-w-2xl mx-auto">
            A complete index of the public pages on Domestic Real Estate. Looking for something specific? Try our{" "}
            <Link href="/properties" className="text-[#C9A227] underline">advanced property search</Link>.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title} className="bg-[#0A2647] border border-slate-700 p-6 rounded-3xl shadow-xl">
              <h2 className="text-base font-heading font-extrabold text-[#C9A227] mb-4 border-b border-slate-800 pb-2">
                {group.title}
              </h2>
              <ul className="space-y-2.5 text-sm text-slate-300 font-medium">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-[#C9A227] transition-colors inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] rounded"
                    >
                      <span aria-hidden="true" className="text-[#C9A227]">›</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </main>
  );
}
