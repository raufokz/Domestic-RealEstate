import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PropertyGrid from "@/components/properties/PropertyGrid";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, faqLd, SITE_URL } from "@/lib/seo";

interface CityData {
  name: string;
  state: string;
  country: string;
  population: string;
  medianIncome: string;
  medianHomePrice: string;
  description: string;
  neighborhoods: string[];
  schools: { name: string; rating: string; type: string }[];
  faqs: { q: string; a: string }[];
}

export const CITY_DB: Record<string, CityData> = {
  "new-york-city": {
    name: "New York City",
    state: "New York",
    country: "USA",
    population: "8,336,817",
    medianIncome: "$70,663",
    medianHomePrice: "$1,850,000",
    description:
      "Explore premier New York City real estate, exclusive NYC real estate listings, luxury condos, and spacious houses in NYC across Manhattan, Brooklyn, Queens, and beyond. Whether you are searching for property in NYC, real estate in New York City, or deciding where to buy real estate in NYC, our AI matching platform connects you to top-rated new york city homes and real estate new york city offers.",
    neighborhoods: ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island", "Williamsburg", "SoHo", "Tribeca", "Upper East Side", "Harlem"],
    schools: [
      { name: "Stuyvesant High School", rating: "10/10", type: "Public" },
      { name: "Trinity School", rating: "10/10", type: "Private" },
      { name: "New York University", rating: "9/10", type: "University" },
    ],
    faqs: [
      { q: "Where to buy real estate in NYC for maximum value?", a: "When determining where to buy real estate in NYC, top recommendations include Williamsburg in Brooklyn, Long Island City in Queens, and the Upper West Side in Manhattan. These areas offer prime new york city homes with excellent appreciation and transit access." },
      { q: "How can I search verified New York City real estate listings?", a: "You can browse verified new york city real estate listings on Domestic Real Estate. Filter by price, bedrooms, property type, and neighborhood to find luxury condos, townhouses, and houses in NYC." },
      { q: "What is the average price for property in NYC?", a: "The median home price for real estate in New York City is approximately $1,850,000. Prices vary significantly across new york city properties, with Manhattan leading in price per square foot, followed by Brooklyn and Queens." },
      { q: "Why invest in NYC real estate and new york city properties?", a: "Investing in nyc real estate and real estate new york city provides historical stability, high rental yields, and strong capital preservation due to high global demand and limited land supply." },
    ],
  },
  "los-angeles": {
    name: "Los Angeles",
    state: "California",
    country: "USA",
    population: "3,979,576",
    medianIncome: "$67,418",
    medianHomePrice: "$1,250,000",
    description:
      "Los Angeles is the cultural and entertainment capital of the world. With its diverse neighborhoods, year-round sunshine, and thriving economy, LA offers a wide range of real estate opportunities from beachfront properties to urban lofts.",
    neighborhoods: ["Beverly Hills", "Hollywood", "Santa Monica", "Venice", "Malibu", "Silver Lake", "Echo Park", "Pasadena", "Burbank", "Glendale"],
    schools: [
      { name: "Harvard-Westlake School", rating: "10/10", type: "Private" },
      { name: "University of California, Los Angeles", rating: "10/10", type: "University" },
    ],
    faqs: [
      { q: "What is the average home price in LA?", a: "The median home price in Los Angeles is approximately $1,250,000. Coastal areas like Malibu and Santa Monica command premium prices, while inland neighborhoods offer more affordable options." },
      { q: "What is the best area to buy in LA?", a: "The best area depends on your priorities. Silver Lake and Echo Park are popular with young professionals, Beverly Hills with luxury buyers, and Pasadena with families seeking a suburban feel with city access." },
    ],
  },
};

function fallbackCity(slug: string): CityData {
  const name = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    name,
    state: "",
    country: "USA",
    population: "",
    medianIncome: "",
    medianHomePrice: "",
    description: `Explore homes for sale and real estate opportunities in ${name}. Browse verified listings and connect with local agents.`,
    neighborhoods: [],
    schools: [],
    faqs: [
      { q: `What is the real estate market like in ${name}?`, a: `${name} offers opportunities for buyers, sellers, and investors. Browse current listings below and contact our local agents for detailed, up-to-date market insights.` },
    ],
  };
}

