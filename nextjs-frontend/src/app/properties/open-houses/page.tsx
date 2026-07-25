import { PageHero, CTASection } from "@/components/ui/PageTemplate";
import PropertyGrid from "@/components/properties/PropertyGrid";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, webPageLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Open Houses",
  description:
    "Find upcoming open houses near you. Browse verified listings with scheduled open-house dates across the US & Canada and plan your visit.",
  path: "/properties/open-houses",
  keywords: ["open houses", "open house near me", "upcoming open houses", "home tours"],
});

export default function OpenHousesPage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={[
          webPageLd({ name: "Open Houses", description: "Upcoming open houses.", path: "/properties/open-houses" }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Properties", path: "/properties" },
            { name: "Open Houses", path: "/properties/open-houses" },
          ]),
        ]}
      />
      <PageHero badge="Visit" title="Open Houses" subtitle="Tour homes in person — browse listings with upcoming open-house dates and plan your visit." />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid query={{ open_house: 1, sort: "created_at", direction: "desc" }} limit={9} emptyMessage="No open houses are scheduled right now. Browse all properties or contact us to arrange a private showing." />
      </section>
      <CTASection
        title="Prefer a Private Showing?"
        subtitle="Can't make an open house? We'll arrange a private tour at a time that works for you."
        primaryAction={{ label: "Request a Showing", href: "/contact" }}
        secondaryAction={{ label: "Browse All Properties", href: "/properties" }}
      />
    </main>
  );
}
