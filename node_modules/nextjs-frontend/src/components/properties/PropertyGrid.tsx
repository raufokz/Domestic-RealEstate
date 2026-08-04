import Link from "next/link";
import Image from "next/image";
import { getProperties, formatPrice, propertyPhotoPaths, type PublicProperty } from "@/lib/properties";
import { storageUrl } from "@/lib/media";

interface Props {
  query?: Record<string, string | number | boolean | undefined>;
  limit?: number;
  /** Message shown when no listings match (honest empty state). */
  emptyMessage?: string;
}

function PropertyCard({ p }: { p: PublicProperty }) {
  const img = storageUrl(propertyPhotoPaths(p)[0]);
  const location = [p.city, p.state].filter(Boolean).join(", ");
  return (
    <Link
      href={`/properties/${p.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
    >
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        {img ? (
          <Image src={img} alt={`${p.title}${location ? ` in ${location}` : ""}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div aria-hidden="true" className="w-full h-full bg-gradient-to-br from-[#0A2647]/10 to-[#C9A227]/10" />
        )}
        {p.propertyType?.name && (
          <span className="absolute top-4 left-4 bg-white/90 text-[#0A2647] text-xs font-heading font-semibold px-3 py-1 rounded-full">
            {p.propertyType.name}
          </span>
        )}
      </div>
      <div className="p-6">
        <p className="font-heading text-2xl font-bold text-[#0A2647] mb-1">{formatPrice(p.price)}</p>
        <p className="font-body text-gray-800 font-medium truncate">{p.title}</p>
        {location && <p className="font-body text-gray-500 text-sm mb-3">{location}</p>}
        <div className="flex items-center gap-4 text-sm text-gray-600 font-body border-t border-gray-100 pt-3">
          {p.bedrooms != null && <span>{p.bedrooms} beds</span>}
          {p.bathrooms != null && <span>{p.bathrooms} baths</span>}
          {p.sqft != null && <span>{p.sqft.toLocaleString()} sqft</span>}
        </div>
      </div>
    </Link>
  );
}

/**
 * Server-rendered grid of real listings for SEO landing pages. Fetches from the
 * public /properties API with the given filters. Shows an honest empty state
 * (never fabricated listings) when nothing matches.
 */
export default async function PropertyGrid({ query = {}, limit = 9, emptyMessage }: Props) {
  const properties = await getProperties(query, limit);

  if (properties.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
        <div aria-hidden="true" className="text-4xl mb-3">🏡</div>
        <h2 className="font-heading text-lg font-bold text-[#0A2647] mb-2">No listings to show yet</h2>
        <p className="font-body text-gray-500 text-sm mb-6">
          {emptyMessage ?? "There are no matching properties right now. Check back soon or browse all listings."}
        </p>
        <Link
          href="/properties"
          className="inline-block !bg-[#C9A227] !text-[#0A2647] font-heading font-semibold px-6 py-3 rounded-lg hover:!bg-[#b8911f] hover:!text-[#0A2647] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2647]"
        >
          Browse All Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((p) => (
        <PropertyCard key={p.id} p={p} />
      ))}
    </div>
  );
}
