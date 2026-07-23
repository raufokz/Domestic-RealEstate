import { PageHero, CTASection } from "@/components/ui/PageTemplate";
import PropertyGrid from "@/components/properties/PropertyGrid";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, webPageLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Investment Properties",
  description:
    "Discover investment properties and income opportunities across the US & Canada. Analyze deals with our ROI, cap-rate, and cash-flow calculators.",
  path: "/properties/investment",
  keywords: ["investment properties", "income properties", "real estate investing", "rental investments"],
});

export default function InvestmentPage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={[
          webPageLd({ name: "Investment Properties", description: "Investment and income opportunities.", path: "/properties/investment" }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Properties", path: "/properties" },
            { name: "Investment", path: "/properties/investment" },
          ]),
        ]}
      />
      <PageHero badge="Invest" title="Investment Properties" subtitle="Curated income and value-add opportunities for investors who want the numbers to work." />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid query={{ premium: 1 }} limit={9} emptyMessage="No investment listings are highlighted right now. Explore our investor tools or browse all properties." />
      </section>
      <CTASection
        title="Analyze Your Next Deal"
        subtitle="Use our investor calculators to estimate ROI, cap rate, and cash flow before you commit."
        primaryAction={{ label: "Investor Services", href: "/investors" }}
        secondaryAction={{ label: "Deal Analyzer", href: "/investors/deal-analyzer" }}
      />
    </main>
  );
}
