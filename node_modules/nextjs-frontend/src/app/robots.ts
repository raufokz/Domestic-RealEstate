import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://domesticrealestate.us";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/agent/dashboard/", "/super-admin/", "/contracts/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