const CITY_SLUGS = [
  "new-york-city", "los-angeles", "chicago", "houston", "phoenix", "philadelphia", "san-antonio", "san-diego", "dallas", "san-jose",
  "austin", "jacksonville", "fort-worth", "columbus", "charlotte", "indianapolis", "san-francisco", "seattle", "denver", "washington",
  "nashville", "oklahoma-city", "el-paso", "boston", "portland", "las-vegas", "memphis", "louisville", "baltimore", "milwaukee",
  "albuquerque", "tucson", "fresno", "sacramento", "mesa", "kansas-city", "atlanta", "omaha", "colorado-springs", "raleigh",
  "long-beach", "virginia-beach", "miami", "oakland", "minneapolis", "tulsa", "tampa", "arlington", "new-orleans", "wichita",
  "toronto", "vancouver", "montreal", "calgary", "edmonton", "ottawa", "winnipeg", "quebec-city", "hamilton", "kitchener",
];

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params;

  // CITY_SLUGS is the curated set of city landing pages this site actually
  // publishes (matches /cities' index). Anything outside it renders a fully
  // fabricated page for whatever string the visitor typed — a soft-404.
  if (!CITY_SLUGS.includes(slug)) notFound();

  const city = CITY_DB[slug] ?? fallbackCity(slug);
  const loc = city.state ? `${city.name}, ${city.state}` : city.name;
  return buildMetadata({
    title: `${city.name} Real Estate & Homes for Sale`,
    fullTitle: `${city.name} Real Estate & Homes for Sale | Domestic Real Estate`,
    description: `Explore ${loc} real estate. Browse verified homes for sale, discover neighborhoods and schools, and connect with local agents in ${city.name}.`,
    path: `/cities/${slug}`,
    keywords: [`${city.name} real estate`, `${city.name} homes for sale`, `${city.name} property`, `buy home ${city.name}`],
  });
}

export default async function CityDetailPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;

  if (!CITY_SLUGS.includes(slug)) notFound();

  const city = CITY_DB[slug] ?? fallbackCity(slug);

  const stats = [
    city.population ? { label: "Population", value: city.population } : null,
    city.medianIncome ? { label: "Median Income", value: city.medianIncome } : null,
    city.medianHomePrice ? { label: "Median Home Price", value: city.medianHomePrice } : null,
  ].filter((s): s is { label: string; value: string } => !!s);

  const cityLd = {
    "@context": "https://schema.org",
    "@type": "City",
    name: city.name,
    url: `${SITE_URL}/cities/${slug}`,
    ...(city.state ? { containedInPlace: { "@type": "AdministrativeArea", name: city.state } } : {}),
  };

  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={[
          cityLd,
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Cities", path: "/cities" },
            { name: city.name, path: `/cities/${slug}` },
          ]),
          faqLd(city.faqs.map((f) => ({ question: f.q, answer: f.a }))),
        ]}
      />

      <section className="bg-[#0A2647] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm font-body text-white/60">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/cities" className="hover:text-white transition-colors">Cities</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white" aria-current="page">{city.name}</li>
            </ol>
          </nav>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">{city.name} Real Estate</h1>
              {city.state && <p className="font-body text-white/70 text-lg mb-2">{city.state}, {city.country}</p>}
              <p className="font-body text-white/70 leading-relaxed mt-4">{city.description}</p>
            </div>
            {stats.length > 0 && (
              <dl className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <dt className="font-body text-white/60 text-sm">{stat.label}</dt>
                    <dd className="font-heading text-xl font-bold text-white mt-1">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0A2647]">Properties in {city.name}</h2>
            <Link href="/properties" className="text-sm font-heading font-semibold text-[#C9A227] hover:text-[#0A2647]">
              View all listings →
            </Link>
          </div>
          <PropertyGrid
            query={{ city: city.name }}
            limit={6}
            emptyMessage={`We don't have active listings in ${city.name} right now. Browse all properties or contact a local agent for off-market opportunities.`}
          />
        </div>
      </section>

      {city.neighborhoods.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0A2647] mb-8">Popular Neighborhoods</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {city.neighborhoods.map((n) => (
                <li key={n} className="bg-white rounded-xl p-4 text-center border border-gray-100">
                  <span className="font-heading font-semibold text-[#0A2647] text-sm">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {(stats.length > 0 || city.schools.length > 0) && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {stats.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0A2647] mb-8">Market & Demographics</h2>
                <dl className="space-y-1">
                  {stats.map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100">
                      <dt className="font-body text-gray-600">{item.label}</dt>
                      <dd className="font-heading font-semibold text-[#0A2647]">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {city.schools.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0A2647] mb-8">Notable Schools</h2>
                <ul className="space-y-4">
                  {city.schools.map((school, i) => (
                    <li key={i} className="bg-white rounded-xl p-5 border border-gray-100 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-heading font-semibold text-[#0A2647]">{school.name}</p>
                        <p className="font-body text-gray-500 text-sm">{school.type}</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">{school.rating}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0A2647] mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {city.faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-heading font-semibold text-[#0A2647] mb-3">{faq.q}</h3>
                <p className="font-body text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
