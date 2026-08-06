import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Closing Cost Calculator",
  description:
    "Estimate your home buying closing costs by state, including lender fees, title insurance, escrow, and transfer taxes before you close.",
  path: "/buyers/closing-cost-calculator",
  keywords: [
    "closing cost calculator",
    "home buyer closing costs",
    "estimate closing costs by state",
    "title insurance calculator",
    "real estate closing fees",
  ],
});

export default function ClosingCostCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
