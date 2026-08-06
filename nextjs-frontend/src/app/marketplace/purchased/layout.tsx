import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "My Purchased Leads",
  description: "View your unlocked marketplace leads, full contact details, and purchase receipts.",
  path: "/marketplace/purchased",
  noindex: true,
});

export default function MarketplacePurchasedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
