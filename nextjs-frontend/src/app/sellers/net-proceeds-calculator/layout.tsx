import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Home Sale Net Proceeds Calculator",
  description:
    "Estimate how much you'll walk away with after selling your home, factoring in your mortgage payoff, agent commission, and closing costs.",
  path: "/sellers/net-proceeds-calculator",
  keywords: [
    "net proceeds calculator",
    "home sale proceeds calculator",
    "how much will I make selling my house",
    "seller closing costs calculator",
    "home equity after sale calculator",
  ],
});

export default function NetProceedsCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
