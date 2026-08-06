import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Free Home Value Estimate",
  description: "Get a free, instant AI-powered estimate of your home's value. Enter your address and property details for a low, high, and estimated market value.",
  path: "/sellers/home-valuation",
  keywords: [
    "home value estimate",
    "what is my home worth",
    "free home valuation",
    "property value calculator",
    "sell my house",
  ],
});

export default function HomeValuationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
