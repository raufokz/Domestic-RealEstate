import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Join Our Wholesale Buyer List",
  description:
    "Get exclusive access to off-market wholesale deals matched to your investment budget, preferred areas, and property types.",
  path: "/wholesalers/buyer-list",
  keywords: [
    "wholesale buyer list",
    "off-market deals",
    "wholesale buyers network",
    "cash buyer list real estate",
  ],
});

export default function BuyerListLayout({ children }: { children: React.ReactNode }) {
  return children;
}
