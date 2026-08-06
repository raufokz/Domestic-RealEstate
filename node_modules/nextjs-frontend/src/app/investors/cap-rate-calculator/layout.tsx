import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Cap Rate Calculator",
  description:
    "Calculate the capitalization rate of an investment property from purchase price and net operating income to compare deals and evaluate yield.",
  path: "/investors/cap-rate-calculator",
  keywords: [
    "cap rate calculator",
    "capitalization rate calculator",
    "real estate investment yield",
    "net operating income calculator",
    "property investment analysis",
  ],
});

export default function CapRateCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
