import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Rental Cash Flow Calculator",
  description:
    "Calculate monthly and annual cash flow on a rental property by accounting for rent, mortgage, taxes, insurance, maintenance, and vacancy.",
  path: "/investors/cash-flow-calculator",
  keywords: [
    "cash flow calculator",
    "rental property cash flow",
    "real estate investment calculator",
    "rental income expense calculator",
    "landlord cash flow analysis",
  ],
});

export default function CashFlowCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
