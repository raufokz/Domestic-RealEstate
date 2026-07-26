import { PageHero, CTASection } from "@/components/ui/PageTemplate";
import PropertyGrid from "@/components/properties/PropertyGrid";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, webPageLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Featured Properties",
  description:
    "Explore our hand-picked featured properties — standout homes and investments across the US & Canada, updated regularly. View photos, prices, and details.",
  path: "/properties/featured",
  keywords: ["featured properties", "hand-picked listings", "best homes for sale"],
});

export default function FeaturedPage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={[
          webPageLd({ name: "Featured Properties", description: "Hand-picked featured listings.", path: "/properties/featured" }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Properties", path: "/properties" },
            { name: "Featured", path: "/properties/featured" },
          ]),
        ]}
      />
      <PageHero badge="Featured" title="Featured Properties" subtitle="A curated selection of standout homes and investment opportunities." />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid query={{ featured: 1 }} limit={9} emptyMessage="No featured listings right now. Browse all properties to see what's available." />
      </section>
      <CTASection
        title="See Something You Like?"
        subtitle="Connect with an agent to schedule a viewing or ask questions about any listing."
        primaryAction={{ label: "Contact an Agent", href: "/contact" }}
        secondaryAction={{ label: "Browse All Properties", href: "/properties" }}
      />
    </main>
  );
}
