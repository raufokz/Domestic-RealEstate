import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "SEO Services",
  description:
    "AI-powered SEO strategies — higher rankings, more organic traffic, local SEO, and content strategy that drives sustainable growth.",
  path: "/services/seo",
  keywords: [
    "SEO services",
    "search engine optimization",
    "local SEO services",
    "real estate SEO",
    "organic traffic growth",
  ],
});

export default function SEOServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
