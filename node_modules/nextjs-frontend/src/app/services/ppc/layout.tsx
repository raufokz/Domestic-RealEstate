import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "PPC & Paid Ads Management",
  description:
    "Data-driven PPC campaigns across Google, Meta, TikTok, and LinkedIn with A/B testing, real-time optimization, and transparent ROI reporting.",
  path: "/services/ppc",
  keywords: [
    "PPC management services",
    "paid search advertising",
    "Google Ads management",
    "pay per click marketing",
    "paid media management",
  ],
});

export default function PPCServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
