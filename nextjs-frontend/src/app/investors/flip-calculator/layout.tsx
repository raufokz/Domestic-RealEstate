import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Fix and Flip Calculator (70% Rule)",
  description:
    "Apply the 70% rule to a fix-and-flip deal to find your maximum offer price, projected profit, ROI, and monthly return on any rehab project.",
  path: "/investors/flip-calculator",
  keywords: [
    "flip calculator",
    "70 percent rule calculator",
    "fix and flip calculator",
    "house flipping ROI",
    "maximum allowable offer calculator",
  ],
});

export default function FlipCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
