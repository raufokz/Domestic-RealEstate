import { PageHero, CTASection } from "@/components/ui/PageTemplate";
import PropertyGrid from "@/components/properties/PropertyGrid";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, webPageLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Rental Properties",
  description:
    "Discover verified rental homes, apartments, and condos for rent across the US & Canada. View photos, monthly pricing, and details, and inquire online.",
  path: "/properties/for-rent",
  keywords: ["homes for rent", "apartments for rent", "rentals", "properties for rent"],
});

export default function ForRentPage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={[
          webPageLd({ name: "Rental Properties", description: "Verified rental listings.", path: "/properties/for-rent" }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Properties", path: "/properties" },
            { name: "For Rent", path: "/properties/for-rent" },
          ]),
        ]}
      />
      <PageHero badge="Rent" title="Rental Properties" subtitle="Browse verified rental homes, apartments, and condos ready for your next move." />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid query={{ price_type: "rent" }} limit={9} emptyMessage="No rentals are listed right now. Browse all properties or check back soon." />
      </section>
      <CTASection
        title="Looking for the Right Rental?"
        subtitle="Tell us what you need and we'll help match you with the right home."
        primaryAction={{ label: "Contact Us", href: "/contact" }}
        secondaryAction={{ label: "Browse All Properties", href: "/properties" }}
      />
    </main>
  );
}
