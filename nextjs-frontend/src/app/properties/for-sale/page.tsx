import { PageHero, CTASection } from "@/components/ui/PageTemplate";
import PropertyGrid from "@/components/properties/PropertyGrid";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, webPageLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Homes for Sale",
  description:
    "Browse verified homes for sale across the US & Canada — single-family homes, condos, townhomes, and estates. View photos, prices, and details, and schedule a viewing.",
  path: "/properties/for-sale",
  keywords: ["homes for sale", "houses for sale", "buy a home", "real estate for sale"],
});

export default function ForSalePage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={[
          webPageLd({ name: "Homes for Sale", description: "Verified homes for sale.", path: "/properties/for-sale" }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Properties", path: "/properties" },
            { name: "For Sale", path: "/properties/for-sale" },
          ]),
        ]}
      />
      <PageHero badge="Buy" title="Homes for Sale" subtitle="Find your next home from our selection of verified listings across prime locations." />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid query={{ price_type: "sale" }} limit={9} emptyMessage="No homes for sale are listed right now. Browse all properties or check back soon." />
      </section>
      <CTASection
        title="Ready to Buy Your Dream Home?"
        subtitle="Our expert agents will guide you through every step of the home-buying process."
        primaryAction={{ label: "Talk to an Agent", href: "/contact" }}
        secondaryAction={{ label: "Mortgage Calculator", href: "/buyers/mortgage-calculator" }}
      />
    </main>
  );
}
