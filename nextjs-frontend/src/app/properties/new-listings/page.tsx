import { PageHero, CTASection } from "@/components/ui/PageTemplate";
import PropertyGrid from "@/components/properties/PropertyGrid";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, webPageLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "New Listings",
  description:
    "Be first to see the newest homes on the market. Browse the latest verified property listings across the US & Canada, updated daily.",
  path: "/properties/new-listings",
  keywords: ["new listings", "newest homes for sale", "latest properties", "just listed"],
});

export default function NewListingsPage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={[
          webPageLd({ name: "New Listings", description: "The newest verified listings.", path: "/properties/new-listings" }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Properties", path: "/properties" },
            { name: "New Listings", path: "/properties/new-listings" },
          ]),
        ]}
      />
      <PageHero badge="New" title="New Listings" subtitle="The latest homes to hit the market — be the first to take a look." />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid query={{ sort: "created_at", direction: "desc" }} limit={9} emptyMessage="No new listings yet. Browse all properties to see what's available." />
      </section>
      <CTASection
        title="Never Miss a New Home"
        subtitle="Talk to our team about setting up alerts for listings that match what you're looking for."
        primaryAction={{ label: "Contact Us", href: "/contact" }}
        secondaryAction={{ label: "Browse All Properties", href: "/properties" }}
      />
    </main>
  );
}
