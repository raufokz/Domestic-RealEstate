import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Investment Deal Analyzer",
  description:
    "Run the numbers on any investment property — enter purchase price, repair costs, ARV, and holding costs to see profit and ROI instantly.",
  path: "/investors/deal-analyzer",
  keywords: [
    "real estate deal analyzer",
    "investment property calculator",
    "ROI calculator real estate",
    "after repair value calculator",
    "property deal analysis tool",
  ],
});

export default function DealAnalyzerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
