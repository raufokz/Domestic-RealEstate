import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Property Listing Services",
  description:
    "Professional photography, 3D virtual tours, AI-written descriptions, and MLS syndication that help properties sell faster.",
  path: "/services/property-listing",
  keywords: [
    "property listing services",
    "real estate photography",
    "3D virtual tours",
    "MLS syndication",
    "property marketing services",
  ],
});

export default function PropertyListingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
