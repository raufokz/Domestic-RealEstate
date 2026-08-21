import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd } from "@/lib/seo";
import { groupCitiesByState } from "@/lib/cityStates";
import { CITY_DB } from "./[city]/page";

export const metadata = buildMetadata({
  title: "US Real Estate by State & City",
  description:
    "Browse local real estate market data across US states and cities — median home prices, neighborhoods, schools, and verified listings.",
  path: "/cities",
});

export default function CitiesIndexPage() {
  const groups = [...groupCitiesByState(CITY_DB).values()].sort((a, b) => a.state.localeCompare(b.state));

  return (
    <main className="min-h-screen bg-slate-50/50">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Cities", path: "/cities" },
        ])}
      />

      <section className="relative bg-[#0A2647] text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#C9A227] text-xs font-bold uppercase tracking-wider mb-2">
            {groups.length} States · {groups.reduce((n, g) => n + g.cities.length, 0)} Markets
          </p>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold">US Real Estate by State</h1>
          <p className="mt-4 text-slate-200 max-w-2xl">
            Local market data and verified listings across {groups.length} states.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <Link
              key={g.slug}
              href={`/cities/${g.slug}`}
              className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-[#C9A227] hover:shadow-md transition-all"
            >
              <h2 className="font-heading font-bold text-[#0A2647]">{g.state}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {g.cities.length} {g.cities.length === 1 ? "market" : "markets"} — {g.cities.map((c) => c.data.name).join(", ")}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
