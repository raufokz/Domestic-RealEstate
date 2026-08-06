import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Request a Free Home Valuation",
  description:
    "Get a free, data-driven home valuation — AI-powered value estimate, comparable sales in your neighborhood, and a recommended listing price.",
  path: "/sellers/request-valuation",
  keywords: [
    "free home valuation",
    "what's my home worth",
    "comparative market analysis",
    "CMA request",
    "home value estimate",
  ],
});

export default function RequestValuationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
