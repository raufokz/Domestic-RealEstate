import { NextResponse } from "next/server";
import { getProperties } from "@/lib/properties";
import { getAgents } from "@/lib/agents";
import { getBlogPosts } from "@/lib/blog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.domesticrealestate.us";

export async function GET() {
  const now = new Date().toISOString();
  const urls: string[] = [];

  // Fetch dynamic Properties
  try {
    const properties = await getProperties({}, 100);
    for (const prop of properties) {
      if (prop.slug) {
        urls.push(`  <url>
    <loc>${BASE_URL}/properties/${prop.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    }
  } catch (e) {
    console.error("Sitemap: Failed to query properties:", e);
  }

  // Fetch dynamic Agent profiles
  try {
    const agents = await getAgents({}, 100);
    for (const agent of agents) {
      if (agent.slug) {
        urls.push(`  <url>
    <loc>${BASE_URL}/agents/${agent.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    }
  } catch (e) {
    console.error("Sitemap: Failed to query agents:", e);
  }

  // Fetch dynamic blog posts and categories
  try {
    const { posts } = await getBlogPosts(100);
    const categorySlugs = new Set<string>();

    for (const post of posts) {
      if (post.slug) {
        const postDate = post.published_at ? new Date(post.published_at).toISOString() : now;
        urls.push(`  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
      if (post.category?.slug) {
        categorySlugs.add(post.category.slug);
      }
    }

    for (const catSlug of categorySlugs) {
      urls.push(`  <url>
    <loc>${BASE_URL}/blog/category/${catSlug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  } catch (e) {
    console.error("Sitemap: Failed to query blog posts:", e);
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
