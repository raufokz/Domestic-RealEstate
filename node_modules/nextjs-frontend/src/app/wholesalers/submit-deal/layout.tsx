import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Submit a Wholesale Deal",
  description:
    "Submit your wholesale property deal — address, asking price, ARV, and repair estimate — for review by our team within 24 hours.",
  path: "/wholesalers/submit-deal",
  keywords: [
    "submit wholesale deal",
    "wholesale property submission",
    "ARV calculator deal",
    "wholesale real estate deal",
  ],
});

export default function SubmitDealLayout({ children }: { children: React.ReactNode }) {
  return children;
}
