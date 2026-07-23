import { PageHero, CTASection } from "@/components/ui/PageTemplate";
import PropertyGrid from "@/components/properties/PropertyGrid";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, webPageLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Commercial Properties",
  description:
    "Browse commercial real estate for sale and lease — office, retail, industrial, and mixed-use properties across the US & Canada.",
  path: "/properties/commercial",
  keywords: ["commercial real estate", "office space for sale", "retail property", "industrial property"],
});

export default function CommercialPage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={[
          webPageLd({ name: "Commercial Properties", description: "Commercial real estate listings.", path: "/properties/commercial" }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Properties", path: "/properties" },
            { name: "Commercial", path: "/properties/commercial" },
          ]),
        ]}
      />
      <PageHero badge="Commercial" title="Commercial Properties" subtitle="Office, retail, industrial, and mixed-use opportunities for businesses and investors." />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid query={{ property_type: "commercial" }} limit={9} emptyMessage="No commercial listings are available right now. Contact our team about commercial opportunities." />
      </section>
      <CTASection
        title="Find the Right Commercial Space"
        subtitle="Our commercial specialists help businesses and investors find and close the right deals."
        primaryAction={{ label: "Contact Our Team", href: "/contact" }}
        secondaryAction={{ label: "Investor Services", href: "/investors" }}
      />
    </main>
  );
}
