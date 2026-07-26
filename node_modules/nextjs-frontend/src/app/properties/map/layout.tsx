import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Property Map Search",
  description:
    "Search homes and properties on an interactive map across the US & Canada. Explore listings by neighborhood, price, beds, and baths with Domestic Real Estate.",
  path: "/properties/map",
  keywords: ["property map search", "map search real estate", "homes near me map"],
});

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
