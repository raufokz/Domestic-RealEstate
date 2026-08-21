import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import AnswerBlock from "@/components/seo/AnswerBlock";
import { buildMetadata, breadcrumbLd } from "@/lib/seo";
import type { StateGroup } from "@/lib/cityStates";
import type { CityData } from "./page";

/**
 * Renders at the same /cities/[x] route as the city detail page — Next.js
 * App Router does not allow two sibling dynamic segments with different
 * param names (`[state]` next to `[city]`), so a state hub can't be a
 * separate route folder without either breaking every already-indexed
 * `/cities/{city}` URL (renaming the segment) or nesting under it
 * (`/cities/[state]/[city]`, the same migration problem). Disambiguating
 * inside the one dynamic segment keeps every existing city URL unchanged.
 *
 * Takes the resolved StateGroup as a prop rather than looking it up itself,
 * so this file has no import edge back into page.tsx / cityStates.ts beyond
 * the CityData type — page.tsx (which already holds CITY_DB) resolves the
 * group and passes it down.
 */
export function buildStateMetadata(stateSlug: string, group: StateGroup<CityData> | undefined): Metadata {
  if (!group) return { title: "State Not Found", robots: { index: false, follow: true } };

  const cityNames = group.cities.slice(0, 4).map((c) => c.data.name);
  return buildMetadata({
    title: `${group.state} Real Estate — Homes for Sale by City`,
    description: `Browse verified real estate listings across ${group.cities.length} ${group.state} ${group.cities.length === 1 ? "market" : "markets"}, including ${cityNames.join(", ")}. Median home prices, neighborhoods, and local market data by city.`,
    path: `/cities/${stateSlug}`,
  });
}

export default function StateHubPage({ stateSlug, group }: { stateSlug: string; group: StateGroup<CityData> | undefined }) {
  if (!group) notFound();

  const withPrice = group.cities.filter((c) => c.data.medianHomePrice);
  const priceOf = (c: { data: CityData }) => parseInt(c.data.medianHomePrice.replace(/[^0-9]/g, ""), 10);
  const lowCity = withPrice.length ? withPrice.reduce((a, b) => (priceOf(a) < priceOf(b) ? a : b)) : null;
  const highCity = withPrice.length ? withPrice.reduce((a, b) => (priceOf(a) > priceOf(b) ? a : b)) : null;

  const faqItems = [
    {
      question: `How many ${group.state} cities does Domestic Real Estate cover?`,
      answer: `Domestic Real Estate has dedicated local market pages for ${group.cities.length} ${group.state} ${group.cities.length === 1 ? "city" : "cities"}: ${group.cities.map((c) => c.data.name).join(", ")}.`,
    },
    ...(lowCity && highCity && lowCity.slug !== highCity.slug
      ? [
          {
            question: `Which ${group.state} city has the most affordable homes?`,
            answer: `Among the ${group.state} markets covered here, ${lowCity.data.name} has the lowest median home price at ${lowCity.data.medianHomePrice}, while ${highCity.data.name} has the highest at ${highCity.data.medianHomePrice}.`,
          },
        ]
      : []),
  ];

  return (
    <main className="min-h-screen bg-slate-50/50">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Cities", path: "/cities" },
          { name: group.state, path: `/cities/${stateSlug}` },
        ])}
      />

      <section className="relative bg-[#0A2647] text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#C9A227] text-xs font-bold uppercase tracking-wider mb-2">
            {group.cities.length} {group.cities.length === 1 ? "Market" : "Markets"} Covered
          </p>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold">{group.state} Real Estate</h1>
          <p className="mt-4 text-slate-200 max-w-2xl">
            Local market data, verified listings, and connected agents across {group.cities.length}{" "}
            {group.state} {group.cities.length === 1 ? "city" : "cities"}
            {lowCity && highCity ? `, with median prices from ${lowCity.data.medianHomePrice} to ${highCity.data.medianHomePrice}` : ""}.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {group.cities.map((c) => (
            <Link
              key={c.slug}
              href={`/cities/${c.slug}`}
              className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-[#C9A227] hover:shadow-md transition-all"
            >
              <h2 className="font-heading font-bold text-[#0A2647]">{c.data.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {c.data.medianHomePrice ? `Median ${c.data.medianHomePrice}` : "View local market data"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {faqItems.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <AnswerBlock heading={`${group.state} Real Estate: Frequently Asked Questions`} items={faqItems} />
        </section>
      )}
    </main>
  );
}
