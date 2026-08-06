import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Mortgage Calculator",
  description:
    "Calculate your estimated monthly mortgage payment, total interest, and a 10-year amortization schedule based on price, rate, and term.",
  path: "/buyers/mortgage-calculator",
  keywords: [
    "mortgage calculator",
    "monthly mortgage payment calculator",
    "amortization schedule calculator",
    "home loan calculator",
    "mortgage interest calculator",
  ],
});

export default function MortgageCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
