import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Pay-Per-Lead Marketplace",
  description:
    "Browse and unlock exclusive, high-intent buyer and seller leads on a first-come, first-served basis. Pay only for the leads you purchase.",
  path: "/marketplace",
  keywords: [
    "real estate lead marketplace",
    "pay per lead",
    "buy real estate leads",
    "exclusive real estate leads",
    "real estate lead exchange",
  ],
});

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
