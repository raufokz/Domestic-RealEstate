import type { MetadataRoute } from "next";
import { getProperties } from "@/lib/properties";
import { getAgents } from "@/lib/agents";
import { getBlogPosts } from "@/lib/blog";
import { CITY_DB } from "@/app/cities/[city]/page";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://domesticrealestate.us";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static Pages definitions
  const sitemapEntries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/news`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/resources`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/testimonials`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // Properties
    { url: `${BASE_URL}/properties`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/properties/for-sale`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/properties/for-rent`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/properties/featured`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/properties/new`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/properties/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/properties/map`, lastModified: now, changeFrequency: "daily", priority: 0.7 },

    // Buyers
    { url: `${BASE_URL}/buyers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/buyers/first-time`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/buyers/mortgage-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/buyers/buying-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/buyers/pre-approval`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/buyers/investor`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/buyers/relocation`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/buyers/luxury`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/buyers/va-loan`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // Sellers
    { url: `${BASE_URL}/sellers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/sellers/home-valuation`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/sellers/selling-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/sellers/staging`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/sellers/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/sellers/marketing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/sellers/closing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/sellers/investor`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // Investors
    { url: `${BASE_URL}/investors`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/investors/roi-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/investors/market-analysis`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/investors/portfolio`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/investors/1031-exchange`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/investors/multi-family`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/investors/short-term-rental`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/investors/commercial`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // Professional Portals
    { url: `${BASE_URL}/realtors`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/realtors/join`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/lenders`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/lenders/join`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/wholesalers`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/wholesalers/submit-deal`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/partners`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/agents`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/agents/apply`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/brokerages`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/brokerages/join`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/title-companies`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/title-companies/join`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/property-managers`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/property-managers/join`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // Guides & Resources
    { url: `${BASE_URL}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/resources/calculators`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/resources/templates`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/resources/webinars`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // Market Reports
    { url: `${BASE_URL}/market-reports`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },

    // Company
    { url: `${BASE_URL}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/case-studies`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/press`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // 2. Add City URLs dynamically from CITY_DB configuration
  try {
    const citySlugs = Object.keys(CITY_DB);
    for (const citySlug of citySlugs) {
      sitemapEntries.push({
        url: `${BASE_URL}/cities/${citySlug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error("Failed to add cities to sitemap:", err);
  }

  // 3. Fetch and add dynamic Properties
  try {
    const properties = await getProperties({}, 100);
    for (const prop of properties) {
      if (prop.slug) {
        sitemapEntries.push({
          url: `${BASE_URL}/properties/${prop.slug}`,
          lastModified: now, // Ideally prop.updated_at if available
          changeFrequency: "daily",
          priority: 0.7,
        });
      }
    }
  } catch (err) {
    console.error("Failed to add properties to sitemap:", err);
  }

  // 4. Fetch and add dynamic Agent Profiles
  try {
    const agents = await getAgents({}, 100);
    for (const agent of agents) {
      if (agent.slug) {
        sitemapEntries.push({
          url: `${BASE_URL}/agents/${agent.slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch (err) {
    console.error("Failed to add agents to sitemap:", err);
  }

  // 5. Fetch and add dynamic Blog Posts and Categories
  try {
    const { posts } = await getBlogPosts(100);
    const categorySlugs = new Set<string>();

    for (const post of posts) {
      if (post.slug) {
        sitemapEntries.push({
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: post.published_at ? new Date(post.published_at) : now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
      if (post.category?.slug) {
        categorySlugs.add(post.category.slug);
      }
    }

    // Add unique category pages
    for (const catSlug of categorySlugs) {
      sitemapEntries.push({
        url: `${BASE_URL}/blog/category/${catSlug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch (err) {
    console.error("Failed to add blogs to sitemap:", err);
  }

  return sitemapEntries;
}
