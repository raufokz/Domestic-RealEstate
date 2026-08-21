import type { MetadataRoute } from "next";
import { getProperties } from "@/lib/properties";
import { getAgents } from "@/lib/agents";
import { getBlogPosts } from "@/lib/blog";
import { CITY_DB } from "@/app/cities/[city]/page";
import { groupCitiesByState } from "@/lib/cityStates";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.domesticrealestate.us";

/**
 * Fetch every page of a paginated public endpoint via getProperties/getAgents,
 * rather than a single capped `limit` call. The previous single-call version
 * hard-capped at 100 rows and silently dropped every listing beyond that from
 * the sitemap once inventory grew past it. Stops on an empty page, or at
 * MAX_PAGES as a runaway-loop safety ceiling — 200 pages * 250/page is
 * 50,000 rows, matching Google's per-sitemap URL limit.
 */
async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<T[]>
): Promise<T[]> {
  const PAGE_SIZE_SAFETY_MAX_PAGES = 200;
  const all: T[] = [];
  for (let page = 1; page <= PAGE_SIZE_SAFETY_MAX_PAGES; page++) {
    const batch = await fetchPage(page);
    if (batch.length === 0) break;
    all.push(...batch);
  }
  return all;
}

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
    { url: `${BASE_URL}/properties/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/properties/map`, lastModified: now, changeFrequency: "daily", priority: 0.7 },

    // Buyers
    { url: `${BASE_URL}/buyers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/buyers/first-time`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/buyers/mortgage-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/buyers/pre-approval`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/buyers/relocation`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // Sellers
    { url: `${BASE_URL}/sellers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/sellers/home-valuation`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/sellers/selling-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // Investors
    { url: `${BASE_URL}/investors`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/investors/roi-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

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
    { url: `${BASE_URL}/cookie-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // 2. Cities: the /cities index, /cities/[state] hubs, and every /cities/[city] page
  try {
    sitemapEntries.push({ url: `${BASE_URL}/cities`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });

    const stateGroups = groupCitiesByState(CITY_DB);
    for (const group of stateGroups.values()) {
      sitemapEntries.push({
        url: `${BASE_URL}/cities/${group.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.75,
      });
    }

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

  // 3. Properties — paginated through the full result set, not a single
  //    capped call, so listings past row 100 stop silently disappearing
  //    from the sitemap as inventory grows.
  try {
    const properties = await fetchAllPages((page) => getProperties({ page }, 250));
    for (const prop of properties) {
      if (prop.slug) {
        sitemapEntries.push({
          url: `${BASE_URL}/properties/${prop.slug}`,
          lastModified: now,
          changeFrequency: "daily",
          priority: 0.7,
        });
      }
    }
  } catch (err) {
    console.error("Failed to add properties to sitemap:", err);
  }

  // 4. Agent Profiles
  try {
    const agents = await getAgents({}, 1000);
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

  // 5. Blog Posts and Categories
  try {
    const { posts } = await getBlogPosts(1000);
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
