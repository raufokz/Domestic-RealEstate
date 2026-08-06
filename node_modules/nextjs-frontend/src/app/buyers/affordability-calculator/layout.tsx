import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Home Affordability Calculator",
  description:
    "Find out how much home you can afford based on your income, debts, and down payment using the 28/36 debt-to-income rule.",
  path: "/buyers/affordability-calculator",
  keywords: [
    "home affordability calculator",
    "how much house can I afford",
    "debt-to-income ratio calculator",
    "mortgage affordability",
    "home buying budget calculator",
  ],
});

export default function AffordabilityCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
