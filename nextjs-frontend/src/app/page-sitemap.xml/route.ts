import { NextResponse } from "next/server";
import { CITY_DB } from "@/app/cities/[city]/page";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.domesticrealestate.us";

export async function GET() {
  const now = new Date().toISOString();
  const urls: string[] = [];

  // Static pages
  const staticPages = [
    { loc: "", changefreq: "daily", priority: "1.0" },
    { loc: "/about", changefreq: "monthly", priority: "0.8" },
    { loc: "/contact", changefreq: "monthly", priority: "0.8" },
    { loc: "/faq", changefreq: "monthly", priority: "0.7" },
    { loc: "/blog", changefreq: "daily", priority: "0.9" },
    { loc: "/news", changefreq: "daily", priority: "0.7" },
    { loc: "/resources", changefreq: "weekly", priority: "0.7" },
    { loc: "/testimonials", changefreq: "monthly", priority: "0.6" },

    // Properties hub (listings index / special categories)
    { loc: "/properties", changefreq: "daily", priority: "0.9" },
    { loc: "/properties/for-sale", changefreq: "daily", priority: "0.8" },
    { loc: "/properties/for-rent", changefreq: "daily", priority: "0.8" },
    { loc: "/properties/featured", changefreq: "daily", priority: "0.8" },
    { loc: "/properties/new", changefreq: "daily", priority: "0.8" },
    { loc: "/properties/compare", changefreq: "monthly", priority: "0.6" },
    { loc: "/properties/map", changefreq: "daily", priority: "0.7" },

    // Buyers
    { loc: "/buyers", changefreq: "weekly", priority: "0.8" },
    { loc: "/buyers/first-time", changefreq: "monthly", priority: "0.7" },
    { loc: "/buyers/mortgage-calculator", changefreq: "monthly", priority: "0.6" },
    { loc: "/buyers/buying-guide", changefreq: "monthly", priority: "0.6" },
    { loc: "/buyers/pre-approval", changefreq: "monthly", priority: "0.6" },
    { loc: "/buyers/investor", changefreq: "monthly", priority: "0.6" },
    { loc: "/buyers/relocation", changefreq: "monthly", priority: "0.6" },
    { loc: "/buyers/luxury", changefreq: "monthly", priority: "0.6" },
    { loc: "/buyers/va-loan", changefreq: "monthly", priority: "0.6" },

    // Sellers
    { loc: "/sellers", changefreq: "weekly", priority: "0.8" },
    { loc: "/sellers/home-valuation", changefreq: "monthly", priority: "0.7" },
    { loc: "/sellers/selling-guide", changefreq: "monthly", priority: "0.6" },
    { loc: "/sellers/staging", changefreq: "monthly", priority: "0.6" },
    { loc: "/sellers/pricing", changefreq: "monthly", priority: "0.6" },
    { loc: "/sellers/marketing", changefreq: "monthly", priority: "0.6" },
    { loc: "/sellers/closing", changefreq: "monthly", priority: "0.6" },
    { loc: "/sellers/investor", changefreq: "monthly", priority: "0.6" },

    // Investors
    { loc: "/investors", changefreq: "weekly", priority: "0.8" },
    { loc: "/investors/roi-calculator", changefreq: "monthly", priority: "0.6" },
    { loc: "/investors/market-analysis", changefreq: "monthly", priority: "0.6" },
    { loc: "/investors/portfolio", changefreq: "monthly", priority: "0.6" },
    { loc: "/investors/1031-exchange", changefreq: "monthly", priority: "0.6" },
    { loc: "/investors/multi-family", changefreq: "monthly", priority: "0.6" },
    { loc: "/investors/short-term-rental", changefreq: "monthly", priority: "0.6" },
    { loc: "/investors/commercial", changefreq: "monthly", priority: "0.6" },

    // Portals
    { loc: "/realtors", changefreq: "monthly", priority: "0.7" },
    { loc: "/realtors/join", changefreq: "monthly", priority: "0.6" },
    { loc: "/lenders", changefreq: "monthly", priority: "0.7" },
    { loc: "/lenders/join", changefreq: "monthly", priority: "0.6" },
    { loc: "/wholesalers", changefreq: "monthly", priority: "0.7" },
    { loc: "/wholesalers/submit-deal", changefreq: "monthly", priority: "0.6" },
    { loc: "/partners", changefreq: "monthly", priority: "0.6" },
    { loc: "/agents", changefreq: "monthly", priority: "0.7" },
    { loc: "/agents/apply", changefreq: "monthly", priority: "0.6" },
    { loc: "/brokerages", changefreq: "monthly", priority: "0.6" },
    { loc: "/brokerages/join", changefreq: "monthly", priority: "0.6" },
    { loc: "/title-companies", changefreq: "monthly", priority: "0.6" },
    { loc: "/title-companies/join", changefreq: "monthly", priority: "0.6" },
    { loc: "/property-managers", changefreq: "monthly", priority: "0.6" },
    { loc: "/property-managers/join", changefreq: "monthly", priority: "0.6" },

    // Resources & guides
    { loc: "/guides", changefreq: "weekly", priority: "0.7" },
    { loc: "/resources/calculators", changefreq: "monthly", priority: "0.6" },
    { loc: "/resources/templates", changefreq: "monthly", priority: "0.6" },
    { loc: "/resources/webinars", changefreq: "monthly", priority: "0.6" },
    { loc: "/market-reports", changefreq: "weekly", priority: "0.7" },

    // Corporate & Legal
    { loc: "/services", changefreq: "monthly", priority: "0.7" },
    { loc: "/case-studies", changefreq: "monthly", priority: "0.6" },
    { loc: "/press", changefreq: "monthly", priority: "0.6" },
    { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
    { loc: "/terms", changefreq: "yearly", priority: "0.3" },
    { loc: "/cookies", changefreq: "yearly", priority: "0.3" },
    { loc: "/accessibility", changefreq: "yearly", priority: "0.3" },
  ];

  for (const page of staticPages) {
    urls.push(`  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  // Add City pages dynamically from CITY_DB
  try {
    const citySlugs = Object.keys(CITY_DB);
    for (const citySlug of citySlugs) {
      urls.push(`  <url>
    <loc>${BASE_URL}/cities/${citySlug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }
  } catch (e) {
    console.error("Sitemap: Failed to query cities:", e);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
