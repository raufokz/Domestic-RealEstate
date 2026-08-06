import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Real Estate ROI Calculator",
  description:
    "Calculate your total return on an investment property, combining net operating income, cap rate, cash flow, and annual appreciation.",
  path: "/investors/roi-calculator",
  keywords: [
    "real estate ROI calculator",
    "cash on cash return calculator",
    "investment property return calculator",
    "cap rate and appreciation calculator",
    "rental property ROI",
  ],
});

export default function ROICalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
