import { PageHero, CTASection } from "@/components/ui/PageTemplate";
import PropertyGrid from "@/components/properties/PropertyGrid";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, webPageLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Luxury Properties",
  description:
    "Explore exclusive luxury estates and high-end residences across the US & Canada. Discreet, personalized service for discerning buyers.",
  path: "/properties/luxury",
  keywords: ["luxury homes", "luxury real estate", "estates for sale", "high-end residences"],
});

export default function LuxuryPropertiesPage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={[
          webPageLd({ name: "Luxury Properties", description: "Exclusive luxury estates and residences.", path: "/properties/luxury" }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Properties", path: "/properties" },
            { name: "Luxury", path: "/properties/luxury" },
          ]),
        ]}
      />
      <PageHero badge="Premium" title="Luxury Properties" subtitle="Exclusive estates and high-end residences for discerning buyers seeking the finest homes." bg="burgundy" />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid query={{ min_price: 1000000, sort: "price", direction: "desc" }} limit={9} emptyMessage="No luxury listings are available right now. Browse all properties or contact our team for private opportunities." />
      </section>
      <CTASection
        title="Experience Luxury Living"
        subtitle="Our luxury specialists provide discreet, personalized service for high-net-worth clients."
        primaryAction={{ label: "Request a Private Consultation", href: "/contact" }}
        secondaryAction={{ label: "View All Properties", href: "/properties" }}
        bg="burgundy"
      />
    </main>
  );
}
