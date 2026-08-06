import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Digital Advertising Services",
  description:
    "Targeted Meta, Google, TikTok, and LinkedIn ad campaigns with audience targeting, budget optimization, and conversion tracking that convert.",
  path: "/services/ads",
  keywords: [
    "digital advertising services",
    "real estate PPC ads",
    "Meta ads management",
    "Google ads for real estate",
    "paid social advertising",
  ],
});

export default function AdsServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
