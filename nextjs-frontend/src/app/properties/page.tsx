import PropertySearchClient from "@/components/properties/PropertySearchClient";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, webPageLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Properties for Sale & Rent",
  description:
    "Browse verified homes, condos, luxury estates, commercial, and investment properties across the US & Canada. Search by city, price, beds, and baths with interactive map view.",
  path: "/properties",
  keywords: [
    "properties for sale",
    "real estate listings",
    "homes for sale",
    "property search",
    "rentals",
    "commercial real estate",
  ],
});

export default function PropertiesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <JsonLd
        data={[
          webPageLd({
            name: "Properties for Sale & Rent",
            description: "Browse verified residential and commercial real estate listings.",
            path: "/properties",
          }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Properties", path: "/properties" },
          ]),
        ]}
      />

      {/* Hero Section */}
      <section className="relative bg-[#0A2647] text-white py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              MLS & Off-Market Listings
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white">
            Find Your Next <span className="text-[#C9A227]">Property</span>
          </h1>
          <p className="mt-4 text-base sm:text-xl text-slate-200 max-w-2xl mx-auto font-body">
            Browse verified listings across top neighborhoods with intelligent filter options, interactive map view, and instant scheduling.
          </p>
        </div>
      </section>

      {/* Interactive Search, Map & Property Grid Client Component */}
      <PropertySearchClient />
    </main>
  );
}
