import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Define Your Investment Buy Box",
  description:
    "Set your investment criteria — property type, price range, target ROI, and preferred areas — and we'll match you with deals automatically.",
  path: "/investors/buy-box",
  keywords: [
    "investor buy box",
    "real estate investment criteria",
    "deal matching",
    "investment property criteria",
    "buy and hold criteria",
  ],
});

export default function BuyBoxLayout({ children }: { children: React.ReactNode }) {
  return children;
}
